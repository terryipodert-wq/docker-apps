/**
 * Settings State Store (Zustand)
 * Manages app settings and preferences
 */

import { create } from 'zustand';
import StorageService from '../services/StorageService';

const createSettingsStore = (set, get) => ({
  // State
  themeMode: 'light', // 'light', 'dark', 'system'
  mockMode: true,
  dockerUrl: 'http://localhost:2375',
  vmRam: 2048,
  vmCpu: 2,
  isFirstLaunch: true,
  favoriteContainers: [],
  
  // Loading state
  isLoading: true,
  
  // ============================================
  // INITIALIZATION
  // ============================================

  loadSettings: async () => {
    set({ isLoading: true });
    
    try {
      const [
        themeMode,
        mockMode,
        dockerUrl,
        vmRam,
        vmCpu,
        isFirstLaunch,
        favoriteContainers,
      ] = await Promise.all([
        StorageService.getThemeMode(),
        StorageService.getMockMode(),
        StorageService.getDockerUrl(),
        StorageService.getVmRam(),
        StorageService.getVmCpu(),
        StorageService.isFirstLaunch(),
        StorageService.getFavoriteContainers(),
      ]);
      
      set({
        themeMode,
        mockMode,
        dockerUrl,
        vmRam,
        vmCpu,
        isFirstLaunch,
        favoriteContainers,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ isLoading: false });
    }
  },

  // ============================================
  // THEME
  // ============================================

  setThemeMode: async (mode) => {
    await StorageService.setThemeMode(mode);
    set({ themeMode: mode });
  },

  toggleTheme: async () => {
    const { themeMode } = get();
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    await StorageService.setThemeMode(newMode);
    set({ themeMode: newMode });
  },

  isDarkMode: () => {
    const { themeMode } = get();
    return themeMode === 'dark';
  },

  // ============================================
  // MOCK MODE
  // ============================================

  setMockMode: async (enabled) => {
    await StorageService.setMockMode(enabled);
    set({ mockMode: enabled });
  },

  toggleMockMode: async () => {
    const { mockMode } = get();
    const newMode = !mockMode;
    await StorageService.setMockMode(newMode);
    set({ mockMode: newMode });
  },

  // ============================================
  // DOCKER SETTINGS
  // ============================================

  setDockerUrl: async (url) => {
    await StorageService.setDockerUrl(url);
    set({ dockerUrl: url });
  },

  // ============================================
  // VM SETTINGS
  // ============================================

  setVmRam: async (ram) => {
    await StorageService.setVmRam(ram);
    set({ vmRam: ram });
  },

  setVmCpu: async (cpu) => {
    await StorageService.setVmCpu(cpu);
    set({ vmCpu: cpu });
  },

  // ============================================
  // FIRST LAUNCH
  // ============================================

  completeFirstLaunch: async () => {
    await StorageService.setFirstLaunchComplete();
    set({ isFirstLaunch: false });
  },

  // ============================================
  // FAVORITES
  // ============================================

  addFavorite: async (containerId) => {
    const { favoriteContainers } = get();
    if (!favoriteContainers.includes(containerId)) {
      const newFavorites = [...favoriteContainers, containerId];
      await StorageService.setFavoriteContainers(newFavorites);
      set({ favoriteContainers: newFavorites });
    }
  },

  removeFavorite: async (containerId) => {
    const { favoriteContainers } = get();
    const newFavorites = favoriteContainers.filter(id => id !== containerId);
    await StorageService.setFavoriteContainers(newFavorites);
    set({ favoriteContainers: newFavorites });
  },

  toggleFavorite: async (containerId) => {
    const { favoriteContainers } = get();
    if (favoriteContainers.includes(containerId)) {
      await get().removeFavorite(containerId);
    } else {
      await get().addFavorite(containerId);
    }
  },

  isFavorite: (containerId) => {
    const { favoriteContainers } = get();
    return favoriteContainers.includes(containerId);
  },

  // ============================================
  // RESET
  // ============================================

  resetSettings: async () => {
    await StorageService.clear();
    set({
      themeMode: 'light',
      mockMode: true,
      dockerUrl: 'http://localhost:2375',
      vmRam: 2048,
      vmCpu: 2,
      isFirstLaunch: true,
      favoriteContainers: [],
    });
  },

  clearCache: async () => {
    // Clear only cache-related storage, not user settings
    await StorageService.remove('@container_cache');
    await StorageService.remove('@image_cache');
  },
});

export const useSettingsStore = create(createSettingsStore);
