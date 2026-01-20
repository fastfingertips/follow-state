import i18n from '../core/i18n.js';

export const Break = () => `
    <div class="break-overlay hidden" id="breakOverlay">
        <div class="break-card">
            <div class="break-header">
                <div class="break-badge">
                    <span class="break-icon" id="breakIcon"></span>
                    <span id="breakTitle">${i18n.t('breakTitle')}</span>
                </div>
            </div>
            
            <div class="break-timer-wrapper">
                <svg class="break-progress-svg" viewBox="0 0 100 100">
                    <circle class="break-progress-bg" cx="50" cy="50" r="45"/>
                    <circle class="break-progress-fill" cx="50" cy="50" r="45" id="breakProgressRing"/>
                </svg>
                <div class="break-timer" id="breakTimer">5:00</div>
            </div>

            <div class="break-info">
                <p class="break-tip" id="breakTip"></p>
            </div>

            <div class="break-actions">
                <button class="btn btn-premium-secondary" id="extendBreakBtn">
                    <span class="btn-icon" id="extendBreakIcon"></span>
                    <span class="btn-text" id="extendBreakText">${i18n.t('extendBreak')}</span>
                </button>
                <button class="btn btn-premium-secondary" id="endBreakBtn">
                    <span class="btn-text" id="endBreakText">${i18n.t('endBreak')}</span>
                    <span class="btn-shortcut">ESC</span>
                </button>
            </div>
        </div>
    </div>
`;
