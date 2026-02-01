/**
 * Storage Service
 * AsyncStorage wrapper with type-safe operations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

class StorageService {
  /**
   * Get a string value from storage
   * @param {string} key - Storage key
   * @param {string} defaultValue - Default value if not found
   * @returns {Promise<string>}
   */
  async getString(key, defaultValue = '') {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null ? value : defaultValue;
    } catch (error) {
      console.error(`StorageService.getString error for ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Set a string value in storage
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   * @returns {Promise<void>}
   */
  async setString(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`StorageService.setString error for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a boolean value from storage
   * @param {string} key - Storage key
   * @param {boolean} defaultValue - Default value if not found
   * @returns {Promise<boolean>}
   */
  async getBoolean(key, defaultValue = false) {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return defaultValue;
      return value === 'true';
    } catch (error) {
      console.error(`StorageService.getBoolean error for ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Set a boolean value in storage
   * @param {string} key - Storage key
   * @param {boolean} value - Value to store
   * @returns {Promise<void>}
   */
  async setBoolean(key, value) {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error(`StorageService.setBoolean error for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a number value from storage
   * @param {string} key - Storage key
   * @param {number} defaultValue - Default value if not found
   * @returns {Promise<number>}
   */
  async getNumber(key, defaultValue = 0) {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return defaultValue;
      const num = parseFloat(value);
      return isNaN(num) ? defaultValue : num;
    } catch (error) {
      console.error(`StorageService.getNumber error for ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Set a number value in storage
   * @param {string} key - Storage key
   * @param {number} value - Value to store
   * @returns {Promise<void>}
   */
  async setNumber(key, value) {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error(`StorageService.setNumber error for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get an object value from storage
   * @param {string} key - Storage key
   * @param {Object} defaultValue - Default value if not found
   * @returns {Promise<Object>}
   */
  async getObject(key, defaultValue = null) {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return defaultValue;
      return JSON.parse(value);
    } catch (error) {
      console.error(`StorageService.getObject error for ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Set an object value in storage
   * @param {string} key - Storage key
   * @param {Object} value - Value to store
   * @returns {Promise<void>}
   */
  async setObject(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`StorageService.setObject error for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Remove a value from storage
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`StorageService.remove error for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Remove multiple values from storage
   * @param {string[]} keys - Array of storage keys
   * @returns {Promise<void>}
   */
  async removeMultiple(keys) {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('StorageService.removeMultiple error:', error);
      throw error;
    }
  }

  /**
   * Clear all storage
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('StorageService.clear error:', error);
      throw error;
    }
  }

  /**
   * Get all keys in storage
   * @returns {Promise<string[]>}
   */
  async getAllKeys() {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('StorageService.getAllKeys error:', error);
      return [];
    }
  }

  // ============================================
  // CONVENIENCE METHODS FOR APP SETTINGS
  // ============================================

  async getDockerUrl() {
    return this.getString(STORAGE_KEYS.DOCKER_URL, 'http://localhost:2375');
  }

  async setDockerUrl(url) {
    return this.setString(STORAGE_KEYS.DOCKER_URL, url);
  }

  async getMockMode() {
    return this.getBoolean(STORAGE_KEYS.MOCK_MODE, true);
  }

  async setMockMode(enabled) {
    return this.setBoolean(STORAGE_KEYS.MOCK_MODE, enabled);
  }

  async getThemeMode() {
    return this.getString(STORAGE_KEYS.THEME_MODE, 'light');
  }

  async setThemeMode(mode) {
    return this.setString(STORAGE_KEYS.THEME_MODE, mode);
  }

  async getVmRam() {
    return this.getNumber(STORAGE_KEYS.VM_RAM, 2048);
  }

  async setVmRam(ram) {
    return this.setNumber(STORAGE_KEYS.VM_RAM, ram);
  }

  async getVmCpu() {
    return this.getNumber(STORAGE_KEYS.VM_CPU, 2);
  }

  async setVmCpu(cpu) {
    return this.setNumber(STORAGE_KEYS.VM_CPU, cpu);
  }

  async isFirstLaunch() {
    return this.getBoolean(STORAGE_KEYS.FIRST_LAUNCH, true);
  }

  async setFirstLaunchComplete() {
    return this.setBoolean(STORAGE_KEYS.FIRST_LAUNCH, false);
  }

  async getFavoriteContainers() {
    return this.getObject(STORAGE_KEYS.FAVORITE_CONTAINERS, []);
  }

  async setFavoriteContainers(favorites) {
    return this.setObject(STORAGE_KEYS.FAVORITE_CONTAINERS, favorites);
  }

  async addFavoriteContainer(containerId) {
    const favorites = await this.getFavoriteContainers();
    if (!favorites.includes(containerId)) {
      favorites.push(containerId);
      await this.setFavoriteContainers(favorites);
    }
  }

  async removeFavoriteContainer(containerId) {
    const favorites = await this.getFavoriteContainers();
    const index = favorites.indexOf(containerId);
    if (index > -1) {
      favorites.splice(index, 1);
      await this.setFavoriteContainers(favorites);
    }
  }

  async isFavoriteContainer(containerId) {
    const favorites = await this.getFavoriteContainers();
    return favorites.includes(containerId);
  }
}

export default new StorageService();
