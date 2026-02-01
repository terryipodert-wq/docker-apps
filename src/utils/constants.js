/**
 * Application Constants
 */

export const API_CONFIG = {
  DEFAULT_DOCKER_URL: 'http://localhost:2375',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export const VM_CONFIG = {
  DEFAULT_RAM_MB: 2048,
  DEFAULT_CPU_CORES: 2,
  DEFAULT_DISK_SIZE_GB: 10,
  MIN_RAM_MB: 512,
  MAX_RAM_MB: 8192,
  MIN_CPU_CORES: 1,
  MAX_CPU_CORES: 8,
};

export const CONTAINER_STATUS = {
  RUNNING: 'running',
  EXITED: 'exited',
  PAUSED: 'paused',
  RESTARTING: 'restarting',
  DEAD: 'dead',
  CREATED: 'created',
};

export const VM_STATUS = {
  STOPPED: 'stopped',
  STARTING: 'starting',
  RUNNING: 'running',
  STOPPING: 'stopping',
  ERROR: 'error',
  INITIALIZING: 'initializing',
};

export const ROUTES = {
  HOME: 'Home',
  CONTAINERS: 'Containers',
  CONTAINER_DETAIL: 'ContainerDetail',
  IMAGES: 'Images',
  IMAGE_DETAIL: 'ImageDetail',
  WEBVIEW: 'WebView',
  TERMINAL: 'Terminal',
  VOLUMES: 'Volumes',
  NETWORKS: 'Networks',
  SETTINGS: 'Settings',
  QEMU_CONTROL: 'QemuControl',
  CREATE_CONTAINER: 'CreateContainer',
  PULL_IMAGE: 'PullImage',
};

export const STORAGE_KEYS = {
  DOCKER_URL: '@docker_url',
  MOCK_MODE: '@mock_mode',
  THEME_MODE: '@theme_mode',
  VM_RAM: '@vm_ram',
  VM_CPU: '@vm_cpu',
  FIRST_LAUNCH: '@first_launch',
  FAVORITE_CONTAINERS: '@favorite_containers',
};

export const COMMON_IMAGES = [
  { name: 'alpine', tag: 'latest', description: 'Minimal Alpine Linux' },
  { name: 'nginx', tag: 'alpine', description: 'Nginx web server' },
  { name: 'postgres', tag: 'alpine', description: 'PostgreSQL database' },
  { name: 'redis', tag: 'alpine', description: 'Redis cache' },
  { name: 'node', tag: '20-alpine', description: 'Node.js runtime' },
  { name: 'python', tag: '3.12-alpine', description: 'Python runtime' },
  { name: 'wordpress', tag: 'latest', description: 'WordPress CMS' },
  { name: 'mysql', tag: '8', description: 'MySQL database' },
  { name: 'mongo', tag: 'latest', description: 'MongoDB database' },
  { name: 'httpd', tag: 'alpine', description: 'Apache HTTP server' },
];

export const COMMON_PORTS = [
  { port: 80, name: 'HTTP' },
  { port: 443, name: 'HTTPS' },
  { port: 3000, name: 'Node/React' },
  { port: 5000, name: 'Flask/API' },
  { port: 5432, name: 'PostgreSQL' },
  { port: 3306, name: 'MySQL' },
  { port: 6379, name: 'Redis' },
  { port: 27017, name: 'MongoDB' },
  { port: 8080, name: 'Web App' },
  { port: 9000, name: 'Portainer' },
];

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to Docker API. Please check your connection.',
  TIMEOUT_ERROR: 'Request timed out. The server may be overloaded.',
  CONTAINER_NOT_FOUND: 'Container not found. It may have been removed.',
  IMAGE_NOT_FOUND: 'Image not found. Please pull it first.',
  VM_NOT_RUNNING: 'VM is not running. Please start it first.',
  PERMISSION_DENIED: 'Permission denied. Check your Docker configuration.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
};

export const SUCCESS_MESSAGES = {
  CONTAINER_STARTED: 'Container started successfully',
  CONTAINER_STOPPED: 'Container stopped successfully',
  CONTAINER_REMOVED: 'Container removed successfully',
  CONTAINER_CREATED: 'Container created successfully',
  IMAGE_PULLED: 'Image pulled successfully',
  IMAGE_REMOVED: 'Image removed successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  VM_STARTED: 'VM started successfully',
  VM_STOPPED: 'VM stopped successfully',
};
