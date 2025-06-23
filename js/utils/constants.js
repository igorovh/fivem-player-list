//  endpoints
export const API_BASE_URL = 'https://servers-frontend.fivem.net/api';
export const SERVERS_ICON_URL = 'https://servers-live.fivem.net/servers/icon';

// links templates
export const STEAM_PROFILE_URL = 'https://steamcommunity.com/profiles/%id%';
export const DISCORD_PROFILE_URL = 'https://discord.com/users/%id%';

// default headers for fetch requests
export const DEFAULT_HEADERS = {
  Accept: '*/*',
  'Content-Type': 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
};

// Theme options
export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light'
};

// LocalStorage keys
export const STORAGE_KEYS = {
  SERVER_ID: 'serverId',
  LAST_ID: 'lastId', // Legacy
  THEME: 'theme',
  FAVORITES: 'favorites',
  HISTORY: 'serverHistory',
  ACTIVE_TAB: 'activeTab'
};

// Default refresh time in seconds
export const DEFAULT_REFRESH_TIME = 30;
