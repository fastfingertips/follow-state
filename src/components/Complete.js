import i18n from '../core/i18n.js';

export const Complete = () => `
    <section class="screen complete-screen" id="completeScreen">
        <div class="complete-container">
            <div class="complete-header">
                <div class="celebration-badge">
                    <div class="badge-glow"></div>
                    <span class="complete-icon" id="completeIcon"></span>
                </div>
                <h1 class="complete-title" id="completeTitle">${i18n.t('completeTitle')}</h1>
                <p class="complete-subtitle" id="completeSubtitle">${i18n.t('completeSubtitle')}</p>
            </div>

            <div class="complete-card glass">
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-icon-wrapper" id="durationIcon"></div>
                        <div class="stat-content">
                            <span class="stat-value"><span id="sessionDuration">0</span> <small id="minutesLabel2">${i18n.t('minutes')}</small></span>
                        </div>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <div class="stat-icon-wrapper" id="goalIcon"></div>
                        <div class="stat-content">
                            <span class="stat-value" id="sessionGoal">-</span>
                            <span class="stat-label" id="goalLabel">${i18n.t('goal')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="complete-actions">
                <button class="btn btn-secondary" id="takeBreakBtn">
                    <span class="btn-icon" id="takeBreakIcon"></span>
                    <span class="btn-text" id="takeBreakText">${i18n.t('takeBreak')}</span>
                </button>
                <button class="btn btn-primary" id="newSessionBtn">
                    <span class="btn-icon" id="newSessionIcon"></span>
                    <span class="btn-text" id="newSessionText">${i18n.t('newSession')}</span>
                    <span class="btn-shortcut">Enter</span>
                </button>
            </div>
        </div>
    </section>
`;
