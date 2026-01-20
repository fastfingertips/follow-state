import i18n from '../core/i18n.js';

export const EnergyCheck = () => `
    <div class="energy-check hidden" id="energyCheck">
        <div class="energy-card">
            <div class="energy-header">
                <span class="energy-icon" id="energyIcon"></span>
                <h3 id="energyTitle">${i18n.t('energyTitle')}</h3>
            </div>
            <p class="energy-question" id="energyQuestion">${i18n.t('energyQuestion')}</p>
            <div class="energy-options">
                <button class="energy-btn energy-good" id="energyGood">
                    <span id="energyGoodIcon"></span>
                    <span id="energyGoodText">${i18n.t('energyGood')}</span>
                </button>
                <button class="energy-btn energy-mid" id="energyMid">
                    <span id="energyMidIcon"></span>
                    <span id="energyMidText">${i18n.t('energyMid')}</span>
                </button>
                <button class="energy-btn energy-low" id="energyLow">
                    <span id="energyLowIcon"></span>
                    <span id="energyLowText">${i18n.t('energyLow')}</span>
                </button>
            </div>
        </div>
    </div>
`;
