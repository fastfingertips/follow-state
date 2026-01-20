import i18n from '../core/i18n.js';

export const LogModal = () => `
    <div class="log-overlay hidden" id="logOverlay">
        <div class="log-card">
            <div class="log-header">
                <span class="log-title">${i18n.t('logHeader')}</span>
                <button class="btn-icon-only" id="closeLogBtn">
                    <span id="closeLogIcon"></span>
                </button>
            </div>
            <div class="log-content-area" id="logContentArea"></div>
        </div>
    </div>
`;
