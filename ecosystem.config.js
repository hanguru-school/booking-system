// PM2 Ecosystem 설정 파일
// 서버에서 PM2가 환경변수를 자동으로 로드하도록 설정

module.exports = {
  apps: [
    {
      name: "booking",
      script: "pnpm",
      args: "start",
      cwd: "/home/malmoi/booking-system",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_file: "/etc/malmoi/booking.env",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/home/malmoi/.pm2/logs/booking-error.log",
      out_file: "/home/malmoi/.pm2/logs/booking-out.log",
      log_file: "/home/malmoi/.pm2/logs/booking-combined.log",
      time: true,
      merge_logs: true,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      max_restarts: 10,
      min_uptime: "10s",
      // 환경변수 자동 로드 (스크립트로 처리)
      interpreter: "/bin/bash",
      interpreter_args: "-c",
      // 환경변수는 PM2가 자동으로 로드 (env_file 사용)
    },
  ],
};
