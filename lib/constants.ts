export const APP_CONFIG = {
  NAME: "Furinla VPS Control",
  VERSION: "1.0.0",
  ALLOWED_ROOT: "/root/furinla",
  DEFAULT_PORT: 3001,
  SOCKET_TIMEOUT: 60000,
  TERMINAL_THEME: {
    background: "#020617",
    foreground: "#f8fafc",
    cursor: "#3b82f6"
  }
}

export const API_ENDPOINTS = {
  SSH_TEST: "/api/ssh/test",
  UPLOAD: "/api/upload",
  AUTH: "/api/auth"
}
