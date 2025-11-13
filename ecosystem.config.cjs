module.exports = {
  apps: [
    {
      name: 'restobar-backend',
      cwd: './backend',
      script: 'index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 4000
      },
      error_file: './backend/logs/pm2-error.log',
      out_file: './backend/logs/pm2-out.log',
      log_file: './backend/logs/pm2-combined.log',
      time: true
    },
    {
      name: 'restobar-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run dev',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development'
      },
      error_file: './frontend/logs/pm2-error.log',
      out_file: './frontend/logs/pm2-out.log',
      log_file: './frontend/logs/pm2-combined.log',
      time: true
    }
  ]
};
