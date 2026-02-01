/**
 * Docker API Client
 * Full implementation with real HTTP calls to Docker Engine API
 */

import axios from 'axios';
import { API_CONFIG, ERROR_MESSAGES } from '../utils/constants';

class DockerAPI {
  constructor(baseUrl = API_CONFIG.DEFAULT_DOCKER_URL) {
    this.baseUrl = baseUrl;
    this.axios = axios.create({
      baseURL: baseUrl,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.axios.interceptors.response.use(
      response => response,
      error => this.handleError(error)
    );
  }

  setBaseUrl(url) {
    this.baseUrl = url;
    this.axios.defaults.baseURL = url;
  }

  handleError(error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
    }
    if (error.code === 'ECONNREFUSED' || error.code === 'ENETUNREACH') {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
    if (error.response) {
      const message = error.response.data?.message || error.response.statusText;
      throw new Error(message);
    }
    throw new Error(error.message || ERROR_MESSAGES.GENERIC_ERROR);
  }

  // ============================================
  // CONTAINERS
  // ============================================

  /**
   * List all containers
   * @param {boolean} all - Include stopped containers
   * @returns {Promise<Array>} Array of container objects
   */
  async listContainers(all = true) {
    try {
      const response = await this.axios.get('/containers/json', {
        params: { all },
      });
      return response.data;
    } catch (error) {
      console.error('DockerAPI.listContainers error:', error.message);
      throw error;
    }
  }

  /**
   * Get container details
   * @param {string} id - Container ID or name
   * @returns {Promise<Object>} Container details
   */
  async getContainer(id) {
    try {
      if (!id) throw new Error('Container ID is required');
      const response = await this.axios.get(`/containers/${id}/json`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(ERROR_MESSAGES.CONTAINER_NOT_FOUND);
      }
      console.error('DockerAPI.getContainer error:', error.message);
      throw error;
    }
  }

  /**
   * Create a new container
   * @param {Object} config - Container configuration
   * @returns {Promise<Object>} {Id, Warnings}
   */
  async createContainer(config) {
    try {
      if (!config.Image) throw new Error('Image name is required');
      
      const params = config.name ? { name: config.name } : {};
      delete config.name;
      
      const response = await this.axios.post('/containers/create', config, { params });
      return response.data;
    } catch (error) {
      console.error('DockerAPI.createContainer error:', error.message);
      throw error;
    }
  }

  /**
   * Start a container
   * @param {string} id - Container ID or name
   * @returns {Promise<void>}
   */
  async startContainer(id) {
    try {
      if (!id) throw new Error('Container ID is required');
      await this.axios.post(`/containers/${id}/start`);
    } catch (error) {
      if (error.response?.status === 304) {
        return;
      }
      console.error('DockerAPI.startContainer error:', error.message);
      throw error;
    }
  }

  /**
   * Stop a container
   * @param {string} id - Container ID or name
   * @param {number} timeout - Seconds to wait before killing
   * @returns {Promise<void>}
   */
  async stopContainer(id, timeout = 10) {
    try {
      if (!id) throw new Error('Container ID is required');
      await this.axios.post(`/containers/${id}/stop`, null, {
        params: { t: timeout },
      });
    } catch (error) {
      if (error.response?.status === 304) {
        return;
      }
      console.error('DockerAPI.stopContainer error:', error.message);
      throw error;
    }
  }

  /**
   * Restart a container
   * @param {string} id - Container ID or name
   * @param {number} timeout - Seconds to wait before killing
   * @returns {Promise<void>}
   */
  async restartContainer(id, timeout = 10) {
    try {
      if (!id) throw new Error('Container ID is required');
      await this.axios.post(`/containers/${id}/restart`, null, {
        params: { t: timeout },
      });
    } catch (error) {
      console.error('DockerAPI.restartContainer error:', error.message);
      throw error;
    }
  }

  /**
   * Remove a container
   * @param {string} id - Container ID or name
   * @param {boolean} force - Force removal of running container
   * @param {boolean} v - Remove volumes
   * @returns {Promise<void>}
   */
  async removeContainer(id, force = false, v = false) {
    try {
      if (!id) throw new Error('Container ID is required');
      await this.axios.delete(`/containers/${id}`, {
        params: { force, v },
      });
    } catch (error) {
      console.error('DockerAPI.removeContainer error:', error.message);
      throw error;
    }
  }

  /**
   * Get container logs
   * @param {string} id - Container ID or name
   * @param {number} tail - Number of lines to tail
   * @param {boolean} timestamps - Show timestamps
   * @returns {Promise<string>} Log string
   */
  async getContainerLogs(id, tail = 100, timestamps = true) {
    try {
      if (!id) throw new Error('Container ID is required');
      const response = await this.axios.get(`/containers/${id}/logs`, {
        params: {
          stdout: true,
          stderr: true,
          tail,
          timestamps,
        },
        responseType: 'text',
      });
      return this.parseLogStream(response.data);
    } catch (error) {
      console.error('DockerAPI.getContainerLogs error:', error.message);
      throw error;
    }
  }

  parseLogStream(data) {
    if (typeof data !== 'string') return '';
    const lines = data.split('\n').filter(line => line.length > 0);
    return lines.map(line => {
      if (line.length > 8) {
        return line.substring(8);
      }
      return line;
    }).join('\n');
  }

  /**
   * Get container stats
   * @param {string} id - Container ID or name
   * @param {boolean} stream - Stream stats
   * @returns {Promise<Object>} Stats object
   */
  async getContainerStats(id, stream = false) {
    try {
      if (!id) throw new Error('Container ID is required');
      const response = await this.axios.get(`/containers/${id}/stats`, {
        params: { stream },
      });
      return response.data;
    } catch (error) {
      console.error('DockerAPI.getContainerStats error:', error.message);
      throw error;
    }
  }

  /**
   * Pause a container
   * @param {string} id - Container ID or name
   * @returns {Promise<void>}
   */
  async pauseContainer(id) {
    try {
      if (!id) throw new Error('Container ID is required');
      await this.axios.post(`/containers/${id}/pause`);
    } catch (error) {
      console.error('DockerAPI.pauseContainer error:', error.message);
      throw error;
    }
  }

  /**
   * Unpause a container
   * @param {string} id - Container ID or name
   * @returns {Promise<void>}
   */
  async unpauseContainer(id) {
    try {
      if (!id) throw new Error('Container ID is required');
      await this.axios.post(`/containers/${id}/unpause`);
    } catch (error) {
      console.error('DockerAPI.unpauseContainer error:', error.message);
      throw error;
    }
  }

  /**
   * Kill a container
   * @param {string} id - Container ID or name
   * @param {string} signal - Signal to send (default SIGKILL)
   * @returns {Promise<void>}
   */
  async killContainer(id, signal = 'SIGKILL') {
    try {
      if (!id) throw new Error('Container ID is required');
      await this.axios.post(`/containers/${id}/kill`, null, {
        params: { signal },
      });
    } catch (error) {
      console.error('DockerAPI.killContainer error:', error.message);
      throw error;
    }
  }

  /**
   * Get container processes
   * @param {string} id - Container ID or name
   * @returns {Promise<Object>} Top output
   */
  async getContainerTop(id) {
    try {
      if (!id) throw new Error('Container ID is required');
      const response = await this.axios.get(`/containers/${id}/top`);
      return response.data;
    } catch (error) {
      console.error('DockerAPI.getContainerTop error:', error.message);
      throw error;
    }
  }

  /**
   * Rename a container
   * @param {string} id - Container ID or name
   * @param {string} newName - New container name
   * @returns {Promise<void>}
   */
  async renameContainer(id, newName) {
    try {
      if (!id) throw new Error('Container ID is required');
      if (!newName) throw new Error('New name is required');
      await this.axios.post(`/containers/${id}/rename`, null, {
        params: { name: newName },
      });
    } catch (error) {
      console.error('DockerAPI.renameContainer error:', error.message);
      throw error;
    }
  }

  // ============================================
  // IMAGES
  // ============================================

  /**
   * List all images
   * @returns {Promise<Array>} Array of image objects
   */
  async listImages() {
    try {
      const response = await this.axios.get('/images/json');
      return response.data;
    } catch (error) {
      console.error('DockerAPI.listImages error:', error.message);
      throw error;
    }
  }

  /**
   * Pull an image from registry
   * @param {string} imageName - Image name with optional tag
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<void>}
   */
  async pullImage(imageName, onProgress = null) {
    try {
      if (!imageName) throw new Error('Image name is required');
      
      const [fromImage, tag = 'latest'] = imageName.split(':');
      
      const response = await this.axios.post('/images/create', null, {
        params: { fromImage, tag },
        responseType: 'text',
        onDownloadProgress: (progressEvent) => {
          if (onProgress && progressEvent.event?.target?.responseText) {
            const lines = progressEvent.event.target.responseText.split('\n');
            const lastLine = lines.filter(l => l).pop();
            if (lastLine) {
              try {
                const data = JSON.parse(lastLine);
                onProgress(data);
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('DockerAPI.pullImage error:', error.message);
      throw error;
    }
  }

  /**
   * Remove an image
   * @param {string} id - Image ID or name
   * @param {boolean} force - Force removal
   * @param {boolean} noprune - Do not delete untagged parents
   * @returns {Promise<Array>} Deleted items
   */
  async removeImage(id, force = false, noprune = false) {
    try {
      if (!id) throw new Error('Image ID is required');
      const response = await this.axios.delete(`/images/${id}`, {
        params: { force, noprune },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(ERROR_MESSAGES.IMAGE_NOT_FOUND);
      }
      console.error('DockerAPI.removeImage error:', error.message);
      throw error;
    }
  }

  /**
   * Inspect an image
   * @param {string} id - Image ID or name
   * @returns {Promise<Object>} Image details
   */
  async inspectImage(id) {
    try {
      if (!id) throw new Error('Image ID is required');
      const response = await this.axios.get(`/images/${id}/json`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(ERROR_MESSAGES.IMAGE_NOT_FOUND);
      }
      console.error('DockerAPI.inspectImage error:', error.message);
      throw error;
    }
  }

  /**
   * Get image history
   * @param {string} id - Image ID or name
   * @returns {Promise<Array>} Image layers
   */
  async getImageHistory(id) {
    try {
      if (!id) throw new Error('Image ID is required');
      const response = await this.axios.get(`/images/${id}/history`);
      return response.data;
    } catch (error) {
      console.error('DockerAPI.getImageHistory error:', error.message);
      throw error;
    }
  }

  /**
   * Tag an image
   * @param {string} id - Image ID or name
   * @param {string} repo - Repository name
   * @param {string} tag - Tag name
   * @returns {Promise<void>}
   */
  async tagImage(id, repo, tag = 'latest') {
    try {
      if (!id) throw new Error('Image ID is required');
      if (!repo) throw new Error('Repository name is required');
      await this.axios.post(`/images/${id}/tag`, null, {
        params: { repo, tag },
      });
    } catch (error) {
      console.error('DockerAPI.tagImage error:', error.message);
      throw error;
    }
  }

  /**
   * Search images on Docker Hub
   * @param {string} term - Search term
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Search results
   */
  async searchImages(term, limit = 25) {
    try {
      if (!term) throw new Error('Search term is required');
      const response = await this.axios.get('/images/search', {
        params: { term, limit },
      });
      return response.data;
    } catch (error) {
      console.error('DockerAPI.searchImages error:', error.message);
      throw error;
    }
  }

  /**
   * Prune unused images
   * @returns {Promise<Object>} Pruned images info
   */
  async pruneImages() {
    try {
      const response = await this.axios.post('/images/prune');
      return response.data;
    } catch (error) {
      console.error('DockerAPI.pruneImages error:', error.message);
      throw error;
    }
  }

  // ============================================
  // VOLUMES
  // ============================================

  /**
   * List all volumes
   * @returns {Promise<Object>} {Volumes, Warnings}
   */
  async listVolumes() {
    try {
      const response = await this.axios.get('/volumes');
      return response.data;
    } catch (error) {
      console.error('DockerAPI.listVolumes error:', error.message);
      throw error;
    }
  }

  /**
   * Create a volume
   * @param {string} name - Volume name
   * @param {Object} config - Additional configuration
   * @returns {Promise<Object>} Volume object
   */
  async createVolume(name, config = {}) {
    try {
      if (!name) throw new Error('Volume name is required');
      const response = await this.axios.post('/volumes/create', {
        Name: name,
        ...config,
      });
      return response.data;
    } catch (error) {
      console.error('DockerAPI.createVolume error:', error.message);
      throw error;
    }
  }

  /**
   * Inspect a volume
   * @param {string} name - Volume name
   * @returns {Promise<Object>} Volume details
   */
  async inspectVolume(name) {
    try {
      if (!name) throw new Error('Volume name is required');
      const response = await this.axios.get(`/volumes/${name}`);
      return response.data;
    } catch (error) {
      console.error('DockerAPI.inspectVolume error:', error.message);
      throw error;
    }
  }

  /**
   * Remove a volume
   * @param {string} name - Volume name
   * @param {boolean} force - Force removal
   * @returns {Promise<void>}
   */
  async removeVolume(name, force = false) {
    try {
      if (!name) throw new Error('Volume name is required');
      await this.axios.delete(`/volumes/${name}`, {
        params: { force },
      });
    } catch (error) {
      console.error('DockerAPI.removeVolume error:', error.message);
      throw error;
    }
  }

  /**
   * Prune unused volumes
   * @returns {Promise<Object>} Pruned volumes info
   */
  async pruneVolumes() {
    try {
      const response = await this.axios.post('/volumes/prune');
      return response.data;
    } catch (error) {
      console.error('DockerAPI.pruneVolumes error:', error.message);
      throw error;
    }
  }

  // ============================================
  // NETWORKS
  // ============================================

  /**
   * List all networks
   * @returns {Promise<Array>} Array of network objects
   */
  async listNetworks() {
    try {
      const response = await this.axios.get('/networks');
      return response.data;
    } catch (error) {
      console.error('DockerAPI.listNetworks error:', error.message);
      throw error;
    }
  }

  /**
   * Create a network
   * @param {string} name - Network name
   * @param {Object} config - Network configuration
   * @returns {Promise<Object>} {Id, Warning}
   */
  async createNetwork(name, config = {}) {
    try {
      if (!name) throw new Error('Network name is required');
      const response = await this.axios.post('/networks/create', {
        Name: name,
        Driver: config.Driver || 'bridge',
        ...config,
      });
      return response.data;
    } catch (error) {
      console.error('DockerAPI.createNetwork error:', error.message);
      throw error;
    }
  }

  /**
   * Inspect a network
   * @param {string} id - Network ID or name
   * @returns {Promise<Object>} Network details
   */
  async inspectNetwork(id) {
    try {
      if (!id) throw new Error('Network ID is required');
      const response = await this.axios.get(`/networks/${id}`);
      return response.data;
    } catch (error) {
      console.error('DockerAPI.inspectNetwork error:', error.message);
      throw error;
    }
  }

  /**
   * Remove a network
   * @param {string} id - Network ID or name
   * @returns {Promise<void>}
   */
  async removeNetwork(id) {
    try {
      if (!id) throw new Error('Network ID is required');
      await this.axios.delete(`/networks/${id}`);
    } catch (error) {
      console.error('DockerAPI.removeNetwork error:', error.message);
      throw error;
    }
  }

  /**
   * Connect container to network
   * @param {string} networkId - Network ID
   * @param {string} containerId - Container ID
   * @returns {Promise<void>}
   */
  async connectToNetwork(networkId, containerId) {
    try {
      if (!networkId) throw new Error('Network ID is required');
      if (!containerId) throw new Error('Container ID is required');
      await this.axios.post(`/networks/${networkId}/connect`, {
        Container: containerId,
      });
    } catch (error) {
      console.error('DockerAPI.connectToNetwork error:', error.message);
      throw error;
    }
  }

  /**
   * Disconnect container from network
   * @param {string} networkId - Network ID
   * @param {string} containerId - Container ID
   * @returns {Promise<void>}
   */
  async disconnectFromNetwork(networkId, containerId) {
    try {
      if (!networkId) throw new Error('Network ID is required');
      if (!containerId) throw new Error('Container ID is required');
      await this.axios.post(`/networks/${networkId}/disconnect`, {
        Container: containerId,
      });
    } catch (error) {
      console.error('DockerAPI.disconnectFromNetwork error:', error.message);
      throw error;
    }
  }

  /**
   * Prune unused networks
   * @returns {Promise<Object>} Pruned networks info
   */
  async pruneNetworks() {
    try {
      const response = await this.axios.post('/networks/prune');
      return response.data;
    } catch (error) {
      console.error('DockerAPI.pruneNetworks error:', error.message);
      throw error;
    }
  }

  // ============================================
  // SYSTEM
  // ============================================

  /**
   * Get Docker system info
   * @returns {Promise<Object>} System info
   */
  async getSystemInfo() {
    try {
      const response = await this.axios.get('/info');
      return response.data;
    } catch (error) {
      console.error('DockerAPI.getSystemInfo error:', error.message);
      throw error;
    }
  }

  /**
   * Get Docker version
   * @returns {Promise<Object>} Version info
   */
  async getVersion() {
    try {
      const response = await this.axios.get('/version');
      return response.data;
    } catch (error) {
      console.error('DockerAPI.getVersion error:', error.message);
      throw error;
    }
  }

  /**
   * Ping Docker API
   * @returns {Promise<boolean>} true if OK
   */
  async ping() {
    try {
      const response = await this.axios.get('/_ping');
      return response.data === 'OK' || response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get system disk usage
   * @returns {Promise<Object>} Disk usage info
   */
  async getDiskUsage() {
    try {
      const response = await this.axios.get('/system/df');
      return response.data;
    } catch (error) {
      console.error('DockerAPI.getDiskUsage error:', error.message);
      throw error;
    }
  }

  /**
   * Get system events
   * @param {number} since - Unix timestamp
   * @param {number} until - Unix timestamp
   * @returns {Promise<Object>} Events stream
   */
  async getEvents(since, until) {
    try {
      const params = {};
      if (since) params.since = since;
      if (until) params.until = until;
      
      const response = await this.axios.get('/events', { params });
      return response.data;
    } catch (error) {
      console.error('DockerAPI.getEvents error:', error.message);
      throw error;
    }
  }

  /**
   * Prune all unused data
   * @returns {Promise<Object>} Pruned data info
   */
  async pruneSystem() {
    try {
      const [containers, images, volumes, networks] = await Promise.all([
        this.axios.post('/containers/prune'),
        this.axios.post('/images/prune'),
        this.axios.post('/volumes/prune'),
        this.axios.post('/networks/prune'),
      ]);
      
      return {
        containers: containers.data,
        images: images.data,
        volumes: volumes.data,
        networks: networks.data,
      };
    } catch (error) {
      console.error('DockerAPI.pruneSystem error:', error.message);
      throw error;
    }
  }
}

export default DockerAPI;
