import i18n from '../core/i18n.js';

export const NinetySeconds = () => `
    <section class="screen ninety-screen" id="ninetyScreen">
        <div class="ninety-content">
            <div class="ninety-header">
                <span class="ritual-step" id="ninetyStep">${i18n.t('step2of2')}</span>
                <h2 class="ninety-title" id="ninetyTitle">${i18n.t('ninetyTitle')}</h2>
                <p class="ninety-desc" id="ninetyDesc">${i18n.t('ninetyDesc')}</p>
            </div>

            <div class="ninety-timer-container">
                <div class="ninety-progress" id="ninetyProgress">
                    <svg class="progress-ring" viewBox="0 0 200 200">
                        <circle class="progress-ring-bg" cx="100" cy="100" r="90"/>
                        <circle class="progress-ring-fill" cx="100" cy="100" r="90" id="progressRing"/>
                    </svg>
                    <div class="ninety-time" id="ninetyTime">90</div>
                </div>
                <p class="ninety-motivation" id="ninetyMotivation">${i18n.t('ninetyMotivation')}</p>
            </div>

            <div class="ninety-actions">
                <button class="btn btn-glow" id="start90Btn">
                    <span class="btn-text" id="start90Text">${i18n.t('start90')}</span>
                    <span class="btn-icon" id="start90Icon"></span>
                    <span class="btn-shortcut">Enter</span>
                </button>
            </div>
        </div>
    </section>
`;
