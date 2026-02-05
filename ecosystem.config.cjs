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
        // Masukkan secret key yang sama dengan di Frontend untuk decrypt
        SSH_ENCRYPT_SECRET: "isi-dengan-secret-key-32-byte-anda-wajib-sama" 
      }
    }
  ]
}
