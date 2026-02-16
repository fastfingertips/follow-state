import i18n from '../core/i18n.js';

export const Ritual = () => `
    <section class="screen ritual-screen" id="ritualScreen">
        <div class="ritual-layout">
            <div class="ritual-main">
                <div class="ritual-header">
                    <span class="ritual-step" id="ritualStep">${i18n.t('step1of2')}</span>
                    <h2 class="ritual-title" id="ritualTitle">${i18n.t('ritualTitle')}</h2>
                    <p class="ritual-desc" id="ritualDesc">${i18n.t('ritualDesc')}</p>
                </div>

                <div class="ritual-card" id="ritualCard">
                    <div class="ritual-icon flex-center" id="ritualIcon"></div>
                    <p class="ritual-text" id="ritualText"></p>
                    <div class="ritual-input-wrapper hidden" id="ritualInputWrapper">
                        <input type="text" class="ritual-input" id="ritualInput" maxlength="100" autocomplete="off">
                    </div>
                </div>

                <div class="ritual-actions">
                    <button class="btn btn-secondary btn-base" id="newRitualBtn">
                        <span class="btn-icon" id="newRitualIcon"></span>
                        <span class="btn-text" id="newRitualText">${i18n.t('anotherRitual')}</span>
                    </button>
                    <button class="btn btn-secondary btn-base" id="customRitualBtn">
                        <span class="btn-icon" id="customRitualIcon"></span>
                        <span class="btn-text" id="customRitualText">${i18n.t('customRitual')}</span>
                    </button>
                    <button class="btn btn-primary btn-base" id="ritualDoneBtn">
                        <span class="btn-icon" id="ritualDoneIcon"></span>
                        <span class="btn-text" id="ritualDoneText">${i18n.t('done')}</span>
                        <span class="btn-shortcut">Enter</span>
                    </button>
                </div>
            </div>

            <aside class="ritual-sidebar">
                <div class="sidebar-header">
                    <h4 id="allRitualsLabel">${i18n.t('allRituals')}</h4>
                </div>
                <div class="ritual-options" id="ritualOptions"></div>
            </aside>
        </div>
    </section>
`;
