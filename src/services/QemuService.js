/**
 * QEMU Service
 * React Native bridge to native QEMU module
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { QemuModule } = NativeModules;

// Create event emitter only if native module exists
const qemuEventEmitter = QemuModule ? new NativeEventEmitter(QemuModule) : null;

// Mock implementation for development/web
const MockQemuModule = {
  initialize: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      qemuDir: '/data/data/com.dockerandroid/files/qemu',
      isoPath: '/data/data/com.dockerandroid/files/qemu/alpine-virt.iso',
      diskPath: '/data/data/com.dockerandroid/files/qemu/alpine-disk.qcow2',
    };
  },
  startVM: async (ramMB, cpuCores) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true };
  },
  stopVM: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },
  getStatus: async () => {
    return {
      status: 'running',
      uptime: 3600,
      cpuUsage: 15.5,
      memoryUsage: 45.2,
    };
  },
  sendCommand: async (command) => {
    return { output: `Executed: ${command}` };
  },
};

class QemuServiceClass {
  constructor() {
    this.listeners = [];
    this.isNativeAvailable = Platform.OS === 'android' && QemuModule !== null;
    this.module = this.isNativeAvailable ? QemuModule : MockQemuModule;
  }

  /**
   * Check if native module is available
   * @returns {boolean}
   */
  isAvailable() {
    return this.isNativeAvailable;
  }

  /**
   * Initialize QEMU environment
   * Copies Alpine ISO and creates disk image
   * @returns {Promise<Object>}
   */
  async initialize() {
    try {
      const result = await this.module.initialize();
      console.log('QEMU initialized:', result);
      return result;
    } catch (error) {
      console.error('QEMU init error:', error);
      throw error;
    }
  }

  /**
   * Start the Alpine Linux VM
   * @param {number} ramMB - RAM in MB (default 2048)
   * @param {number} cpuCores - CPU cores (default 2)
   * @returns {Promise<Object>}
   */
  async startVM(ramMB = 2048, cpuCores = 2) {
    try {
      const result = await this.module.startVM(ramMB, cpuCores);
      console.log('VM started:', result);
      return result;
    } catch (error) {
      console.error('VM start error:', error);
      throw error;
    }
  }

  /**
   * Stop the running VM
   * @returns {Promise<Object>}
   */
  async stopVM() {
    try {
      const result = await this.module.stopVM();
      console.log('VM stopped:', result);
      return result;
    } catch (error) {
      console.error('VM stop error:', error);
      throw error;
    }
  }

  /**
   * Get current VM status and stats
   * @returns {Promise<Object>}
   */
  async getStatus() {
    try {
      return await this.module.getStatus();
    } catch (error) {
      console.error('Status error:', error);
      throw error;
    }
  }

  /**
   * Send a command to the VM console
   * @param {string} command - Command to execute
   * @returns {Promise<Object>}
   */
  async sendCommand(command) {
    try {
      return await this.module.sendCommand(command);
    } catch (error) {
      console.error('Command error:', error);
      throw error;
    }
  }

  /**
   * Restart the VM
   * @returns {Promise<void>}
   */
  async restartVM() {
    await this.stopVM();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await this.startVM();
  }

  /**
   * Add event listener for QEMU events
   * @param {string} eventName - Event name (vmStatus, vmLog, vmError)
   * @param {Function} callback - Callback function
   * @returns {Object} Listener subscription
   */
  addEventListener(eventName, callback) {
    if (!qemuEventEmitter) {
      // Return mock subscription for non-Android platforms
      return {
        remove: () => {},
      };
    }
    
    const listener = qemuEventEmitter.addListener(eventName, callback);
    this.listeners.push(listener);
    return listener;
  }

  /**
   * Remove specific event listener
   * @param {Object} listener - Listener to remove
   */
  removeEventListener(listener) {
    if (listener && listener.remove) {
      listener.remove();
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners() {
    this.listeners.forEach(listener => {
      if (listener && listener.remove) {
        listener.remove();
      }
    });
    this.listeners = [];
  }

  /**
   * Get QEMU configuration
   * @returns {Object} QEMU config
   */
  getConfig() {
    return {
      minRam: 512,
      maxRam: 8192,
      defaultRam: 2048,
      minCpu: 1,
      maxCpu: 8,
      defaultCpu: 2,
      defaultDiskSize: 10, // GB
      supportedArchitectures: ['x86_64'],
      forwardedPorts: {
        docker: 2375,
        ssh: 2222,
        http: 8080,
        https: 8443,
      },
    };
  }
}

const QemuService = new QemuServiceClass();
export default QemuService;
