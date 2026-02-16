/**
 * Flow State - Main Application Class
 */
import { CONFIG } from './core/config.js';


import i18n from './core/i18n.js';
import { getIcon, getRitualIcon } from './core/icons.js';
import { loadStats, saveStats } from './core/storage.js';
import { initFullscreen } from './core/fullscreen.js';
import { Timer } from './core/timer.js';
import { LogService } from './core/LogService.js';
import { UIManager } from './core/UIManager.js';

export class FlowApp {
    currentGoal = '';
    currentRitualIndex = 0;
    focusStartTime = null;
    focusTimer = null;
    ninetyTimer = null;
    breakTimer = null;
    isPaused = false;
    energyCheckInterval = CONFIG.TIMERS.ENERGY_CHECK_INTERVAL;
    lastEnergyCheck = null;
    stats = loadStats();
    currentScreen = 'welcome';
    logger = new LogService();
    ui = new UIManager(this);
    totalBreakSeconds = 0;

    constructor() {
        this.init();
    }
    
    init() {
        this.refreshUI(true);
        this.selectRandomRitual();
        this.showScreen('welcome'); 
        
        // Soft focus: Wait for screen fade animation to complete
        setTimeout(() => {
            const { goalInput } = this.ui.elements;
            if (goalInput) goalInput.focus();
        }, CONFIG.UI.SOFT_FOCUS_DELAY);

        initFullscreen('fullscreenToggle');
    }

