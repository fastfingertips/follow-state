import { CONFIG } from './config.js';
import i18n from './i18n.js';
import { getIcon, getRitualIcon } from './icons.js';

// Import Components
import { Welcome } from '../components/Welcome.js';
import { Ritual } from '../components/Ritual.js';
import { NinetySeconds } from '../components/NinetySeconds.js';
import { Focus } from '../components/Focus.js';
import { EnergyCheck } from '../components/EnergyCheck.js';
import { Complete } from '../components/Complete.js';
import { Break } from '../components/Break.js';
import { LogModal } from '../components/LogModal.js';

/**
 * Flow State - UI Manager
 * Handles DOM manipulation, shell rendering, and screen management
 */
export class UIManager {
    constructor(app) {
        this.app = app;
        this.elements = {};
        this.screens = {};
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

        const ids = [
            'goalInput', 'startBtn', 'ritualIcon', 'ritualText', 'ritualOptions',
            'newRitualBtn', 'customRitualBtn', 'ritualInputWrapper', 'ritualInput',
            'ritualDoneBtn', 'ninetyTime', 'progressRing', 'start90Btn',
            'currentGoalText', 'focusMinutes', 'focusSeconds', 'focusTimerDisplay',
            'focusStatus', 'pauseBtn', 'focusBreakBtn', 'focusBreakStats',
            'endSessionBtn', 'energyCheck', 'sessionDuration', 'sessionGoal',
            'takeBreakBtn', 'newSessionBtn', 'copyLogBtn', 'viewLogBtn',
            'downloadLogBtn', 'breakOverlay', 'breakTip', 'breakTimer',
            'breakProgressRing', 'extendBreakBtn', 'endBreakBtn', 'logOverlay',
            'closeLogBtn', 'logContentArea', 'totalSessions', 'totalMinutes',
            'langToggle', 'themeToggle', 'energyGood', 'energyMid', 'energyLow',
            'start90Text', 'copyLogText', 'customRitualIcon', 'customRitualText'
        ];

        ids.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });

        this.elements.appContainer = document.querySelector('.app-container');
        this.elements.quickGoals = document.querySelectorAll('.quick-goal');
    }

    updateUIText(totalBreakSeconds) {
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
        
        const { ritualInput, focusBreakStats } = this.elements;
        if (ritualInput) ritualInput.placeholder = i18n.t('customRitualPlaceholder');

        if (focusBreakStats && !focusBreakStats.classList.contains('hidden')) {
            const totalMins = Math.floor(totalBreakSeconds / 60);
            const timeDisplay = totalMins > 0 ? `${totalMins}m` : `${totalBreakSeconds}s`;
            focusBreakStats.textContent = i18n.t('breakTime', { time: timeDisplay });
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

        const { pauseBtn, focusBreakBtn, endSessionBtn } = this.elements;
        if (pauseBtn) pauseBtn.innerHTML = getIcon('pause', 24);
        if (focusBreakBtn) focusBreakBtn.innerHTML = getIcon('coffee', 24);
        if (endSessionBtn) endSessionBtn.innerHTML = getIcon('stop', 24);
        
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
        if (!this.elements.ritualOptions) return;
        const rituals = i18n.getRituals();
        this.elements.ritualOptions.innerHTML = rituals.map((ritual, index) => `
            <div class="ritual-option" data-index="${index}">
                <span class="ritual-option-icon">${getRitualIcon(index)}</span>
                <span class="ritual-option-text">${ritual.text}</span>
            </div>
        `).join('');
        
        this.elements.ritualOptions.querySelectorAll('.ritual-option').forEach(option => {
            option.addEventListener('click', () => {
                this.app.selectRitual(Number.parseInt(option.dataset.index, 10));
            });
        });
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
        }
        document.body.classList.toggle('focus-mode', screenName === 'focus');
        
        if (this.elements.appContainer) {
            this.elements.appContainer.classList.toggle('wide', screenName === 'ritual');
        }

        if (!['ninety', 'focus'].includes(screenName) && !this.elements.breakOverlay.classList.contains('active')) {
            document.title = CONFIG.APP_NAME;
        }
    }

    updateStats(sessions, totalMinutes) {
        if (this.elements.totalSessions) this.elements.totalSessions.textContent = sessions;
        if (this.elements.totalMinutes) this.elements.totalMinutes.textContent = totalMinutes;
    }

    addSVGGradient() {
        const svg = document.querySelector('.progress-ring');
        if (!svg || svg.querySelector('#progressGradient')) return;

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color: hsl(260, 80%, 65%)" />
                <stop offset="100%" style="stop-color: hsl(180, 70%, 55%)" />
            </linearGradient>
        `;
        svg.insertBefore(defs, svg.firstChild);
        if (this.elements.progressRing) {
            this.elements.progressRing.setAttribute('stroke', 'url(#progressGradient)');
        }
    }
}
