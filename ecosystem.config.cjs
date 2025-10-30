// PM2 ecosystem configuration for Well Asset Real Estate Platform
// This file manages the Node.js application process

module.exports = {
  apps: [{
    name: 'wellasset-app',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    instances: 1,
    exec_mode: 'cluster',
    
    // Environment variables
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
    },
    
    // Restart policy
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    
    // Logging
    error_file: '/var/log/wellasset/error.log',
    out_file: '/var/log/wellasset/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Restart delay
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
  }]
};
