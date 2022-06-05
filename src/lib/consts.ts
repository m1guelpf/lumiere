export const APP_NAME = 'Obscura'
export const IS_MAINNET = process.env.NODE_ENV == 'production'
export const API_URL = IS_MAINNET ? 'https://api.lens.dev' : 'https://api-mumbai.lens.dev'
