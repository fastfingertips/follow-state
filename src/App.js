/**
 * Flow State - Main Application Class
 */
import { CONFIG } from './core/config.js';


import i18n from './core/i18n.js';
import { getIcon, getRitualIcon } from './core/icons.js';
import { loadStats, saveStats } from './core/storage.js';
import { initFullscreen } from './core/fullscreen.js';

// Import Components
import { Welcome } from './components/Welcome.js';
import { Ritual } from './components/Ritual.js';
import { NinetySeconds } from './components/NinetySeconds.js';
import { Focus } from './components/Focus.js';
import { EnergyCheck } from './components/EnergyCheck.js';
import { Complete } from './components/Complete.js';
import { Break } from './components/Break.js';

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
    sessionLogs = [];
    totalBreakSeconds = 0;

    constructor() {
        this.init();
    }
    
    init() {
        this.renderShell();
        this.cacheElements();
        this.updateUIText();
        this.setIcons();
        this.bindEvents(true); // Bind everything initially
        this.updateStatsDisplay();
        this.selectRandomRitual();
        this.addSVGGradient();
        this.showScreen('welcome'); // Show welcome screen explicitly
        
        // Soft focus: Wait for screen fade animation to complete
        setTimeout(() => {
            if (this.goalInput) this.goalInput.focus();
        }, 500);

        initFullscreen('fullscreenToggle');
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
        this.sessionGoal = document.getElementById('sessionGoal');
        this.takeBreakBtn = document.getElementById('takeBreakBtn');
        this.newSessionBtn = document.getElementById('newSessionBtn');
        this.copyLogBtn = document.getElementById('copyLogBtn');
        this.downloadLogBtn = document.getElementById('downloadLogBtn');
        this.breakOverlay = document.getElementById('breakOverlay');
        this.breakTip = document.getElementById('breakTip');
        this.breakTimerDisplay = document.getElementById('breakTimer');
        this.breakProgressRing = document.getElementById('breakProgressRing');
        this.endBreakBtn = document.getElementById('endBreakBtn');
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
        this.endBreakBtn.addEventListener('click', () => this.endBreak());
        
        if (this.copyLogBtn) this.copyLogBtn.addEventListener('click', () => this.copyLog());
        if (this.downloadLogBtn) this.downloadLogBtn.addEventListener('click', () => this.downloadLog());

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
            globalThis.addEventListener('keydown', (e) => {
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
            });
        }
    }
    
    updateUIText() {
        document.documentElement.lang = i18n.getCurrentLang();
        document.getElementById('logoText').textContent = i18n.t('appName');
        document.getElementById('sessionsLabel').textContent = i18n.t('sessions');
        document.getElementById('minutesLabel').textContent = i18n.t('minutes');
        document.getElementById('langText').textContent = i18n.getCurrentLang().toUpperCase();
        
        const copyLogText = document.getElementById('copyLogText');
        if (copyLogText) copyLogText.textContent = i18n.t('copyLog');
        
        const downloadLogText = document.getElementById('downloadLogText');
        if (downloadLogText) downloadLogText.textContent = i18n.t('downloadLog');

        const customRitualText = document.getElementById('customRitualText');
        if (customRitualText) customRitualText.textContent = i18n.t('customRitual');
        
        if (this.ritualInput) this.ritualInput.placeholder = i18n.t('customRitualPlaceholder');

        if (this.focusBreakStats && !this.focusBreakStats.classList.contains('hidden')) {
            const totalMins = Math.floor(this.totalBreakSeconds / 60);
            const timeDisplay = totalMins > 0 ? `${totalMins}m` : `${this.totalBreakSeconds}s`;
            this.focusBreakStats.textContent = i18n.t('breakTime', { time: timeDisplay });
        }
        
        // Render ritual options
        this.renderRitualOptions();
    }
    
    setIcons() {
        document.getElementById('logoIcon').innerHTML = getIcon('focus', 28);
        document.getElementById('fullscreenIcon').innerHTML = getIcon('maximize', 18);
        document.getElementById('langIcon').innerHTML = getIcon('globe', 16);
        document.getElementById('startBtnIcon').innerHTML = getIcon('arrowRight', 20);
        document.getElementById('newRitualIcon').innerHTML = getIcon('refresh', 18);
        document.getElementById('customRitualIcon').innerHTML = getIcon('penTool', 18);
        document.getElementById('ritualDoneIcon').innerHTML = getIcon('check', 18);
        document.getElementById('start90Icon').innerHTML = getIcon('rocket', 20);
        this.pauseBtn.innerHTML = getIcon('pause', 24);
        this.focusBreakBtn.innerHTML = getIcon('coffee', 24);
        this.endSessionBtn.innerHTML = getIcon('stop', 24);
        document.getElementById('energyIcon').innerHTML = getIcon('battery', 40);
        document.getElementById('energyGoodIcon').innerHTML = getIcon('zap', 20);
        document.getElementById('energyMidIcon').innerHTML = getIcon('meh', 20);
        document.getElementById('energyLowIcon').innerHTML = getIcon('moon', 20);
        document.getElementById('completeIcon').innerHTML = getIcon('trophy', 64);
        
        // Header Icons
        document.getElementById('themeIcon').innerHTML = getIcon('sun', 16);
        
        document.getElementById('durationIcon').innerHTML = getIcon('timer', 28);
        document.getElementById('goalIcon').innerHTML = getIcon('target', 28);
        document.getElementById('takeBreakIcon').innerHTML = getIcon('coffee', 18);
        document.getElementById('newSessionIcon').innerHTML = getIcon('refresh', 18);
        document.getElementById('breakIcon').innerHTML = getIcon('coffee', 64);
        
        // Log Icons
        const copyLogIcon = document.getElementById('copyLogIcon');
        if (copyLogIcon) copyLogIcon.innerHTML = getIcon('copy', 14);
        
        const downloadLogIcon = document.getElementById('downloadLogIcon');
        if (downloadLogIcon) downloadLogIcon.innerHTML = getIcon('download', 14);

        // Footer Icons
        document.getElementById('footerVersionIcon').innerHTML = getIcon('hash', 14);
        document.getElementById('footerUserIcon').innerHTML = getIcon('user', 14);
        document.getElementById('footerGithubIcon').innerHTML = getIcon('github', 14);
        
        // Quick goal icons
        document.querySelector('[data-goal="quickCode"] .quick-icon').innerHTML = getIcon('code', 16);
        document.querySelector('[data-goal="quickDesign"] .quick-icon').innerHTML = getIcon('palette', 16);
        document.querySelector('[data-goal="quickWriting"] .quick-icon').innerHTML = getIcon('penTool', 16);
        document.querySelector('[data-goal="quickLearning"] .quick-icon').innerHTML = getIcon('bookOpen', 16);
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
        const isNinetyRunning = this.ninetyTimer !== null;
        const savedNinetyTime = this.ninetyTime ? this.ninetyTime.textContent : null;

        const newLang = i18n.getCurrentLang() === 'en' ? 'tr' : 'en';
        i18n.setLanguage(newLang);
        
        // Re-render components to apply new translations
        this.renderShell();
        this.cacheElements();
        this.updateUIText();
        this.setIcons();
        this.bindEvents(false); // Only bind screen events, not static ones
        this.updateStatsDisplay();
        
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
            if (savedNinetyTime) this.ninetyTime.textContent = savedNinetyTime;
        }

        this.selectRitual(this.currentRitualIndex);
        this.addSVGGradient();
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

        this.addLog('Ritual Selected', ritual.text);
        
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
            this.addLog('Custom Ritual Set', text);
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
        this.ninetyTime.textContent = CONFIG.TIMERS.NINETY_SECONDS_RULE;
        this.setProgress(0);
        document.getElementById('start90Text').textContent = i18n.t('start90');
        this.start90Btn.disabled = false;
    }
    
    start90Seconds() {
        let seconds = CONFIG.TIMERS.NINETY_SECONDS_RULE;
        this.start90Btn.disabled = true;
        document.getElementById('start90Text').textContent = i18n.t('continuing');
        
        this.ninetyTimer = setInterval(() => {
            seconds--;
            this.ninetyTime.textContent = seconds;
            this.setProgress((CONFIG.TIMERS.NINETY_SECONDS_RULE - seconds) / CONFIG.TIMERS.NINETY_SECONDS_RULE);
            
            if (seconds <= 0) {
                clearInterval(this.ninetyTimer);
                this.startFocusSession();
            } else {
                document.title = `(${seconds}s) ${CONFIG.APP_NAME}`;
            }
        }, 1000);
    }
    
    setProgress(percent) {
        const circumference = 2 * Math.PI * CONFIG.TIMERS.NINETY_SECONDS_RULE;
        const offset = circumference * (1 - percent);
        this.progressRing.style.strokeDashoffset = offset;
    }
    
    startFocusSession() {
        this.showScreen('focus');
        this.currentGoalText.textContent = this.currentGoal;
        this.focusStartTime = Date.now();
        this.isPaused = false;
        this.lastEnergyCheck = Date.now();
        
        // Reset session tracking
        this.totalBreakSeconds = 0;
        if (this.focusBreakStats) this.focusBreakStats.classList.add('hidden');
        this.sessionLogs = [];
        this.addLog('Session Started', `Goal: ${this.currentGoal}`);
        
        if (this.focusTimerDisplay) this.focusTimerDisplay.classList.add('breathing');
        
        this.updateFocusTimer();
        this.focusTimer = setInterval(() => {
            if (!this.isPaused) {
                this.updateFocusTimer();
                this.checkEnergyInterval();
            }
        }, 1000);
        
        this.pauseBtn.innerHTML = getIcon('pause', 24);
        this.focusStatus.textContent = i18n.t('inFlow');
    }
    
    updateFocusTimer() {
        const elapsed = Math.floor((Date.now() - this.focusStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        this.focusMinutes.textContent = String(minutes).padStart(2, '0');
        this.focusSeconds.textContent = String(seconds).padStart(2, '0');
        
        if (this.isPaused) {
            document.title = `[Paused] ${CONFIG.APP_NAME}`;
        } else {
            document.title = `${timeStr} - ${CONFIG.APP_NAME}`;
        }
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.pauseStartTime = Date.now();
            this.pauseBtn.innerHTML = getIcon('play', 24);
            this.focusStatus.textContent = i18n.t('paused');
            this.focusStatus.style.color = 'var(--warning)';
            if (this.focusTimerDisplay) this.focusTimerDisplay.classList.remove('breathing');
        } else {
            if (this.pauseStartTime) {
                const pausedDuration = Date.now() - this.pauseStartTime;
                this.focusStartTime += pausedDuration;
                this.pauseStartTime = null;
            }
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
        this.isPaused = true;
        this.pauseStartTime = Date.now();
        this.energyCheck.classList.remove('hidden');
    }
    
    handleEnergyCheck(level) {
        this.energyCheck.classList.add('hidden');
        this.lastEnergyCheck = Date.now();
        
        if (level === 'low') {
            this.endSession();
            this.startBreak();
        } else {
            this.isPaused = false;
            // Adjust start time for the pause duration during energy check
            if (this.pauseStartTime) {
                const pausedDuration = Date.now() - this.pauseStartTime;
                this.focusStartTime += pausedDuration;
                this.pauseStartTime = null;
            }
            this.focusStatus.textContent = level === 'good' ? i18n.t('energyHigh') : i18n.t('continuing2');
            setTimeout(() => { if (!this.isPaused) this.focusStatus.textContent = i18n.t('inFlow'); }, 3000);
        }
    }
    
    handleImmediateBreak() {
        // Just start break, don't end session
        this.isPaused = true;
        this.pauseStartTime = Date.now();
        this.startBreak();
    }
    
    endSession(isImmediateBreak = false) {
        clearInterval(this.focusTimer);
        const elapsedSeconds = Math.floor((Date.now() - this.focusStartTime) / 1000);
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
        this.addLog('Break Started', 'User initiated break');
        this.breakOverlay.classList.remove('hidden');
        const breakTips = i18n.getBreakTips();
        this.breakTip.textContent = breakTips[Math.floor(Math.random() * breakTips.length)];
        
        let seconds = CONFIG.TIMERS.DEFAULT_BREAK_DURATION;
        this.updateBreakTimer(seconds);
        
        this.breakTimer = setInterval(() => {
            seconds--;
            this.updateBreakTimer(seconds);
            if (seconds <= 0) this.endBreak();
        }, 1000);
    }
    
    updateBreakTimer(seconds) {
        const total = CONFIG.TIMERS.DEFAULT_BREAK_DURATION;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const timeStr = `${mins}:${String(secs).padStart(2, '0')}`;
        this.breakTimerDisplay.textContent = timeStr;
        document.title = `☕ ${timeStr} - ${CONFIG.APP_NAME}`;
        
        // Update break progress ring
        if (this.breakProgressRing) {
            const circumference = 283; // 2 * PI * 45
            const offset = circumference * (1 - seconds / total);
            this.breakProgressRing.style.strokeDashoffset = offset;
        }
    }
    
    endBreak() {
        clearInterval(this.breakTimer);
        
        if (this.breakStartTime) {
            const breakDuration = Math.floor((Date.now() - this.breakStartTime) / 1000);
            this.totalBreakSeconds += breakDuration;
            const breakMins = Math.floor(breakDuration / 60);
            const breakSecs = breakDuration % 60;
            this.addLog('Break Ended', `Duration: ${breakMins}m ${breakSecs}s`);
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
        
        // Adjust start time for the break duration
        if (this.pauseStartTime) {
            const pausedDuration = Date.now() - this.pauseStartTime;
            this.focusStartTime += pausedDuration;
            this.pauseStartTime = null;
        }

        this.lastEnergyCheck = Date.now(); // Reset energy check timer
        this.updateFocusTimer(); // Refresh title and status
        document.title = `${this.focusMinutes.textContent}:${this.focusSeconds.textContent} - ${CONFIG.APP_NAME}`;
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
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();
        const duration = this.sessionDuration.dataset.fullDuration || `${this.sessionDuration.textContent}m`;
        const goal = this.currentGoal;

        const logs = this.sessionLogs.map(log => `[${log.time}] (${log.action}): ${log.details}`).join('\n');
        
        const totalBreakMins = Math.floor(this.totalBreakSeconds / 60);
        const totalBreakSecs = this.totalBreakSeconds % 60;
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
${logs}
----------------------------------------
${i18n.t('logFooter')}
${i18n.t('logFooterLink')}`;
    }

    async copyLog() {
        const logContent = this.generateLog();
        try {
            await navigator.clipboard.writeText(logContent);
            
            const originalText = document.getElementById('copyLogText').textContent;
            document.getElementById('copyLogText').textContent = i18n.t('logCopied');
            
            setTimeout(() => {
                document.getElementById('copyLogText').textContent = originalText;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy log:', err);
        }
    }

    downloadLog() {
        const logContent = this.generateLog();
        const blob = new Blob([logContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const timestamp = new Date().toISOString().replaceAll(/[:.]/g, '-');
        a.href = url;
        a.download = `flow-state-log-${timestamp}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
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

    addLog(action, details = '') {
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        this.sessionLogs.push({ time: timeStr, action, details });
    }
}
