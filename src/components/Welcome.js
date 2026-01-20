import i18n from '../core/i18n.js';

export const Welcome = () => `
    <section class="screen welcome-screen" id="welcomeScreen">
        <div class="welcome-content">
            <h1 class="welcome-title">
                <span class="title-line" id="welcomeTitle1">${i18n.t('welcomeTitle1')}</span>
                <span class="title-line gradient-text" id="welcomeTitle2">${i18n.t('welcomeTitle2')}</span>
            </h1>
            <p class="welcome-subtitle" id="welcomeSubtitle">${i18n.t('welcomeSubtitle')}</p>
            
            <div class="goal-input-container">
                <div class="input-wrapper">
                    <input type="text" id="goalInput" class="goal-input" placeholder="${i18n.t('goalPlaceholder')}" maxlength="100" autocomplete="off">
                    <span class="input-glow"></span>
                </div>
                <button class="btn btn-primary" id="startBtn" disabled>
                    <span class="btn-text" id="startBtnText">${i18n.t('startButton')}</span>
                    <span class="btn-icon" id="startBtnIcon"></span>
                </button>
            </div>

            <div class="quick-goals">
                <span class="quick-label" id="quickLabel">${i18n.t('quickSelect')}</span>
                <button class="quick-goal" data-goal="quickCode">
                    <span class="quick-icon"></span>
                    <span class="quick-text">${i18n.t('quickCode')}</span>
                </button>
                <button class="quick-goal" data-goal="quickDesign">
                    <span class="quick-icon"></span>
                    <span class="quick-text">${i18n.t('quickDesign')}</span>
                </button>
                <button class="quick-goal" data-goal="quickWriting">
                    <span class="quick-icon"></span>
                    <span class="quick-text">${i18n.t('quickWriting')}</span>
                </button>
                <button class="quick-goal" data-goal="quickLearning">
                    <span class="quick-icon"></span>
                    <span class="quick-text">${i18n.t('quickLearning')}</span>
                </button>
            </div>
        </div>
    </section>
`;
