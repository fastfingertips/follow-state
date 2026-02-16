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

// Import Components
import { Welcome } from './components/Welcome.js';
import { Ritual } from './components/Ritual.js';
import { NinetySeconds } from './components/NinetySeconds.js';
import { Focus } from './components/Focus.js';
import { EnergyCheck } from './components/EnergyCheck.js';
import { Complete } from './components/Complete.js';
import { Break } from './components/Break.js';
import { LogModal } from './components/LogModal.js';

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
            if (this.goalInput) this.goalInput.focus();
        }, CONFIG.UI.SOFT_FOCUS_DELAY);

        initFullscreen('fullscreenToggle');
    }

    refreshUI(isInitial = false) {
        this.renderShell();
        this.cacheElements();
        this.updateUIText();
        this.setIcons();
        this.bindEvents(isInitial);
        this.updateStatsDisplay();
        this.addSVGGradient();
    }

    renderShell() {
        const screenContainer = document.getElementById('screenContainer');
        const overlayContainer = document.getElementById('overlayContainer');

        if (screenContainer) {
            screenContainer.innerHTML = `
                ${Welcome()}
                ${Ritual()}
                ${NinetySeconds()}
                ${Focus()}
                ${Complete()}
            `;
        }

        if (overlayContainer) {
            overlayContainer.innerHTML = `
                ${EnergyCheck()}
                ${Break()}
                ${LogModal()}
            `;
        }
    }
    
    cacheElements() {
        this.screens = {
            welcome: document.getElementById('welcomeScreen'),
            ritual: document.getElementById('ritualScreen'),
            ninety: document.getElementById('ninetyScreen'),
            focus: document.getElementById('focusScreen'),
            complete: document.getElementById('completeScreen')
        };
        
        this.goalInput = document.getElementById('goalInput');
        this.startBtn = document.getElementById('startBtn');
        this.quickGoals = document.querySelectorAll('.quick-goal');
        this.ritualIcon = document.getElementById('ritualIcon');
        this.ritualText = document.getElementById('ritualText');
        this.ritualOptions = document.getElementById('ritualOptions');
        this.newRitualBtn = document.getElementById('newRitualBtn');
        this.customRitualBtn = document.getElementById('customRitualBtn');
        this.ritualInputWrapper = document.getElementById('ritualInputWrapper');
        this.ritualInput = document.getElementById('ritualInput');
        this.ritualDoneBtn = document.getElementById('ritualDoneBtn');
        this.ninetyTime = document.getElementById('ninetyTime');
        this.progressRing = document.getElementById('progressRing');
        this.start90Btn = document.getElementById('start90Btn');
        this.currentGoalText = document.getElementById('currentGoalText');
        this.focusMinutes = document.getElementById('focusMinutes');
        this.focusSeconds = document.getElementById('focusSeconds');
        this.focusTimerDisplay = document.getElementById('focusTimerDisplay');
        this.focusStatus = document.getElementById('focusStatus');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.focusBreakBtn = document.getElementById('focusBreakBtn');
        this.focusBreakStats = document.getElementById('focusBreakStats');
        this.endSessionBtn = document.getElementById('endSessionBtn');
        this.energyCheck = document.getElementById('energyCheck');
        this.sessionDuration = document.getElementById('sessionDuration');
        this.sessionGoal = document.getElementById('sessionGoal');
        this.takeBreakBtn = document.getElementById('takeBreakBtn');
        this.newSessionBtn = document.getElementById('newSessionBtn');
        this.copyLogBtn = document.getElementById('copyLogBtn');
        this.viewLogBtn = document.getElementById('viewLogBtn');
        this.downloadLogBtn = document.getElementById('downloadLogBtn');
        this.breakOverlay = document.getElementById('breakOverlay');
        this.breakTip = document.getElementById('breakTip');
        this.breakTimerDisplay = document.getElementById('breakTimer');
        this.breakProgressRing = document.getElementById('breakProgressRing');
        this.extendBreakBtn = document.getElementById('extendBreakBtn');
        this.endBreakBtn = document.getElementById('endBreakBtn');
        this.logOverlay = document.getElementById('logOverlay');
        this.closeLogBtn = document.getElementById('closeLogBtn');
        this.logContentArea = document.getElementById('logContentArea');
        this.totalSessions = document.getElementById('totalSessions');
        this.totalMinutes = document.getElementById('totalMinutes');
        this.langToggle = document.getElementById('langToggle');
        this.appContainer = document.querySelector('.app-container');
    }
    
    bindEvents(isInitial = false) {
        // Screen-specific events (these elements are re-created on shell render)
        this.goalInput.addEventListener('input', () => this.validateGoal());
        this.goalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.goalInput.value.trim()) this.startRitualPhase();
        });
        this.startBtn.addEventListener('click', () => this.startRitualPhase());
        
        this.quickGoals.forEach(btn => {
            btn.addEventListener('click', () => {
                const goalKey = btn.dataset.goal;
                this.goalInput.value = i18n.t(goalKey);
                this.validateGoal();
            });
        });

        this.newRitualBtn.addEventListener('click', () => this.selectRandomRitual());
        this.customRitualBtn.addEventListener('click', () => this.toggleCustomRitualMode());
        this.ritualInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.saveCustomRitual();
            if (e.key === 'Escape') this.toggleCustomRitualMode();
        });
        this.ritualDoneBtn.addEventListener('click', () => this.completeRitual());
        this.start90Btn.addEventListener('click', () => this.start90Seconds());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.focusBreakBtn.addEventListener('click', () => this.handleImmediateBreak());
        this.endSessionBtn.addEventListener('click', () => this.endSession());

        document.getElementById('energyGood').addEventListener('click', () => this.handleEnergyCheck('good'));
        document.getElementById('energyMid').addEventListener('click', () => this.handleEnergyCheck('mid'));
        document.getElementById('energyLow').addEventListener('click', () => this.handleEnergyCheck('low'));

        this.takeBreakBtn.addEventListener('click', () => this.startBreak());
        this.newSessionBtn.addEventListener('click', () => this.resetToWelcome());
        this.extendBreakBtn.addEventListener('click', () => this.extendBreak());
        this.endBreakBtn.addEventListener('click', () => this.endBreak());
        
        if (this.copyLogBtn) this.copyLogBtn.addEventListener('click', () => this.copyLog());
        if (this.viewLogBtn) this.viewLogBtn.addEventListener('click', () => this.viewLog());
        if (this.downloadLogBtn) this.downloadLogBtn.addEventListener('click', () => this.downloadLog());
        
        if (this.closeLogBtn) this.closeLogBtn.addEventListener('click', () => this.closeLog());
        if (this.logOverlay) this.logOverlay.addEventListener('click', (e) => {
            if (e.target === this.logOverlay) this.closeLog();
        });

        // Static events (these elements are in index.html and NOT re-created)
        if (isInitial) {
            this.langToggle.addEventListener('click', () => this.toggleLanguage());

            this.themeToggle = document.getElementById('themeToggle');
            if (this.themeToggle) {
                this.themeToggle.addEventListener('click', () => this.toggleTheme());
                // Load saved theme
                const isAmoled = localStorage.getItem(CONFIG.STORAGE.AMOLED_MODE) === 'true';
                if (isAmoled) document.body.classList.add('amoled-mode');
            }
            
            // Global shortcuts
            globalThis.addEventListener('keydown', (e) => this.handleGlobalShortcuts(e));
        }
    }

    handleGlobalShortcuts(e) {
        if (e.key === 'Enter') {
            if (this.currentScreen === 'complete') {
                this.resetToWelcome();
            } else if (this.currentScreen === 'ritual') {
                this.completeRitual();
            } else if (this.currentScreen === 'ninety' && !this.start90Btn.disabled) {
                this.start90Seconds();
            } else if (this.currentScreen === 'welcome' && this.goalInput.value.trim()) {
                this.startRitualPhase();
            }
        }
        if (e.key === ' ' && this.currentScreen === 'ritual') {
            // Don't trigger if typing in input
            const isInputActive = !this.ritualInputWrapper.classList.contains('hidden');
            if (!isInputActive) {
                e.preventDefault();
                this.selectRandomRitual();
            }
        }
        if (e.key === 'Escape') {
            if (!this.energyCheck.classList.contains('hidden')) {
                this.handleEnergyCheck('good');
            } else if (!this.breakOverlay.classList.contains('hidden')) {
                this.endBreak();
            }
        }
    }
    
    updateUIText() {
        document.documentElement.lang = i18n.getCurrentLang();
        
        const textUpdates = {
            logoText: 'appName',
            sessionsLabel: 'sessions',
            minutesLabel: 'minutes',
            copyLogText: 'copyLog',
            downloadLogText: 'downloadLog',
            customRitualText: 'customRitual',
            extendBreakText: 'extendBreak',
            endBreakText: 'endBreak',
            allRitualsLabel: 'allRituals'
        };

        Object.entries(textUpdates).forEach(([id, tKey]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = i18n.t(tKey);
        });

        document.getElementById('langText').textContent = i18n.getCurrentLang().toUpperCase();
        
        if (this.ritualInput) this.ritualInput.placeholder = i18n.t('customRitualPlaceholder');

        if (this.focusBreakStats && !this.focusBreakStats.classList.contains('hidden')) {
            const totalMins = Math.floor(this.totalBreakSeconds / 60);
            const timeDisplay = totalMins > 0 ? `${totalMins}m` : `${this.totalBreakSeconds}s`;
            this.focusBreakStats.textContent = i18n.t('breakTime', { time: timeDisplay });
        }
        
        this.renderRitualOptions();
    }
    
    setIcons() {
        const iconUpdates = {
            logoIcon: { name: 'focus', size: 28 },
            fullscreenIcon: { name: 'maximize', size: 18 },
            langIcon: { name: 'globe', size: 16 },
            startBtnIcon: { name: 'arrowRight', size: 20 },
            newRitualIcon: { name: 'refresh', size: 18 },
            customRitualIcon: { name: 'penTool', size: 18 },
            ritualDoneIcon: { name: 'check', size: 18 },
            start90Icon: { name: 'rocket', size: 20 },
            energyIcon: { name: 'battery', size: 40 },
            energyGoodIcon: { name: 'zap', size: 20 },
            energyMidIcon: { name: 'meh', size: 20 },
            energyLowIcon: { name: 'moon', size: 20 },
            completeIcon: { name: 'trophy', size: 64 },
            themeIcon: { name: 'sun', size: 16 },
            durationIcon: { name: 'timer', size: 28 },
            goalIcon: { name: 'target', size: 28 },
            takeBreakIcon: { name: 'coffee', size: 18 },
            newSessionIcon: { name: 'refresh', size: 18 },
            breakIcon: { name: 'coffee', size: 64 },
            extendBreakIcon: { name: 'plus', size: 18 },
            copyLogIcon: { name: 'copy', size: 14 },
            viewLogIcon: { name: 'list', size: 14 },
            downloadLogIcon: { name: 'download', size: 14 },
            closeLogIcon: { name: 'x', size: 24 },
            footerVersionIcon: { name: 'hash', size: 14 },
            footerUserIcon: { name: 'user', size: 14 },
            footerGithubIcon: { name: 'github', size: 14 }
        };

        Object.entries(iconUpdates).forEach(([id, config]) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = getIcon(config.name, config.size);
        });

        // Update timer UI references in timers if they exist
        if (this.ninetyTimer) this.ninetyTimer.ui = this.ninetyTime;
        if (this.breakTimer) this.breakTimer.ui = this.breakTimerDisplay;

        // Direct element references
        if (this.pauseBtn) this.pauseBtn.innerHTML = getIcon('pause', 24);
        if (this.focusBreakBtn) this.focusBreakBtn.innerHTML = getIcon('coffee', 24);
        if (this.endSessionBtn) this.endSessionBtn.innerHTML = getIcon('stop', 24);
        
        // Quick goal icons
        document.querySelectorAll('.quick-goal').forEach(btn => {
            const icon = btn.querySelector('.quick-icon');
            const goal = btn.dataset.goal;
            const iconName = goal === 'quickCode' ? 'code' : 
                            goal === 'quickDesign' ? 'palette' : 
                            goal === 'quickWriting' ? 'penTool' : 'bookOpen';
            if (icon) icon.innerHTML = getIcon(iconName, 16);
        });
    }
    
    renderRitualOptions() {
        const rituals = i18n.getRituals();
        this.ritualOptions.innerHTML = rituals.map((ritual, index) => `
            <div class="ritual-option" data-index="${index}">
                <span class="ritual-option-icon">${getRitualIcon(index)}</span>
                <span class="ritual-option-text">${ritual.text}</span>
            </div>
        `).join('');
        
        this.ritualOptions.querySelectorAll('.ritual-option').forEach(option => {
            option.addEventListener('click', () => {
                this.selectRitual(Number.parseInt(option.dataset.index, 10));
            });
        });
    }
    
    toggleLanguage() {
        const savedScreen = this.currentScreen;
        const savedGoal = this.goalInput ? this.goalInput.value : '';
        const isNinetyRunning = this.ninetyTimer && this.ninetyTimer.interval !== null;
        
        const newLang = i18n.getCurrentLang() === 'en' ? 'tr' : 'en';
        i18n.setLanguage(newLang);
        
        this.refreshUI(false);
        
        // Restore previous state
        this.showScreen(savedScreen);
        
        // Restore goal input and its validation
        if (this.goalInput) {
            this.goalInput.value = savedGoal;
            this.validateGoal();
        }

        // Restore ninety timer state if running
        if (isNinetyRunning && this.start90Btn) {
            this.start90Btn.disabled = true;
            document.getElementById('start90Text').textContent = i18n.t('continuing');
        }

        this.selectRitual(this.currentRitualIndex);
    }
    
    showScreen(screenName) {
        this.addLog('Screen Change', `Switched to ${screenName}`);
        this.currentScreen = screenName;
        Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
        this.screens[screenName].classList.add('active');
        document.body.classList.toggle('focus-mode', screenName === 'focus');
        
        // Toggle wide mode for ritual screen
        if (this.appContainer) {
            this.appContainer.classList.toggle('wide', screenName === 'ritual');
        }

        // Reset title when not in an active timer screen
        if (!['ninety', 'focus'].includes(screenName) && !this.breakOverlay.classList.contains('active')) {
            document.title = CONFIG.APP_NAME;
        }
    }
    
    validateGoal() {
        const isValid = this.goalInput.value.trim().length > 0;
        this.startBtn.disabled = !isValid;
        return isValid;
    }
    
    startRitualPhase() {
        if (!this.validateGoal()) return;
        this.currentGoal = this.goalInput.value.trim();
        this.showScreen('ritual');
    }
    
    selectRandomRitual() {
        const rituals = i18n.getRituals();
        const randomIndex = Math.floor(Math.random() * rituals.length);
        this.selectRitual(randomIndex);
    }
    
    selectRitual(index) {
        this.currentRitualIndex = index;
        const rituals = i18n.getRituals();
        const ritual = rituals[index];
        
        this.ritualIcon.innerHTML = getRitualIcon(index);
        this.ritualText.textContent = ritual.text;
        
        const options = this.ritualOptions.querySelectorAll('.ritual-option');
        options.forEach((option, i) => {
            const isSelected = i === index;
            option.classList.toggle('selected', isSelected);
            if (isSelected) {
                option.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });

        this.logger.add('Ritual Selected', ritual.text);
        
        // Ensure input mode is off when selecting from list
        if (!this.ritualInputWrapper.classList.contains('hidden')) {
            this.toggleCustomRitualMode();
        }
    }
    
    toggleCustomRitualMode() {
        const isInputVisible = !this.ritualInputWrapper.classList.contains('hidden');
        
        if (isInputVisible) {
            // Hide Input (Cancel)
            this.ritualInputWrapper.classList.add('hidden');
            this.ritualText.classList.remove('hidden');
            this.ritualInput.value = '';
            
            // Restore icon (either default or saved custom icon)
            const iconIndex = typeof this.currentRitualIndex === 'number' ? this.currentRitualIndex : 0;
            // If custom text is set (meaning we saved a custom ritual previously), keep the edit icon, otherwise restore original
            const isCustom = this.ritualText.textContent !== i18n.getRituals()[iconIndex]?.text;
            this.ritualIcon.innerHTML = isCustom ? getIcon('fileEdit', 48) : getRitualIcon(iconIndex);
            
            // Reset button state
            const icon = document.getElementById('customRitualIcon');
            if (icon) icon.innerHTML = getIcon('penTool', 18);
            const text = document.getElementById('customRitualText');
            if (text) text.textContent = i18n.t('customRitual');
        } else {
            // Show Input
            this.ritualInputWrapper.classList.remove('hidden');
            this.ritualText.classList.add('hidden');
            this.ritualInput.focus();
            
            // Set edit icon
            this.ritualIcon.innerHTML = getIcon('fileEdit', 48);
            
            // Change button to Cancel
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
        // If in input mode and has text, save it first
        if (!this.ritualInputWrapper.classList.contains('hidden')) {
            if (this.ritualInput.value.trim()) {
                this.saveCustomRitual();
            } else {
                this.toggleCustomRitualMode(); // Cancel empty input
            }
        }

        this.showScreen('ninety');
        this.resetNinetyTimer();
    }
    
    resetNinetyTimer() {
        if (this.ninetyTimer) this.ninetyTimer.stop();
        this.ninetyTime.textContent = CONFIG.TIMERS.NINETY_SECONDS_RULE;
        this.setProgress(0);
        document.getElementById('start90Text').textContent = i18n.t('start90');
        this.start90Btn.disabled = false;
    }
    
    start90Seconds() {
        this.start90Btn.disabled = true;
        document.getElementById('start90Text').textContent = i18n.t('continuing');
        
        this.ninetyTimer = new Timer({
            duration: CONFIG.TIMERS.NINETY_SECONDS_RULE,
            onTick: (seconds) => {
                this.ninetyTime.textContent = seconds;
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
        const circumference = 2 * Math.PI * 90; // Fixed for SVG radius 90
        const offset = circumference * (1 - percent);
        this.progressRing.style.strokeDashoffset = offset;
    }
    
    startFocusSession() {
        this.showScreen('focus');
        this.currentGoalText.textContent = this.currentGoal;
        this.isPaused = false;
        this.lastEnergyCheck = Date.now();
        
        // Reset session tracking
        this.totalBreakSeconds = 0;
        if (this.focusBreakStats) this.focusBreakStats.classList.add('hidden');
        this.logger.clear();
        this.logger.add('Session Started', `Goal: ${this.currentGoal}`);
        
        if (this.focusTimerDisplay) this.focusTimerDisplay.classList.add('breathing');
        
        this.focusTimer = new Timer({
            isCountdown: false,
            onTick: (elapsed) => {
                const mins = Math.floor(elapsed / 60);
                const secs = elapsed % 60;
                const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                this.focusMinutes.textContent = String(mins).padStart(2, '0');
                this.focusSeconds.textContent = String(secs).padStart(2, '0');
                
                if (this.isPaused) {
                    document.title = `[Paused] ${CONFIG.APP_NAME}`;
                } else {
                    document.title = `${timeStr} - ${CONFIG.APP_NAME}`;
                }
                
                this.checkEnergyInterval();
            }
        });
        
        this.focusTimer.start();
        this.pauseBtn.innerHTML = getIcon('pause', 24);
        this.focusStatus.textContent = i18n.t('inFlow');
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.focusTimer.pause();
            this.pauseBtn.innerHTML = getIcon('play', 24);
            this.focusStatus.textContent = i18n.t('paused');
            this.focusStatus.style.color = 'var(--warning)';
            if (this.focusTimerDisplay) this.focusTimerDisplay.classList.remove('breathing');
        } else {
            this.focusTimer.resume();
            this.pauseBtn.innerHTML = getIcon('pause', 24);
            this.focusStatus.textContent = i18n.t('inFlow');
            this.focusStatus.style.color = '';
            if (this.focusTimerDisplay) this.focusTimerDisplay.classList.add('breathing');
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
        this.energyCheck.classList.remove('hidden');
    }
    
    handleEnergyCheck(level) {
        this.energyCheck.classList.add('hidden');
        this.lastEnergyCheck = Date.now();
        
        if (level === 'low') {
            this.handleImmediateBreak();
        } else {
            this.isPaused = false;
            this.focusTimer.resume();
            this.focusStatus.textContent = level === 'good' ? i18n.t('energyHigh') : i18n.t('continuing2');
            setTimeout(() => { if (!this.isPaused) this.focusStatus.textContent = i18n.t('inFlow'); }, CONFIG.UI.ENERGY_FEEDBACK_DURATION);
        }
    }
    
    handleImmediateBreak() {
        // Just start break, don't end session
        this.isPaused = true;
        // Timer is already paused by showEnergyCheck
        this.startBreak();
    }
    
    endSession(isImmediateBreak = false) {
        if (this.focusTimer) this.focusTimer.stop();
        const elapsedSeconds = this.focusTimer ? this.focusTimer.elapsedSeconds : 0;
        const durationMinutes = Math.floor(elapsedSeconds / 60);
        const durationSeconds = elapsedSeconds % 60;
        
        this.stats.sessions++;
        this.stats.totalMinutes += durationMinutes;
        saveStats(this.stats);
        this.updateStatsDisplay();
        
        // Store precise duration
        this.sessionDuration.textContent = durationMinutes;
        this.sessionDuration.dataset.fullDuration = `${durationMinutes}m ${durationSeconds}s`;
        this.sessionGoal.textContent = this.currentGoal.substring(0, CONFIG.UI.MAX_GOAL_LENGTH_DISPLAY) + (this.currentGoal.length > CONFIG.UI.MAX_GOAL_LENGTH_DISPLAY ? '...' : '');
        
        if (!isImmediateBreak) {
            this.showScreen('complete');
        }
    }
    
    startBreak() {
        this.breakStartTime = Date.now();
        this.logger.add('Break Started', 'User initiated break');
        this.breakOverlay.classList.remove('hidden');
        const breakTips = i18n.getBreakTips();
        this.breakTip.textContent = breakTips[Math.floor(Math.random() * breakTips.length)];
        
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
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const timeStr = `${mins}:${String(secs).padStart(2, '0')}`;
        this.breakTimerDisplay.textContent = timeStr;
        document.title = `☕ ${timeStr} - ${CONFIG.APP_NAME}`;
        
        if (this.breakProgressRing) {
            const circumference = 283; // 2 * PI * 45
            const total = this.breakTimer.duration;
            const offset = circumference * (1 - seconds / total);
            this.breakProgressRing.style.strokeDashoffset = offset;
        }
    }
    
    endBreak() {
        if (this.breakTimer) this.breakTimer.stop();
        
        if (this.breakStartTime) {
            const breakDuration = Math.floor((Date.now() - this.breakStartTime) / 1000);
            this.totalBreakSeconds += breakDuration;
            const breakMins = Math.floor(breakDuration / 60);
            const breakSecs = breakDuration % 60;
            this.logger.add('Break Ended', `Duration: ${breakMins}m ${breakSecs}s`);
            this.breakStartTime = null;

            // Update break stats display
            if (this.focusBreakStats) {
                const totalMins = Math.floor(this.totalBreakSeconds / 60);
                const timeDisplay = totalMins > 0 ? `${totalMins}m` : `${this.totalBreakSeconds}s`;
                this.focusBreakStats.textContent = i18n.t('breakTime', { time: timeDisplay });
                this.focusBreakStats.classList.remove('hidden');
            }
        }

        this.breakOverlay.classList.add('hidden');
        
        // Resume session
        this.isPaused = false;
        if (this.focusTimer) this.focusTimer.resume();

        this.lastEnergyCheck = Date.now(); // Reset energy check timer
        const timeStr = `${this.focusMinutes.textContent}:${this.focusSeconds.textContent}`;
        document.title = `${timeStr} - ${CONFIG.APP_NAME}`;
    }
    
    resetToWelcome() {
        this.currentGoal = '';
        this.goalInput.value = '';
        this.startBtn.disabled = true;
        this.resetNinetyTimer();
        this.showScreen('welcome');
    }
    
    updateStatsDisplay() {
        if (this.totalSessions) this.totalSessions.textContent = this.stats.sessions;
        if (this.totalMinutes) this.totalMinutes.textContent = this.stats.totalMinutes;
    }

    generateLog() {
        return this.logger.generateContent({
            goal: this.currentGoal,
            duration: this.sessionDuration.dataset.fullDuration || `${this.sessionDuration.textContent}m`,
            totalBreakSeconds: this.totalBreakSeconds
        });
    }

    async copyLog() {
        const logContent = this.generateLog();
        const success = await this.logger.copyToClipboard(logContent);
        
        if (success) {
            const el = document.getElementById('copyLogText');
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
        if (this.logContentArea && this.logOverlay) {
            this.logContentArea.textContent = logContent;
            this.logOverlay.classList.remove('hidden');
        }
    }

    closeLog() {
        if (this.logOverlay) {
            this.logOverlay.classList.add('hidden');
        }
    }
    
    toggleTheme() {
        const isAmoled = document.body.classList.toggle('amoled-mode');
        localStorage.setItem(CONFIG.STORAGE.AMOLED_MODE, isAmoled);
    }
    
    addSVGGradient() {
        const svg = document.querySelector('.progress-ring');
        if (!svg) return;
        
        // Check if gradient already exists
        if (svg.querySelector('#progressGradient')) return;
 
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color: hsl(260, 80%, 65%)" />
                <stop offset="100%" style="stop-color: hsl(180, 70%, 55%)" />
            </linearGradient>
        `;
        svg.insertBefore(defs, svg.firstChild);
        this.progressRing.setAttribute('stroke', 'url(#progressGradient)');
    }


}
