/**
 * Flow State - Storage Module
 */
import { CONFIG } from './config.js';


const STORAGE_KEYS = CONFIG.STORAGE;

const defaultStats = { sessions: 0, totalMinutes: 0, lastSession: null };
const defaultSettings = { energyCheckInterval: 45, breakDuration: 5 };

function loadStats() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.STATS);
        return saved ? { ...defaultStats, ...JSON.parse(saved) } : { ...defaultStats };
    } catch (e) { 
        console.error('Failed to load stats:', e);
        return { ...defaultStats }; 
    }
}

function saveStats(stats) {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
}

function loadSettings() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : { ...defaultSettings };
    } catch (e) { 
        console.error('Failed to load settings:', e);
        return { ...defaultSettings }; 
    }
}

function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export { STORAGE_KEYS, loadStats, saveStats, loadSettings, saveSettings, defaultStats };
