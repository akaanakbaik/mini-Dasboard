module.exports = {
  apps: [
    {
      name: "furinla-socket-server",
      script: "./dist/server/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        SSH_ENCRYPT_SECRET: "826fae3e6bc72b4aaebbbc2056ba1a37" 
      }
    }
  ]
}
