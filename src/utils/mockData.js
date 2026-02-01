/**
 * Mock Data for Development Testing
 */

export const mockContainers = [
  {
    Id: 'abc123def456789012345678901234567890123456789012345678901234',
    Names: ['/nginx-web'],
    Image: 'nginx:alpine',
    ImageID: 'sha256:nginx123456789',
    Command: 'nginx -g "daemon off;"',
    Created: Math.floor(Date.now() / 1000) - 86400,
    State: 'running',
    Status: 'Up 24 hours',
    Ports: [
      { PrivatePort: 80, PublicPort: 8080, Type: 'tcp' },
    ],
    Labels: {
      'com.docker.compose.service': 'web',
    },
    NetworkSettings: {
      Networks: {
        bridge: {
          IPAddress: '172.17.0.2',
        },
      },
    },
    Mounts: [],
  },
  {
    Id: 'def456abc789012345678901234567890123456789012345678901234567',
    Names: ['/postgres-db'],
    Image: 'postgres:alpine',
    ImageID: 'sha256:postgres123456789',
    Command: 'docker-entrypoint.sh postgres',
    Created: Math.floor(Date.now() / 1000) - 172800,
    State: 'running',
    Status: 'Up 2 days',
    Ports: [
      { PrivatePort: 5432, PublicPort: 5432, Type: 'tcp' },
    ],
    Labels: {
      'com.docker.compose.service': 'db',
    },
    NetworkSettings: {
      Networks: {
        bridge: {
          IPAddress: '172.17.0.3',
        },
      },
    },
    Mounts: [
      {
        Type: 'volume',
        Name: 'postgres-data',
        Source: '/var/lib/docker/volumes/postgres-data/_data',
        Destination: '/var/lib/postgresql/data',
        Mode: 'rw',
      },
    ],
  },
  {
    Id: 'ghi789jkl012345678901234567890123456789012345678901234567890',
    Names: ['/redis-cache'],
    Image: 'redis:alpine',
    ImageID: 'sha256:redis123456789',
    Command: 'redis-server',
    Created: Math.floor(Date.now() / 1000) - 259200,
    State: 'running',
    Status: 'Up 3 days',
    Ports: [
      { PrivatePort: 6379, PublicPort: 6379, Type: 'tcp' },
    ],
    Labels: {},
    NetworkSettings: {
      Networks: {
        bridge: {
          IPAddress: '172.17.0.4',
        },
      },
    },
    Mounts: [],
  },
  {
    Id: 'jkl012mno345678901234567890123456789012345678901234567890123',
    Names: ['/wordpress-site'],
    Image: 'wordpress:latest',
    ImageID: 'sha256:wordpress123456789',
    Command: 'docker-entrypoint.sh apache2-foreground',
    Created: Math.floor(Date.now() / 1000) - 3600,
    State: 'exited',
    Status: 'Exited (0) 1 hour ago',
    Ports: [],
    Labels: {},
    NetworkSettings: {
      Networks: {},
    },
    Mounts: [],
  },
  {
    Id: 'mno345pqr678901234567890123456789012345678901234567890123456',
    Names: ['/node-api'],
    Image: 'node:20-alpine',
    ImageID: 'sha256:node123456789',
    Command: 'node server.js',
    Created: Math.floor(Date.now() / 1000) - 7200,
    State: 'running',
    Status: 'Up 2 hours',
    Ports: [
      { PrivatePort: 3000, PublicPort: 3000, Type: 'tcp' },
    ],
    Labels: {
      'com.app.name': 'api-server',
    },
    NetworkSettings: {
      Networks: {
        bridge: {
          IPAddress: '172.17.0.5',
        },
      },
    },
    Mounts: [],
  },
];

