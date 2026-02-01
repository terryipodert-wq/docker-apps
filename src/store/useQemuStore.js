/**
 * QEMU State Store (Zustand)
 * Manages VM lifecycle and status
 */

import { create } from 'zustand';
import QemuService from '../services/QemuService';
import StorageService from '../services/StorageService';
import { VM_STATUS, VM_CONFIG } from '../utils/constants';

const createQemuStore = (set, get) => ({
  // State
  vmStatus: VM_STATUS.STOPPED,
  vmLogs: [],
  vmStats: {
    uptime: 0,
    cpuUsage: 0,
    memoryUsage: 0,
  },
  isInitialized: false,
  qemuPaths: null,
  error: null,
  
  // Configuration
  ramMB: VM_CONFIG.DEFAULT_RAM_MB,
  cpuCores: VM_CONFIG.DEFAULT_CPU_CORES,
  
  // Status polling
  statusInterval: null,

  // ============================================
  // INITIALIZATION
  // ============================================

  loadSettings: async () => {
    const ramMB = await StorageService.getVmRam();
    const cpuCores = await StorageService.getVmCpu();
    set({ ramMB, cpuCores });
  },

  initialize: async () => {
    set({ vmStatus: VM_STATUS.INITIALIZING, error: null });
    
    try {
      const result = await QemuService.initialize();
      set({
        isInitialized: true,
        qemuPaths: result,
        vmStatus: VM_STATUS.STOPPED,
        error: null,
      });
      
      get().addLog('QEMU environment initialized successfully');
      return result;
    } catch (error) {
      set({
        vmStatus: VM_STATUS.ERROR,
        error: error.message,
      });
      get().addLog(`Initialization failed: ${error.message}`);
      throw error;
    }
  },

  // ============================================
  // VM CONTROL
  // ============================================

  startVM: async (customRamMB, customCpuCores) => {
    const { isInitialized, ramMB, cpuCores } = get();
    
    // Initialize if needed
    if (!isInitialized) {
      await get().initialize();
    }
    
    const ram = customRamMB || ramMB;
    const cpu = customCpuCores || cpuCores;
    
    set({ vmStatus: VM_STATUS.STARTING, error: null });
    get().addLog(`Starting VM with ${ram}MB RAM and ${cpu} CPU cores...`);
    
    try {
      await QemuService.startVM(ram, cpu);
      set({ vmStatus: VM_STATUS.RUNNING });
      get().addLog('VM started successfully');
      
      // Start status polling
      get().startStatusPolling();
      
      // Setup event listeners
      get().setupEventListeners();
      
    } catch (error) {
      set({
        vmStatus: VM_STATUS.ERROR,
        error: error.message,
      });
      get().addLog(`VM start failed: ${error.message}`);
      throw error;
    }
  },

  stopVM: async () => {
    set({ vmStatus: VM_STATUS.STOPPING, error: null });
    get().addLog('Stopping VM...');
    
    try {
      await QemuService.stopVM();
      set({ vmStatus: VM_STATUS.STOPPED });
      get().addLog('VM stopped successfully');
      
      // Stop polling
      get().stopStatusPolling();
      
      // Remove event listeners
      QemuService.removeAllListeners();
      
    } catch (error) {
      set({ error: error.message });
      get().addLog(`VM stop failed: ${error.message}`);
      throw error;
    }
  },

  restartVM: async () => {
    get().addLog('Restarting VM...');
    
    try {
      await get().stopVM();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await get().startVM();
      get().addLog('VM restarted successfully');
    } catch (error) {
      get().addLog(`VM restart failed: ${error.message}`);
      throw error;
    }
  },

  // ============================================
  // STATUS & MONITORING
  // ============================================

  getStatus: async () => {
    try {
      const status = await QemuService.getStatus();
      set({
        vmStats: {
          uptime: status.uptime || 0,
          cpuUsage: status.cpuUsage || 0,
          memoryUsage: status.memoryUsage || 0,
        },
      });
      return status;
    } catch (error) {
      console.error('Failed to get status:', error);
      return null;
    }
  },

  startStatusPolling: () => {
    const { statusInterval } = get();
    
    // Clear existing interval
    if (statusInterval) {
      clearInterval(statusInterval);
    }
    
    // Poll every 5 seconds
    const interval = setInterval(async () => {
      const { vmStatus } = get();
      if (vmStatus === VM_STATUS.RUNNING) {
        await get().getStatus();
      }
    }, 5000);
    
    set({ statusInterval: interval });
  },

  stopStatusPolling: () => {
    const { statusInterval } = get();
    if (statusInterval) {
      clearInterval(statusInterval);
      set({ statusInterval: null });
    }
  },

  setupEventListeners: () => {
    // Listen for VM status changes
    QemuService.addEventListener('vmStatus', (event) => {
      get().addLog(`VM Status: ${event.status}`);
      if (event.status === 'stopped') {
        set({ vmStatus: VM_STATUS.STOPPED });
      }
    });
    
    // Listen for VM logs
    QemuService.addEventListener('vmLog', (event) => {
      get().addLog(event.message);
    });
    
    // Listen for VM errors
    QemuService.addEventListener('vmError', (event) => {
      set({ error: event.message });
      get().addLog(`Error: ${event.message}`);
    });
  },

  // ============================================
  // CONFIGURATION
  // ============================================

  setRamMB: async (ram) => {
    if (ram >= VM_CONFIG.MIN_RAM_MB && ram <= VM_CONFIG.MAX_RAM_MB) {
      await StorageService.setVmRam(ram);
      set({ ramMB: ram });
    }
  },

  setCpuCores: async (cores) => {
    if (cores >= VM_CONFIG.MIN_CPU_CORES && cores <= VM_CONFIG.MAX_CPU_CORES) {
      await StorageService.setVmCpu(cores);
      set({ cpuCores: cores });
    }
  },

  // ============================================
  // CONSOLE
  // ============================================

  sendCommand: async (command) => {
    try {
      get().addLog(`> ${command}`);
      const result = await QemuService.sendCommand(command);
      if (result.output) {
        get().addLog(result.output);
      }
      return result;
    } catch (error) {
      get().addLog(`Command failed: ${error.message}`);
      throw error;
    }
  },

  // ============================================
  // LOGS
  // ============================================

  addLog: (message) => {
    set((state) => ({
      vmLogs: [
        ...state.vmLogs,
        {
          timestamp: new Date().toISOString(),
          message,
        },
      ].slice(-200), // Keep last 200 logs
    }));
  },

  clearLogs: () => {
    set({ vmLogs: [] });
  },

  // ============================================
  // UTILITIES
  // ============================================

  clearError: () => set({ error: null }),

  isVmRunning: () => {
    const { vmStatus } = get();
    return vmStatus === VM_STATUS.RUNNING;
  },

  isVmBusy: () => {
    const { vmStatus } = get();
    return [VM_STATUS.STARTING, VM_STATUS.STOPPING, VM_STATUS.INITIALIZING].includes(vmStatus);
  },

  getConfig: () => QemuService.getConfig(),
});

export const useQemuStore = create(createQemuStore);
