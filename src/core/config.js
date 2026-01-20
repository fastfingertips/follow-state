/**
 * Flow State - Application Configuration
 */

export const CONFIG = {
    APP_NAME: 'Flow State',
    VERSION: '0.1.0',
    
    // Timer Settings (in seconds)
    TIMERS: {
        NINETY_SECONDS_RULE: 90,
        DEFAULT_BREAK_DURATION: 5 * 60, // 5 minutes
        ENERGY_CHECK_INTERVAL: 45 * 60 * 1000, // 45 minutes in ms
    },
    
    // Storage Keys
    STORAGE: {
        STATS: 'flow-state-stats',
        LANG: 'flow-state-lang',
        SETTINGS: 'flow-state-settings',
        AMOLED_MODE: 'flow-state-amoled'
    },
    
    // Localization
    I18N: {
        DEFAULT_LANG: 'en',
        SUPPORTED_LANGS: ['en', 'tr']
    },
    
    // UI Constants
    UI: {
        WIDE_SCREEN_THRESHOLD: 900,
        ANIMATION_DURATION: 300,
        MAX_GOAL_LENGTH_DISPLAY: 30
    }
};

export default CONFIG;