export const mockImages = [
  {
    Id: 'sha256:nginx123456789012345678901234567890123456789012345678901234',
    RepoTags: ['nginx:alpine'],
    RepoDigests: ['nginx@sha256:abc123'],
    Created: Math.floor(Date.now() / 1000) - 604800,
    Size: 23456789,
    VirtualSize: 23456789,
    Labels: {},
    Containers: 1,
  },
  {
    Id: 'sha256:postgres123456789012345678901234567890123456789012345678901',
    RepoTags: ['postgres:alpine'],
    RepoDigests: ['postgres@sha256:def456'],
    Created: Math.floor(Date.now() / 1000) - 1209600,
    Size: 87654321,
    VirtualSize: 87654321,
    Labels: {},
    Containers: 1,
  },
  {
    Id: 'sha256:redis123456789012345678901234567890123456789012345678901234',
    RepoTags: ['redis:alpine'],
    RepoDigests: ['redis@sha256:ghi789'],
    Created: Math.floor(Date.now() / 1000) - 2419200,
    Size: 12345678,
    VirtualSize: 12345678,
    Labels: {},
    Containers: 1,
  },
  {
    Id: 'sha256:alpine123456789012345678901234567890123456789012345678901234',
    RepoTags: ['alpine:latest'],
    RepoDigests: ['alpine@sha256:jkl012'],
    Created: Math.floor(Date.now() / 1000) - 3628800,
    Size: 5678901,
    VirtualSize: 5678901,
    Labels: {},
    Containers: 0,
  },
  {
    Id: 'sha256:node123456789012345678901234567890123456789012345678901234567',
    RepoTags: ['node:20-alpine'],
    RepoDigests: ['node@sha256:mno345'],
    Created: Math.floor(Date.now() / 1000) - 86400,
    Size: 123456789,
    VirtualSize: 123456789,
    Labels: {},
    Containers: 1,
  },
  {
    Id: 'sha256:wordpress123456789012345678901234567890123456789012345678901',
    RepoTags: ['wordpress:latest'],
    RepoDigests: ['wordpress@sha256:pqr678'],
    Created: Math.floor(Date.now() / 1000) - 172800,
    Size: 567890123,
    VirtualSize: 567890123,
    Labels: {},
    Containers: 1,
  },
];

export const mockVolumes = {
  Volumes: [
    {
      Name: 'postgres-data',
      Driver: 'local',
      Mountpoint: '/var/lib/docker/volumes/postgres-data/_data',
      CreatedAt: new Date(Date.now() - 172800000).toISOString(),
      Labels: {},
      Scope: 'local',
      Options: {},
      UsageData: {
        Size: 134567890,
        RefCount: 1,
      },
    },
    {
      Name: 'redis-data',
      Driver: 'local',
      Mountpoint: '/var/lib/docker/volumes/redis-data/_data',
      CreatedAt: new Date(Date.now() - 259200000).toISOString(),
      Labels: {},
      Scope: 'local',
      Options: {},
      UsageData: {
        Size: 45678901,
        RefCount: 0,
      },
    },
    {
      Name: 'app-uploads',
      Driver: 'local',
      Mountpoint: '/var/lib/docker/volumes/app-uploads/_data',
      CreatedAt: new Date(Date.now() - 86400000).toISOString(),
      Labels: {
        'com.app.name': 'my-app',
      },
      Scope: 'local',
      Options: {},
      UsageData: {
        Size: 234567890,
        RefCount: 2,
      },
    },
  ],
  Warnings: null,
};

export const mockNetworks = [
  {
    Name: 'bridge',
    Id: 'bridge123456789012345678901234567890123456789012345678901234',
    Created: new Date(Date.now() - 2592000000).toISOString(),
    Scope: 'local',
    Driver: 'bridge',
    EnableIPv6: false,
    Internal: false,
    Attachable: false,
    Ingress: false,
    IPAM: {
      Driver: 'default',
      Config: [
        {
          Subnet: '172.17.0.0/16',
          Gateway: '172.17.0.1',
        },
      ],
    },
    Containers: {
      abc123: { Name: 'nginx-web', IPv4Address: '172.17.0.2/16' },
      def456: { Name: 'postgres-db', IPv4Address: '172.17.0.3/16' },
    },
    Options: {},
    Labels: {},
  },
  {
    Name: 'host',
    Id: 'host123456789012345678901234567890123456789012345678901234567',
    Created: new Date(Date.now() - 2592000000).toISOString(),
    Scope: 'local',
    Driver: 'host',
    EnableIPv6: false,
    Internal: false,
    Attachable: false,
    Ingress: false,
    IPAM: {
      Driver: 'default',
      Config: [],
    },
    Containers: {},
    Options: {},
    Labels: {},
  },
  {
    Name: 'my-app-network',
    Id: 'myapp123456789012345678901234567890123456789012345678901234',
    Created: new Date(Date.now() - 86400000).toISOString(),
    Scope: 'local',
    Driver: 'bridge',
    EnableIPv6: false,
    Internal: false,
    Attachable: true,
    Ingress: false,
    IPAM: {
      Driver: 'default',
      Config: [
        {
          Subnet: '172.20.0.0/16',
          Gateway: '172.20.0.1',
        },
      ],
    },
    Containers: {},
    Options: {},
    Labels: {
      'com.docker.compose.network': 'my-app',
    },
  },
];

