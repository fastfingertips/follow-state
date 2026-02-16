import i18n from '../core/i18n.js';

export const LogModal = () => `
    <div class="log-overlay modal-overlay hidden" id="logOverlay">
        <div class="log-card card-zen">
            <div class="log-header">
                <span class="log-title">${i18n.t('logHeader')}</span>
                <button class="btn-icon-only btn-base" id="closeLogBtn">
                    <span id="closeLogIcon"></span>
                </button>
            </div>
            <div class="log-content-area" id="logContentArea"></div>
        </div>
    </div>
`;
