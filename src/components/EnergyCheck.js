import i18n from '../core/i18n.js';

export const EnergyCheck = () => `
    <div class="energy-check modal-overlay hidden" id="energyCheck">
        <div class="energy-card card-zen">
            <div class="energy-header flex-col-center">
                <span class="energy-icon flex-center" id="energyIcon"></span>
                <h3 id="energyTitle">${i18n.t('energyTitle')}</h3>
            </div>
            <p class="energy-question" id="energyQuestion">${i18n.t('energyQuestion')}</p>
            <div class="energy-options">
                <button class="energy-btn energy-good btn-base" id="energyGood">
                    <span id="energyGoodIcon"></span>
                    <span id="energyGoodText">${i18n.t('energyGood')}</span>
                </button>
                <button class="energy-btn energy-mid btn-base" id="energyMid">
                    <span id="energyMidIcon"></span>
                    <span id="energyMidText">${i18n.t('energyMid')}</span>
                </button>
                <button class="energy-btn energy-low btn-base" id="energyLow">
                    <span id="energyLowIcon"></span>
                    <span id="energyLowText">${i18n.t('energyLow')}</span>
                </button>
            </div>
        </div>
    </div>
`;
