/**
 * Helper Functions
 */

/**
 * Format bytes to human readable format
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format Unix timestamp to human readable
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  const now = Date.now();
  const then = timestamp * 1000;
  const diff = now - then;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  
  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

/**
 * Format uptime duration
 */
export const formatUptime = (seconds) => {
  if (!seconds || seconds < 0) return '0s';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
};

/**
 * Truncate container/image ID
 */
export const truncateId = (id, length = 12) => {
  if (!id) return '';
  return id.substring(0, length);
};

/**
 * Parse container name (remove leading /)
 */
export const parseContainerName = (names) => {
  if (!names || !names.length) return 'Unnamed';
  return names[0].replace(/^\//, '');
};

/**
 * Parse image name and tag
 */
export const parseImageName = (repoTags) => {
  if (!repoTags || !repoTags.length) return { name: '<none>', tag: '<none>' };
  
  const fullName = repoTags[0];
  if (fullName === '<none>:<none>') return { name: '<none>', tag: '<none>' };
  
  const [name, tag = 'latest'] = fullName.split(':');
  return { name, tag };
};

/**
 * Calculate CPU percentage from stats
 */
export const calculateCpuPercent = (stats) => {
  if (!stats || !stats.cpu_stats || !stats.precpu_stats) return 0;
  
  const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
  const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
  const cpuCount = stats.cpu_stats.online_cpus || 1;
  
  if (systemDelta > 0 && cpuDelta > 0) {
    return ((cpuDelta / systemDelta) * cpuCount * 100).toFixed(2);
  }
  return 0;
};

/**
 * Calculate memory percentage from stats
 */
export const calculateMemoryPercent = (stats) => {
  if (!stats || !stats.memory_stats) return 0;
  
  const usage = stats.memory_stats.usage || 0;
  const limit = stats.memory_stats.limit || 1;
  
  return ((usage / limit) * 100).toFixed(2);
};

/**
 * Get container status color
 */
export const getStatusColor = (status, colors) => {
  const statusLower = status?.toLowerCase() || '';
  
  if (statusLower === 'running') return colors.state.success;
  if (statusLower === 'exited') return colors.state.error;
  if (statusLower === 'paused') return colors.state.warning;
  if (statusLower === 'restarting') return colors.accent.mauve;
  return colors.text.muted;
};

/**
 * Generate random color for container tags
 */
export const getRandomAccentColor = (colors, seed) => {
  const accents = [
    colors.accent.mauve,
    colors.accent.olive,
    colors.accent.terracotta,
    colors.accent.mint,
  ];
  
  const index = seed ? seed.charCodeAt(0) % accents.length : Math.floor(Math.random() * accents.length);
  return accents[index];
};

/**
 * Validate Docker API URL
 */
export const isValidDockerUrl = (url) => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:', 'unix:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Parse port mappings from container
 */
export const parsePortMappings = (ports) => {
  if (!ports) return [];
  
  return Object.entries(ports).map(([containerPort, hostBindings]) => {
    const [port, protocol] = containerPort.split('/');
    const hostPort = hostBindings?.[0]?.HostPort || null;
    const hostIp = hostBindings?.[0]?.HostIp || '0.0.0.0';
    
    return {
      containerPort: port,
      protocol,
      hostPort,
      hostIp,
    };
  });
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Sleep utility
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry with exponential backoff
 */
export const retryWithBackoff = async (fn, maxAttempts = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
};
