// Environment configuration
// export const USE_MOCK_DATA = import.meta.env.VITE_MOCK_MODE === 'true' || !import.meta.env.VITE_API_BASE_URL;
// export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
export const USE_MOCK_DATA = import.meta.env.VITE_MOCK_MODE === 'true';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Feature Flags
export const ENABLE_NOTIFICATIONS = import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false';
export const ENABLE_PROFILE_EDITING = import.meta.env.VITE_ENABLE_PROFILE_EDITING !== 'false';

// Development
export const IS_DEVELOPMENT = import.meta.env.DEV;
export const IS_PRODUCTION = import.meta.env.PROD;

export default {
  USE_MOCK_DATA,
  API_BASE_URL,
  ENABLE_NOTIFICATIONS,
  ENABLE_PROFILE_EDITING,
  IS_DEVELOPMENT,
  IS_PRODUCTION,
};