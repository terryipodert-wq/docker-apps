/**
 * Docker State Store (Zustand)
 * Manages all Docker-related state with mock mode support
 */

import { create } from 'zustand';
import DockerAPI from '../services/DockerAPI';
import StorageService from '../services/StorageService';
import {
  mockContainers,
  mockImages,
  mockVolumes,
  mockNetworks,
  mockContainerStats,
  mockSystemInfo,
  mockVersion,
  mockContainerLogs,
  getMockContainerDetail,
} from '../utils/mockData';

const createDockerStore = (set, get) => {
  const docker = new DockerAPI();

  return {
    // State
    containers: [],
    images: [],
    volumes: [],
    networks: [],
    systemInfo: null,
    version: null,
    selectedContainer: null,
    selectedImage: null,
    containerStats: {},
    containerLogs: {},
    
    // Loading states
    isLoading: false,
    isRefreshing: false,
    isContainerLoading: false,
    isImageLoading: false,
    isPulling: false,
    pullProgress: null,
    
    // Error state
    error: null,
    
    // Mock mode
    mockMode: true,
    dockerUrl: 'http://localhost:2375',
    isConnected: false,

    // ============================================
    // INITIALIZATION
    // ============================================

    initialize: async () => {
      const mockMode = await StorageService.getMockMode();
      const dockerUrl = await StorageService.getDockerUrl();
      
      docker.setBaseUrl(dockerUrl);
      
      set({ mockMode, dockerUrl });
      
      // Test connection
      if (!mockMode) {
        const connected = await docker.ping();
        set({ isConnected: connected });
      } else {
        set({ isConnected: true });
      }
    },

    setMockMode: async (enabled) => {
      await StorageService.setMockMode(enabled);
      set({ mockMode: enabled });
      
      if (!enabled) {
        const connected = await docker.ping();
        set({ isConnected: connected });
      } else {
        set({ isConnected: true });
      }
    },

    setDockerUrl: async (url) => {
      await StorageService.setDockerUrl(url);
      docker.setBaseUrl(url);
      set({ dockerUrl: url });
      
      const { mockMode } = get();
      if (!mockMode) {
        const connected = await docker.ping();
        set({ isConnected: connected });
      }
    },

    // ============================================
    // CONTAINER ACTIONS
    // ============================================

    fetchContainers: async () => {
      const { mockMode } = get();
      set({ isLoading: true, error: null });
      
      try {
        let containers;
        if (mockMode) {
          await new Promise(resolve => setTimeout(resolve, 500));
          containers = mockContainers;
        } else {
          containers = await docker.listContainers(true);
        }
        set({ containers, isLoading: false });
        return containers;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },

    refreshContainers: async () => {
      const { mockMode } = get();
      set({ isRefreshing: true, error: null });
      
      try {
        let containers;
        if (mockMode) {
          await new Promise(resolve => setTimeout(resolve, 300));
          containers = mockContainers;
        } else {
          containers = await docker.listContainers(true);
        }
        set({ containers, isRefreshing: false });
        return containers;
      } catch (error) {
        set({ error: error.message, isRefreshing: false });
        throw error;
      }
    },

    fetchContainer: async (id) => {
      const { mockMode } = get();
      set({ isContainerLoading: true, error: null });
      
      try {
        let container;
        if (mockMode) {
          await new Promise(resolve => setTimeout(resolve, 300));
          container = getMockContainerDetail(id);
        } else {
          container = await docker.getContainer(id);
        }
        set({ selectedContainer: container, isContainerLoading: false });
        return container;
      } catch (error) {
        set({ error: error.message, isContainerLoading: false });
        throw error;
      }
    },

    startContainer: async (id) => {
      const { mockMode, containers } = get();
      set({ error: null });
      
      try {
        if (!mockMode) {
          await docker.startContainer(id);
        }
        
        // Update local state
        const updatedContainers = containers.map(c => {
          if (c.Id.startsWith(id.substring(0, 12))) {
            return { ...c, State: 'running', Status: 'Up Less than a second' };
          }
          return c;
        });
        set({ containers: updatedContainers });
      } catch (error) {
        set({ error: error.message });
        throw error;
      }
    },

    stopContainer: async (id, timeout = 10) => {
      const { mockMode, containers } = get();
      set({ error: null });
      
      try {
        if (!mockMode) {
          await docker.stopContainer(id, timeout);
        }
        
        const updatedContainers = containers.map(c => {
          if (c.Id.startsWith(id.substring(0, 12))) {
            return { ...c, State: 'exited', Status: 'Exited (0) Less than a second ago' };
          }
          return c;
        });
        set({ containers: updatedContainers });
      } catch (error) {
        set({ error: error.message });
        throw error;
      }
    },

    restartContainer: async (id) => {
      const { mockMode } = get();
      set({ error: null });
      
      try {
        if (!mockMode) {
          await docker.restartContainer(id);
        }
        await get().fetchContainers();
      } catch (error) {
        set({ error: error.message });
        throw error;
      }
    },

    removeContainer: async (id, force = false) => {
      const { mockMode, containers } = get();
      set({ error: null });
      
      try {
        if (!mockMode) {
          await docker.removeContainer(id, force);
        }
        
        const updatedContainers = containers.filter(
          c => !c.Id.startsWith(id.substring(0, 12))
        );
        set({ containers: updatedContainers });
      } catch (error) {
        set({ error: error.message });
        throw error;
      }
    },

    createContainer: async (config) => {
      const { mockMode } = get();
      set({ error: null });
      
      try {
        let result;
        if (mockMode) {
          await new Promise(resolve => setTimeout(resolve, 500));
          result = { Id: 'new' + Date.now(), Warnings: [] };
        } else {
          result = await docker.createContainer(config);
        }
        
        await get().fetchContainers();
        return result;
      } catch (error) {
        set({ error: error.message });
        throw error;
      }
    },

    fetchContainerLogs: async (id, tail = 100) => {
      const { mockMode, containerLogs } = get();
      
      try {
        let logs;
        if (mockMode) {
          logs = mockContainerLogs;
        } else {
          logs = await docker.getContainerLogs(id, tail);
        }
        
        set({
          containerLogs: { ...containerLogs, [id]: logs },
        });
        return logs;
      } catch (error) {
        set({ error: error.message });
        throw error;
      }
    },

    fetchContainerStats: async (id) => {
      const { mockMode, containerStats } = get();
      
      try {
        let stats;
        if (mockMode) {
          stats = mockContainerStats;
        } else {
          stats = await docker.getContainerStats(id, false);
        }
        
        set({
          containerStats: { ...containerStats, [id]: stats },
        });
        return stats;
      } catch (error) {
        console.error('Stats error:', error.message);
        return null;
      }
    },

    // ============================================
    // IMAGE ACTIONS
    // ============================================

    fetchImages: async () => {
      const { mockMode } = get();
      set({ isLoading: true, error: null });
      
      try {
        let images;
        if (mockMode) {
          await new Promise(resolve => setTimeout(resolve, 500));
          images = mockImages;
        } else {
          images = await docker.listImages();
        }
        set({ images, isLoading: false });
        return images;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },

    refreshImages: async () => {
      const { mockMode } = get();
      set({ isRefreshing: true, error: null });
      
      try {
        let images;
        if (mockMode) {
          await new Promise(resolve => setTimeout(resolve, 300));
          images = mockImages;
        } else {
          images = await docker.listImages();
        }
        set({ images, isRefreshing: false });
        return images;
      } catch (error) {
        set({ error: error.message, isRefreshing: false });
        throw error;
      }
    },

    fetchImage: async (id) => {
      const { mockMode } = get();
      set({ isImageLoading: true, error: null });
      
      try {
        let image;
        if (mockMode) {
          await new Promise(resolve => setTimeout(resolve, 300));
          image = mockImages.find(i => i.Id.includes(id.substring(0, 12)));
        } else {
          image = await docker.inspectImage(id);
        }
        set({ selectedImage: image, isImageLoading: false });
        return image;
      } catch (error) {
        set({ error: error.message, isImageLoading: false });
        throw error;
      }
    },

    pullImage: async (imageName) => {
      const { mockMode } = get();
      set({ isPulling: true, pullProgress: null, error: null });
      
      try {
        if (mockMode) {
          // Simulate pull progress
          for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 300));
            set({ pullProgress: { status: 'Downloading', progress: i } });
          }
        } else {
          await docker.pullImage(imageName, (progress) => {
            set({ pullProgress: progress });
          });
        }
        
        set({ isPulling: false, pullProgress: null });
        await get().fetchImages();
      } catch (error) {
        set({ error: error.message, isPulling: false, pullProgress: null });
        throw error;
      }
    },

    removeImage: async (id, force = false) => {
      const { mockMode, images } = get();
      set({ error: null });
      
      try {
        if (!mockMode) {
          await docker.removeImage(id, force);
        }
        
        const updatedImages = images.filter(
          i => !i.Id.includes(id.substring(0, 12))
        );
        set({ images: updatedImages });
      } catch (error) {
        set({ error: error.message });
        throw error;
      }
    },

    searchImages: async (term) => {
      const { mockMode } = get();
      
      try {
        if (mockMode) {
          await new Promise(resolve => setTimeout(resolve, 500));
          return [
            { name: term, description: 'Mock search result', star_count: 100 },
          ];
        } else {
          return await docker.searchImages(term);
        }
      } catch (error) {
        set({ error: error.message });
        throw error;
      }
    },

    // ============================================
    // VOLUME ACTIONS
    // ============================================

    fetchVolumes: async () => {
      const { mockMode } = get();
      set({ isLoading: true, error: null });
      
      try {
        let result;
        if (mockMode) {
          await new Promise(resolve => setTimeout(resolve, 500));
          result = mockVolumes;
        } else {
          result = await docker.listVolumes();
        }
        set({ volumes: result.Volumes || [], isLoading: false });
        return result.Volumes || [];
      } catch (error) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },

    createVolume: async (name, config = {}) => {
      const { mockMode } = get();
      set({ error: null });
      
      try {
        if (!mockMode) {
          await docker.createVolume(name, config);
        }
        await get().fetchVolumes();
      } catch (error) {
        set({ error: error.message });
        throw error;
      }
    },

    removeVolume: async (name, force = false) => {
      const { mockMode, volumes } = get();
      set({ error: null });
      
      try {
        if (!mockMode) {
          await docker.removeVolume(name, force);
        }
        
        const updatedVolumes = volumes.filter(v => v.Name !== name);
        set({ volumes: updatedVolumes });
      } catch (error) {
        set({ error: error.message });
        throw error;
      }
    },

    // ============================================
    // NETWORK ACTIONS
    // ============================================

    fetchNetworks: async () => {
      const { mockMode } = get();
      set({ isLoading: true, error: null });
      
      try {
        let networks;
        if (mockMode) {
          await new Promise(resolve => setTimeout(resolve, 500));
          networks = mockNetworks;
        } else {
          networks = await docker.listNetworks();
        }
        set({ networks, isLoading: false });
        return networks;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },

    createNetwork: async (name, config = {}) => {
      const { mockMode } = get();
      set({ error: null });
      
      try {
        if (!mockMode) {
          await docker.createNetwork(name, config);
        }
        await get().fetchNetworks();
      } catch (error) {
        set({ error: error.message });
        throw error;
      }
    },

    removeNetwork: async (id) => {
      const { mockMode, networks } = get();
      set({ error: null });
      
      try {
        if (!mockMode) {
          await docker.removeNetwork(id);
        }
        
        const updatedNetworks = networks.filter(n => n.Id !== id && n.Name !== id);
        set({ networks: updatedNetworks });
      } catch (error) {
        set({ error: error.message });
        throw error;
      }
    },

    // ============================================
    // SYSTEM ACTIONS
    // ============================================

    fetchSystemInfo: async () => {
      const { mockMode } = get();
      set({ isLoading: true, error: null });
      
      try {
        let [systemInfo, version] = await Promise.all([
          mockMode 
            ? new Promise(resolve => setTimeout(() => resolve(mockSystemInfo), 500))
            : docker.getSystemInfo(),
          mockMode
            ? new Promise(resolve => setTimeout(() => resolve(mockVersion), 500))
            : docker.getVersion(),
        ]);
        
        set({ systemInfo, version, isLoading: false });
        return { systemInfo, version };
      } catch (error) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },

    pruneSystem: async () => {
      const { mockMode } = get();
      set({ error: null });
      
      try {
        if (!mockMode) {
          await docker.pruneSystem();
        }
        
        // Refresh all data
        await Promise.all([
          get().fetchContainers(),
          get().fetchImages(),
          get().fetchVolumes(),
          get().fetchNetworks(),
        ]);
      } catch (error) {
        set({ error: error.message });
        throw error;
      }
    },

    // ============================================
    // UTILITIES
    // ============================================

    clearError: () => set({ error: null }),
    
    clearSelectedContainer: () => set({ selectedContainer: null }),
    
    clearSelectedImage: () => set({ selectedImage: null }),

    getRunningContainers: () => {
      const { containers } = get();
      return containers.filter(c => c.State === 'running');
    },

    getStoppedContainers: () => {
      const { containers } = get();
      return containers.filter(c => c.State !== 'running');
    },
  };
};

export const useDockerStore = create(createDockerStore);
