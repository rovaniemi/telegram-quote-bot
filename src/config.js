const config = {
  rate: {
    up: 1.1,
    down: 0.95,
    solid: 0.1
  },
  spamSec: 20,
  sleepTime: 200,
  api: {
    enabled: process.env.API_ENABLED,
    port: process.env.API_PORT ? parseInt(process.env.API_PORT) : 1234
  }
}

export default config
