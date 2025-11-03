/**
 * PM2 Ecosystem Configuration
 * For Laravel Forge deployment
 * Domain: meganews.on-forge.com
 */

module.exports = {
  apps: [{
    name: 'blog-api',
    script: 'server.js',
    cwd: '/home/forge/meganews.on-forge.com/current/auto blog-appv1',
    instances: 1,
    exec_mode: 'fork',
    interpreter: '/usr/bin/node', // Explicit Node.js path
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/forge/meganews.on-forge.com/storage/logs/pm2-error.log',
    out_file: '/home/forge/meganews.on-forge.com/storage/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '500M',
    watch: false,
    // Environment variables will be loaded from Forge's .env file automatically
    // No need to specify them here as PM2 will read from .env
  }]
};

