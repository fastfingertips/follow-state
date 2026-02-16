import i18n from './i18n.js';
import { CONFIG } from './config.js';

/**
 * Flow State - Log Service
 * Manages session logs, content generation, and export operations
 */
export class LogService {
    constructor() {
        this.sessionLogs = [];
    }

    /**
     * Adds a new entry to the session log
     * @param {string} action - The action performed
     * @param {string} details - Additional details about the action
     */
    add(action, details = '') {
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        this.sessionLogs.push({ time: timeStr, action, details });
    }

    /**
     * Clears all session logs
     */
    clear() {
        this.sessionLogs = [];
    }

    /**
     * Generates a formatted log string for the session
     * @param {Object} sessionData - Data about the session
     * @returns {string} Formatted log content
     */
    generateContent(sessionData) {
        const { goal, duration, totalBreakSeconds } = sessionData;
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();
        
        const logsStr = this.sessionLogs.map(log => `[${log.time}] (${log.action}): ${log.details}`).join('\n');
        
        const totalBreakMins = Math.floor(totalBreakSeconds / 60);
        const totalBreakSecs = totalBreakSeconds % 60;
        const breakDurationStr = `${totalBreakMins}m ${totalBreakSecs}s`;

        return `${i18n.t('logHeader')}
----------------------------------------
${i18n.t('logDate')}:     ${dateStr}
${i18n.t('logTime')}:     ${timeStr}
${i18n.t('logGoal')}:     ${goal}
${i18n.t('logDuration')}: ${duration}
${i18n.t('logTotalBreak')}: ${breakDurationStr}
----------------------------------------
session_logs:
${logsStr}
----------------------------------------
${i18n.t('logFooter')}
${i18n.t('logFooterLink')}`;
    }

    /**
     * Copies content to the device clipboard
     * @param {string} content - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard(content) {
        try {
            await navigator.clipboard.writeText(content);
            return true;
        } catch (err) {
            console.error('Failed to copy text:', err);
            return false;
        }
    }

    /**
     * Triggers a browser download for the log content
     * @param {string} content - Log text to download
     */
    downloadFile(content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const timestamp = new Date().toISOString().replaceAll(/[:.]/g, '-');
        a.href = url;
        a.download = `${CONFIG.LOGS.FILENAME_PREFIX}${timestamp}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }
}
