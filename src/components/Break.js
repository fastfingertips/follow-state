import i18n from '../core/i18n.js';

export const Break = () => `
    <div class="break-overlay hidden" id="breakOverlay">
        <div class="break-content">
            <span class="break-icon" id="breakIcon"></span>
            <h3 id="breakTitle">${i18n.t('breakTitle')}</h3>
            <p class="break-tip" id="breakTip"></p>
            <div class="break-timer" id="breakTimer">5:00</div>
            <button class="btn btn-secondary" id="endBreakBtn">
                <span class="btn-text" id="endBreakText">${i18n.t('endBreak')}</span>
            </button>
        </div>
    </div>
`;
