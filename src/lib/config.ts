export const serverUrl =
  typeof process.env.PROD_URL === 'string'
    ? `https://${process.env.PROD_URL}`
    : 'http://localhost:3000'