    refreshUI(isInitial = false) {
        this.ui.renderShell();
        this.ui.cacheElements();
        this.ui.updateUIText(this.totalBreakSeconds);
        this.ui.setIcons();
        this.bindEvents(isInitial);
        this.ui.updateStats(this.stats.sessions, this.stats.totalMinutes);
        this.ui.addSVGGradient();
    }


    

    
    bindEvents(isInitial = false) {
        const el = this.ui.elements;

        // Screen-specific events (these elements are re-created on shell render)
        el.goalInput.addEventListener('input', () => this.validateGoal());
        el.goalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && el.goalInput.value.trim()) this.startRitualPhase();
        });
        el.startBtn.addEventListener('click', () => this.startRitualPhase());
        
        el.quickGoals.forEach(btn => {
            btn.addEventListener('click', () => {
                const goalKey = btn.dataset.goal;
                el.goalInput.value = i18n.t(goalKey);
                this.validateGoal();
            });
        });

        el.newRitualBtn.addEventListener('click', () => this.selectRandomRitual());
        el.customRitualBtn.addEventListener('click', () => this.toggleCustomRitualMode());
        el.ritualInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.saveCustomRitual();
            if (e.key === 'Escape') this.toggleCustomRitualMode();
        });
        el.ritualDoneBtn.addEventListener('click', () => this.completeRitual());
        el.start90Btn.addEventListener('click', () => this.start90Seconds());
        el.pauseBtn.addEventListener('click', () => this.togglePause());
        el.focusBreakBtn.addEventListener('click', () => this.handleImmediateBreak());
        el.endSessionBtn.addEventListener('click', () => this.endSession());

        el.energyGood.addEventListener('click', () => this.handleEnergyCheck('good'));
        el.energyMid.addEventListener('click', () => this.handleEnergyCheck('mid'));
        el.energyLow.addEventListener('click', () => this.handleEnergyCheck('low'));

        el.takeBreakBtn.addEventListener('click', () => this.startBreak());
        el.newSessionBtn.addEventListener('click', () => this.resetToWelcome());
        el.extendBreakBtn.addEventListener('click', () => this.extendBreak());
        el.endBreakBtn.addEventListener('click', () => this.endBreak());
        
        if (el.copyLogBtn) el.copyLogBtn.addEventListener('click', () => this.copyLog());
        if (el.viewLogBtn) el.viewLogBtn.addEventListener('click', () => this.viewLog());
        if (el.downloadLogBtn) el.downloadLogBtn.addEventListener('click', () => this.downloadLog());
        
        if (el.closeLogBtn) el.closeLogBtn.addEventListener('click', () => this.closeLog());
        if (el.logOverlay) el.logOverlay.addEventListener('click', (e) => {
            if (e.target === el.logOverlay) this.closeLog();
        });

        // Static events (these elements are in index.html and NOT re-created)
        if (isInitial) {
            el.langToggle.addEventListener('click', () => this.toggleLanguage());

            if (el.themeToggle) {
                el.themeToggle.addEventListener('click', () => this.toggleTheme());
                const isAmoled = localStorage.getItem(CONFIG.STORAGE.AMOLED_MODE) === 'true';
                if (isAmoled) document.body.classList.add('amoled-mode');
            }
            
            globalThis.addEventListener('keydown', (e) => this.handleGlobalShortcuts(e));
        }
    }

    handleGlobalShortcuts(e) {
        const el = this.ui.elements;
        if (e.key === 'Enter') {
            if (this.currentScreen === 'complete') {
                this.resetToWelcome();
            } else if (this.currentScreen === 'ritual') {
                this.completeRitual();
            } else if (this.currentScreen === 'ninety' && !el.start90Btn.disabled) {
                this.start90Seconds();
            } else if (this.currentScreen === 'welcome' && el.goalInput.value.trim()) {
                this.startRitualPhase();
            }
        }
        if (e.key === ' ' && this.currentScreen === 'ritual') {
            const isInputActive = !el.ritualInputWrapper.classList.contains('hidden');
            if (!isInputActive) {
                e.preventDefault();
                this.selectRandomRitual();
            }
        }
        if (e.key === 'Escape') {
            if (!el.energyCheck.classList.contains('hidden')) {
                this.handleEnergyCheck('good');
            } else if (!el.breakOverlay.classList.contains('hidden')) {
                this.endBreak();
            }
        }
    }
    

    

    

    
    toggleLanguage() {
        const el = this.ui.elements;
        const savedScreen = this.currentScreen;
        const savedGoal = el.goalInput ? el.goalInput.value : '';
        const isNinetyRunning = this.ninetyTimer && this.ninetyTimer.interval !== null;
        
        const newLang = i18n.getCurrentLang() === 'en' ? 'tr' : 'en';
        i18n.setLanguage(newLang);
        
        this.refreshUI(false);
        this.showScreen(savedScreen);
        
        if (el.goalInput) {
            el.goalInput.value = savedGoal;
            this.validateGoal();
        }

        if (isNinetyRunning && el.start90Btn) {
            el.start90Btn.disabled = true;
            el.start90Text.textContent = i18n.t('continuing');
        }

        this.selectRitual(this.currentRitualIndex);
    }
    
    showScreen(screenName) {
        this.logger.add('Screen Change', `Switched to ${screenName}`);
        this.currentScreen = screenName;
        this.ui.showScreen(screenName);
    }
    
    validateGoal() {
        const el = this.ui.elements;
        const isValid = el.goalInput.value.trim().length > 0;
        el.startBtn.disabled = !isValid;
        return isValid;
    }
    
    startRitualPhase() {
        if (!this.validateGoal()) return;
        this.currentGoal = this.ui.elements.goalInput.value.trim();
        this.showScreen('ritual');
    }
    
    selectRandomRitual() {
        const rituals = i18n.getRituals();
        const randomIndex = Math.floor(Math.random() * rituals.length);
        this.selectRitual(randomIndex);
    }
    
    selectRitual(index) {
        const el = this.ui.elements;
        this.currentRitualIndex = index;
        const rituals = i18n.getRituals();
        const ritual = rituals[index];
        
        el.ritualIcon.innerHTML = getRitualIcon(index);
        el.ritualText.textContent = ritual.text;
        
        const options = el.ritualOptions.querySelectorAll('.ritual-option');
        options.forEach((option, i) => {
            const isSelected = i === index;
            option.classList.toggle('selected', isSelected);
            if (isSelected) {
                option.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });

        this.logger.add('Ritual Selected', ritual.text);
        
        if (!el.ritualInputWrapper.classList.contains('hidden')) {
            this.toggleCustomRitualMode();
        }
    }
    
    toggleCustomRitualMode() {
        const el = this.ui.elements;
        const isInputVisible = !el.ritualInputWrapper.classList.contains('hidden');
        
        if (isInputVisible) {
            el.ritualInputWrapper.classList.add('hidden');
            el.ritualText.classList.remove('hidden');
            el.ritualInput.value = '';
            
            const iconIndex = typeof this.currentRitualIndex === 'number' ? this.currentRitualIndex : 0;
            const isCustom = el.ritualText.textContent !== i18n.getRituals()[iconIndex]?.text;
            el.ritualIcon.innerHTML = isCustom ? getIcon('fileEdit', 48) : getRitualIcon(iconIndex);
            
            const icon = document.getElementById('customRitualIcon');
            if (icon) icon.innerHTML = getIcon('penTool', 18);
            const text = document.getElementById('customRitualText');
            if (text) text.textContent = i18n.t('customRitual');
        } else {
            el.ritualInputWrapper.classList.remove('hidden');
            el.ritualText.classList.add('hidden');
            el.ritualInput.focus();
            
            el.ritualIcon.innerHTML = getIcon('fileEdit', 48);
            
            const icon = document.getElementById('customRitualIcon');
            if (icon) icon.innerHTML = getIcon('x', 18);
            const text = document.getElementById('customRitualText');
            if (text) text.textContent = i18n.t('cancel');
        }
    }

    saveCustomRitual() {
        const text = this.ritualInput.value.trim();
        if (text) {
            this.ritualText.textContent = text;
            this.ritualIcon.innerHTML = getIcon('fileEdit', 48); // Set custom icon
            this.logger.add('Custom Ritual Set', text);
            this.toggleCustomRitualMode();
            
            // Deselect list items
            this.ritualOptions.querySelectorAll('.ritual-option').forEach(opt => opt.classList.remove('selected'));
        }
    }
    
    completeRitual() {
        const el = this.ui.elements;
        if (!el.ritualInputWrapper.classList.contains('hidden')) {
            if (el.ritualInput.value.trim()) {
                this.saveCustomRitual();
            } else {
                this.toggleCustomRitualMode();
            }
        }

        this.showScreen('ninety');
        this.resetNinetyTimer();
    }
    
    resetNinetyTimer() {
        const el = this.ui.elements;
        if (this.ninetyTimer) this.ninetyTimer.stop();
        el.ninetyTime.textContent = CONFIG.TIMERS.NINETY_SECONDS_RULE;
        this.setProgress(0);
        el.start90Text.textContent = i18n.t('start90');
        el.start90Btn.disabled = false;
    }
    
    start90Seconds() {
        const el = this.ui.elements;
        el.start90Btn.disabled = true;
        el.start90Text.textContent = i18n.t('continuing');
        
        this.ninetyTimer = new Timer({
            duration: CONFIG.TIMERS.NINETY_SECONDS_RULE,
            onTick: (seconds) => {
                el.ninetyTime.textContent = seconds;
                this.setProgress((CONFIG.TIMERS.NINETY_SECONDS_RULE - seconds) / CONFIG.TIMERS.NINETY_SECONDS_RULE);
                document.title = `(${seconds}s) ${CONFIG.APP_NAME}`;
            },
            onComplete: () => {
                this.startFocusSession();
            }
        });
        
        this.ninetyTimer.start();
    }
    
    setProgress(percent) {
        const circumference = 2 * Math.PI * 90;
        const offset = circumference * (1 - percent);
        this.ui.elements.progressRing.style.strokeDashoffset = offset;
    }
    
    startFocusSession() {
        const el = this.ui.elements;
        this.showScreen('focus');
        el.currentGoalText.textContent = this.currentGoal;
        this.isPaused = false;
        this.lastEnergyCheck = Date.now();
        
        this.totalBreakSeconds = 0;
        if (el.focusBreakStats) el.focusBreakStats.classList.add('hidden');
        this.logger.clear();
        this.logger.add('Session Started', `Goal: ${this.currentGoal}`);
        
        if (el.focusTimerDisplay) el.focusTimerDisplay.classList.add('breathing');
        
        this.focusTimer = new Timer({
            isCountdown: false,
            onTick: (elapsed) => {
                const mins = Math.floor(elapsed / 60);
                const secs = elapsed % 60;
                const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                el.focusMinutes.textContent = String(mins).padStart(2, '0');
                el.focusSeconds.textContent = String(secs).padStart(2, '0');
                
                if (this.isPaused) {
                    document.title = `[Paused] ${CONFIG.APP_NAME}`;
                } else {
                    document.title = `${timeStr} - ${CONFIG.APP_NAME}`;
                }
                
                this.checkEnergyInterval();
            }
        });
        
        this.focusTimer.start();
        el.pauseBtn.innerHTML = getIcon('pause', 24);
        el.focusStatus.textContent = i18n.t('inFlow');
    }
    
    togglePause() {
        const el = this.ui.elements;
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.focusTimer.pause();
            el.pauseBtn.innerHTML = getIcon('play', 24);
            el.focusStatus.textContent = i18n.t('paused');
            el.focusStatus.style.color = 'var(--warning)';
            if (el.focusTimerDisplay) el.focusTimerDisplay.classList.remove('breathing');
        } else {
            this.focusTimer.resume();
            el.pauseBtn.innerHTML = getIcon('pause', 24);
            el.focusStatus.textContent = i18n.t('inFlow');
            el.focusStatus.style.color = '';
            if (el.focusTimerDisplay) el.focusTimerDisplay.classList.add('breathing');
        }
    }
    
    checkEnergyInterval() {
        if (Date.now() - this.lastEnergyCheck >= this.energyCheckInterval) {
            this.showEnergyCheck();
        }
    }
    
    showEnergyCheck() {
        this.focusTimer.pause();
        this.isPaused = true;
        this.ui.elements.energyCheck.classList.remove('hidden');
    }
    
    handleEnergyCheck(level) {
        const el = this.ui.elements;
        el.energyCheck.classList.add('hidden');
        this.lastEnergyCheck = Date.now();
        
        if (level === 'low') {
            this.handleImmediateBreak();
        } else {
            this.isPaused = false;
            this.focusTimer.resume();
            el.focusStatus.textContent = level === 'good' ? i18n.t('energyHigh') : i18n.t('continuing2');
            setTimeout(() => { if (!this.isPaused) el.focusStatus.textContent = i18n.t('inFlow'); }, CONFIG.UI.ENERGY_FEEDBACK_DURATION);
        }
    }
    
    handleImmediateBreak() {
        // Just start break, don't end session
        this.isPaused = true;
        // Timer is already paused by showEnergyCheck
        this.startBreak();
    }
    
    endSession(isImmediateBreak = false) {
        const el = this.ui.elements;
        if (this.focusTimer) this.focusTimer.stop();
        const elapsedSeconds = this.focusTimer ? this.focusTimer.elapsedSeconds : 0;
        const durationMinutes = Math.floor(elapsedSeconds / 60);
        const durationSeconds = elapsedSeconds % 60;
        
        this.stats.sessions++;
        this.stats.totalMinutes += durationMinutes;
        saveStats(this.stats);
        this.ui.updateStats(this.stats.sessions, this.stats.totalMinutes);
        
        el.sessionDuration.textContent = durationMinutes;
        el.sessionDuration.dataset.fullDuration = `${durationMinutes}m ${durationSeconds}s`;
        el.sessionGoal.textContent = this.currentGoal.substring(0, CONFIG.UI.MAX_GOAL_LENGTH_DISPLAY) + (this.currentGoal.length > CONFIG.UI.MAX_GOAL_LENGTH_DISPLAY ? '...' : '');
        
        if (!isImmediateBreak) {
            this.showScreen('complete');
        }
    }
    
    startBreak() {
        const el = this.ui.elements;
        this.breakStartTime = Date.now();
        this.logger.add('Break Started', 'User initiated break');
        el.breakOverlay.classList.remove('hidden');
        const breakTips = i18n.getBreakTips();
        el.breakTip.textContent = breakTips[Math.floor(Math.random() * breakTips.length)];
        
        this.breakTimer = new Timer({
            duration: CONFIG.TIMERS.DEFAULT_BREAK_DURATION,
            onTick: (seconds) => {
                this.updateBreakTimerUI(seconds);
            },
            onComplete: () => {
                this.endBreak();
            }
        });
        
        this.breakTimer.start();
    }
    
    extendBreak() {
        if (this.breakTimer) {
            this.breakTimer.extend(CONFIG.TIMERS.BREAK_EXTENSION);
            this.updateBreakTimerUI(this.breakTimer.remainingSeconds);
        }
    }
    
    updateBreakTimerUI(seconds) {
        const el = this.ui.elements;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const timeStr = `${mins}:${String(secs).padStart(2, '0')}`;
        el.breakTimer.textContent = timeStr;
        document.title = `☕ ${timeStr} - ${CONFIG.APP_NAME}`;
        
        if (el.breakProgressRing) {
            const circumference = 283;
            const total = this.breakTimer.duration;
            const offset = circumference * (1 - seconds / total);
            el.breakProgressRing.style.strokeDashoffset = offset;
        }
    }
    
    endBreak() {
        const el = this.ui.elements;
        if (this.breakTimer) this.breakTimer.stop();
        
        if (this.breakStartTime) {
            const breakDuration = Math.floor((Date.now() - this.breakStartTime) / 1000);
            this.totalBreakSeconds += breakDuration;
            const breakMins = Math.floor(breakDuration / 60);
            const breakSecs = breakDuration % 60;
            this.logger.add('Break Ended', `Duration: ${breakMins}m ${breakSecs}s`);
            this.breakStartTime = null;

            if (el.focusBreakStats) {
                const totalMins = Math.floor(this.totalBreakSeconds / 60);
                const timeDisplay = totalMins > 0 ? `${totalMins}m` : `${this.totalBreakSeconds}s`;
                el.focusBreakStats.textContent = i18n.t('breakTime', { time: timeDisplay });
                el.focusBreakStats.classList.remove('hidden');
            }
        }

        el.breakOverlay.classList.add('hidden');
        this.isPaused = false;
        if (this.focusTimer) this.focusTimer.resume();

        this.lastEnergyCheck = Date.now();
        const timeStr = `${el.focusMinutes.textContent}:${el.focusSeconds.textContent}`;
        document.title = `${timeStr} - ${CONFIG.APP_NAME}`;
    }
    
    resetToWelcome() {
        const el = this.ui.elements;
        this.currentGoal = '';
        el.goalInput.value = '';
        el.startBtn.disabled = true;
        this.resetNinetyTimer();
        this.showScreen('welcome');
    }
    


    generateLog() {
        const el = this.ui.elements;
        return this.logger.generateContent({
            goal: this.currentGoal,
            duration: el.sessionDuration.dataset.fullDuration || `${el.sessionDuration.textContent}m`,
            totalBreakSeconds: this.totalBreakSeconds
        });
    }

    async copyLog() {
        const logContent = this.generateLog();
        const success = await this.logger.copyToClipboard(logContent);
        
        if (success) {
            const el = this.ui.elements.copyLogText;
            const originalText = el.textContent;
            el.textContent = i18n.t('logCopied');
            setTimeout(() => { el.textContent = originalText; }, CONFIG.UI.TOAST_DURATION);
        }
    }

    downloadLog() {
        const logContent = this.generateLog();
        this.logger.downloadFile(logContent);
    }

    viewLog() {
        const logContent = this.generateLog();
        const el = this.ui.elements;
        if (el.logContentArea && el.logOverlay) {
            el.logContentArea.textContent = logContent;
            el.logOverlay.classList.remove('hidden');
        }
    }

    closeLog() {
        if (this.ui.elements.logOverlay) {
            this.ui.elements.logOverlay.classList.add('hidden');
        }
    }
    
    toggleTheme() {
        const isAmoled = document.body.classList.toggle('amoled-mode');
        localStorage.setItem(CONFIG.STORAGE.AMOLED_MODE, isAmoled);
    }
    



}
