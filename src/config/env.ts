/**
 * Application Environment Configuration
 * Reads secrets injected via .env.local during build or runtime overrides
 */

export interface AppEnvConfig {
  geminiApiKey: string
  gcpApiKey: string
  platform: 'CHROME' | 'LOCAL'
  isDevelopment: boolean
}

export const getEnvConfig = (): AppEnvConfig => {
  return {
    geminiApiKey: process.env.REACT_APP_GEMINI_API_KEY || '',
    gcpApiKey: process.env.REACT_APP_GCP_API_KEY || '',
    platform: (process.env.REACT_APP_PLATFORM as 'CHROME' | 'LOCAL') || 'CHROME',
    isDevelopment: process.env.NODE_ENV === 'development',
  }
}

export const config = getEnvConfig()