export const mockContainerStats = {
  read: new Date().toISOString(),
  preread: new Date(Date.now() - 1000).toISOString(),
  cpu_stats: {
    cpu_usage: {
      total_usage: 123456789012,
      usage_in_kernelmode: 12345678901,
      usage_in_usermode: 111111110111,
    },
    system_cpu_usage: 9876543210987654,
    online_cpus: 4,
    throttling_data: {
      periods: 0,
      throttled_periods: 0,
      throttled_time: 0,
    },
  },
  precpu_stats: {
    cpu_usage: {
      total_usage: 123456780000,
      usage_in_kernelmode: 12345670000,
      usage_in_usermode: 111111110000,
    },
    system_cpu_usage: 9876543200987654,
    online_cpus: 4,
    throttling_data: {
      periods: 0,
      throttled_periods: 0,
      throttled_time: 0,
    },
  },
  memory_stats: {
    usage: 52428800,
    max_usage: 67108864,
    limit: 2147483648,
    stats: {
      active_anon: 41943040,
      active_file: 10485760,
    },
  },
  networks: {
    eth0: {
      rx_bytes: 123456789,
      rx_packets: 12345,
      rx_errors: 0,
      rx_dropped: 0,
      tx_bytes: 98765432,
      tx_packets: 9876,
      tx_errors: 0,
      tx_dropped: 0,
    },
  },
  blkio_stats: {
    io_service_bytes_recursive: [],
    io_serviced_recursive: [],
  },
};

export const mockSystemInfo = {
  ID: 'ABCD:1234:5678:EFGH',
  Containers: 5,
  ContainersRunning: 4,
  ContainersPaused: 0,
  ContainersStopped: 1,
  Images: 6,
  Driver: 'overlay2',
  MemoryLimit: true,
  SwapLimit: true,
  KernelVersion: '5.15.0-generic',
  OperatingSystem: 'Alpine Linux v3.19',
  OSType: 'linux',
  Architecture: 'x86_64',
  NCPU: 4,
  MemTotal: 2147483648,
  DockerRootDir: '/var/lib/docker',
  Name: 'alpine-vm',
  ServerVersion: '24.0.7',
};

export const mockVersion = {
  Platform: { Name: 'Docker Engine - Community' },
  Version: '24.0.7',
  ApiVersion: '1.43',
  MinAPIVersion: '1.12',
  GitCommit: 'afdd53b',
  GoVersion: 'go1.21.4',
  Os: 'linux',
  Arch: 'amd64',
  KernelVersion: '5.15.0-generic',
  BuildTime: '2023-10-26T09:08:00.000000000+00:00',
};

export const mockContainerLogs = `2024-01-15T10:00:00.000Z - Server starting...
2024-01-15T10:00:01.000Z - Connecting to database...
2024-01-15T10:00:02.000Z - Database connected successfully
2024-01-15T10:00:03.000Z - Loading configuration...
2024-01-15T10:00:04.000Z - Configuration loaded
2024-01-15T10:00:05.000Z - Starting HTTP server on port 80
2024-01-15T10:00:06.000Z - Server is ready to accept connections
2024-01-15T10:05:12.000Z - GET /api/health 200 15ms
2024-01-15T10:10:23.000Z - GET /api/users 200 45ms
2024-01-15T10:15:34.000Z - POST /api/data 201 123ms
2024-01-15T10:20:45.000Z - GET /api/health 200 12ms
2024-01-15T10:25:56.000Z - GET /api/status 200 8ms`;

export const getMockContainerDetail = (id) => {
  const container = mockContainers.find(c => c.Id.startsWith(id.substring(0, 12)));
  if (!container) return null;
  
  return {
    ...container,
    Path: container.Command.split(' ')[0],
    Args: container.Command.split(' ').slice(1),
    Config: {
      Hostname: container.Names[0].replace('/', ''),
      User: '',
      Env: [
        'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
        'NGINX_VERSION=1.25.3',
      ],
      Cmd: container.Command.split(' '),
      Image: container.Image,
      WorkingDir: '/usr/share/nginx/html',
      ExposedPorts: container.Ports.reduce((acc, p) => {
        acc[`${p.PrivatePort}/${p.Type}`] = {};
        return acc;
      }, {}),
    },
    HostConfig: {
      Binds: container.Mounts.map(m => `${m.Source}:${m.Destination}:${m.Mode}`),
      NetworkMode: 'bridge',
      PortBindings: container.Ports.reduce((acc, p) => {
        if (p.PublicPort) {
          acc[`${p.PrivatePort}/${p.Type}`] = [{ HostPort: String(p.PublicPort) }];
        }
        return acc;
      }, {}),
      RestartPolicy: { Name: 'no', MaximumRetryCount: 0 },
      Memory: 0,
      MemorySwap: 0,
      CpuShares: 0,
    },
    NetworkSettings: {
      ...container.NetworkSettings,
      Ports: container.Ports.reduce((acc, p) => {
        acc[`${p.PrivatePort}/${p.Type}`] = p.PublicPort ? [{ HostIp: '0.0.0.0', HostPort: String(p.PublicPort) }] : null;
        return acc;
      }, {}),
    },
  };
};
