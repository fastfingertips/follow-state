import i18n from '../core/i18n.js';

export const Focus = () => `
    <section class="screen focus-screen" id="focusScreen">
        <div class="focus-content">
            <div class="focus-goal" id="focusGoal">
                <span class="focus-label" id="focusLabel">${i18n.t('focusLabel')}</span>
                <h2 class="focus-text" id="currentGoalText"></h2>
            </div>

            <div class="focus-timer-container">
                <div class="focus-time" id="focusTimerDisplay">
                    <span class="time-value" id="focusMinutes">00</span>
                    <span class="time-separator">:</span>
                    <span class="time-value" id="focusSeconds">00</span>
                </div>
                <p class="focus-status" id="focusStatus">${i18n.t('inFlow')}</p>
                <p class="focus-break-stats hidden" id="focusBreakStats"></p>
            </div>

            <div class="focus-controls">
                <button class="btn btn-icon-only" id="pauseBtn" title="Pause"></button>
                <button class="btn btn-icon-only" id="focusBreakBtn" title="Take a Break"></button>
                <button class="btn btn-icon-only btn-danger" id="endSessionBtn" title="End"></button>
            </div>
        </div>
    </section>
`;
