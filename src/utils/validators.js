/**
 * Input Validators
 */

/**
 * Validate container name
 */
export const validateContainerName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  
  if (trimmed.length > 128) {
    return { valid: false, error: 'Name must be less than 128 characters' };
  }
  
  // Docker container name regex: [a-zA-Z0-9][a-zA-Z0-9_.-]+
  const validPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/;
  if (!validPattern.test(trimmed)) {
    return { 
      valid: false, 
      error: 'Name must start with alphanumeric and contain only letters, numbers, _, ., or -' 
    };
  }
  
  return { valid: true, error: null };
};

/**
 * Validate image name
 */
export const validateImageName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Image name is required' };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < 1) {
    return { valid: false, error: 'Image name is required' };
  }
  
  // Basic image name validation
  const validPattern = /^[a-z0-9]+([._-][a-z0-9]+)*(\/[a-z0-9]+([._-][a-z0-9]+)*)*(:[a-zA-Z0-9_.-]+)?$/;
  if (!validPattern.test(trimmed)) {
    return { 
      valid: false, 
      error: 'Invalid image name format. Example: nginx:latest or myrepo/myimage:v1' 
    };
  }
  
  return { valid: true, error: null };
};

/**
 * Validate port number
 */
export const validatePort = (port) => {
  if (port === '' || port === undefined || port === null) {
    return { valid: true, error: null }; // Optional
  }
  
  const num = parseInt(port, 10);
  
  if (isNaN(num)) {
    return { valid: false, error: 'Port must be a number' };
  }
  
  if (num < 1 || num > 65535) {
    return { valid: false, error: 'Port must be between 1 and 65535' };
  }
  
  return { valid: true, error: null };
};

/**
 * Validate port mapping (e.g., "8080:80")
 */
export const validatePortMapping = (mapping) => {
  if (!mapping || typeof mapping !== 'string') {
    return { valid: false, error: 'Port mapping is required' };
  }
  
  const trimmed = mapping.trim();
  const parts = trimmed.split(':');
  
  if (parts.length !== 2) {
    return { valid: false, error: 'Format: hostPort:containerPort' };
  }
  
  const hostValidation = validatePort(parts[0]);
  if (!hostValidation.valid) {
    return { valid: false, error: `Host port: ${hostValidation.error}` };
  }
  
  const containerValidation = validatePort(parts[1]);
  if (!containerValidation.valid) {
    return { valid: false, error: `Container port: ${containerValidation.error}` };
  }
  
  return { valid: true, error: null };
};

/**
 * Validate environment variable (KEY=value)
 */
export const validateEnvVar = (envVar) => {
  if (!envVar || typeof envVar !== 'string') {
    return { valid: false, error: 'Environment variable is required' };
  }
  
  const trimmed = envVar.trim();
  
  if (!trimmed.includes('=')) {
    return { valid: false, error: 'Format: KEY=value' };
  }
  
  const [key] = trimmed.split('=');
  
  if (!key || key.length === 0) {
    return { valid: false, error: 'Variable name cannot be empty' };
  }
  
  // Environment variable name validation
  const validPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  if (!validPattern.test(key)) {
    return { 
      valid: false, 
      error: 'Variable name must start with letter or _ and contain only letters, numbers, or _' 
    };
  }
  
  return { valid: true, error: null };
};

/**
 * Validate volume mount (e.g., "/host/path:/container/path")
 */
export const validateVolumeMount = (mount) => {
  if (!mount || typeof mount !== 'string') {
    return { valid: false, error: 'Volume mount is required' };
  }
  
  const trimmed = mount.trim();
  const parts = trimmed.split(':');
  
  if (parts.length < 2 || parts.length > 3) {
    return { valid: false, error: 'Format: /host/path:/container/path[:ro]' };
  }
  
  const [hostPath, containerPath, mode] = parts;
  
  if (!hostPath.startsWith('/') && !hostPath.match(/^[a-zA-Z]:/)) {
    return { valid: false, error: 'Host path must be absolute' };
  }
  
  if (!containerPath.startsWith('/')) {
    return { valid: false, error: 'Container path must be absolute' };
  }
  
  if (mode && !['ro', 'rw'].includes(mode)) {
    return { valid: false, error: 'Mode must be "ro" or "rw"' };
  }
  
  return { valid: true, error: null };
};

/**
 * Validate RAM size in MB
 */
export const validateRamSize = (ram, min = 256, max = 16384) => {
  if (ram === '' || ram === undefined || ram === null) {
    return { valid: false, error: 'RAM size is required' };
  }
  
  const num = parseInt(ram, 10);
  
  if (isNaN(num)) {
    return { valid: false, error: 'RAM must be a number' };
  }
  
  if (num < min) {
    return { valid: false, error: `RAM must be at least ${min} MB` };
  }
  
  if (num > max) {
    return { valid: false, error: `RAM cannot exceed ${max} MB` };
  }
  
  return { valid: true, error: null };
};

/**
 * Validate CPU cores
 */
export const validateCpuCores = (cores, min = 1, max = 16) => {
  if (cores === '' || cores === undefined || cores === null) {
    return { valid: false, error: 'CPU cores is required' };
  }
  
  const num = parseInt(cores, 10);
  
  if (isNaN(num)) {
    return { valid: false, error: 'CPU cores must be a number' };
  }
  
  if (num < min) {
    return { valid: false, error: `CPU cores must be at least ${min}` };
  }
  
  if (num > max) {
    return { valid: false, error: `CPU cores cannot exceed ${max}` };
  }
  
  return { valid: true, error: null };
};

/**
 * Validate Docker API URL
 */
export const validateDockerUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'Docker URL is required' };
  }
  
  const trimmed = url.trim();
  
  try {
    const parsed = new URL(trimmed);
    
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL must use http or https protocol' };
    }
    
    return { valid: true, error: null };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
};

/**
 * Validate network name
 */
export const validateNetworkName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Network name is required' };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  
  if (trimmed.length > 64) {
    return { valid: false, error: 'Name must be less than 64 characters' };
  }
  
  const validPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/;
  if (!validPattern.test(trimmed)) {
    return { 
      valid: false, 
      error: 'Name must start with alphanumeric and contain only letters, numbers, _, ., or -' 
    };
  }
  
  return { valid: true, error: null };
};

/**
 * Validate volume name
 */
export const validateVolumeName = (name) => {
  return validateNetworkName(name); // Same rules
};
