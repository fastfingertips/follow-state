/**
 * Flow State - Timer Controller
 * Handles different types of countdown and stopwatch timers
 */

export class Timer {
    constructor(options = {}) {
        this.duration = options.duration || 0;
        this.onTick = options.onTick || (() => {});
        this.onComplete = options.onComplete || (() => {});
        this.isCountdown = options.isCountdown !== undefined ? options.isCountdown : true;
        
        this.remainingSeconds = this.duration;
        this.elapsedSeconds = 0;
        this.interval = null;
        this.startTime = null;
        this.isPaused = false;
        this.pauseStartTime = null;
    }

    start() {
        if (this.interval) return;
        
        this.startTime = Date.now() - (this.elapsedSeconds * 1000);
        this.isPaused = false;
        
        this.tick();
        this.interval = setInterval(() => this.tick(), 1000);
    }

    tick() {
        if (this.isPaused) return;

        if (this.isCountdown) {
            if (this.remainingSeconds <= 0) {
                this.stop();
                this.onComplete();
                return;
            }
            this.onTick(this.remainingSeconds);
            this.remainingSeconds--;
        } else {
            this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
            this.onTick(this.elapsedSeconds);
        }
    }

    pause() {
        this.isPaused = true;
        this.pauseStartTime = Date.now();
    }

    resume() {
        if (!this.isPaused) return;
        const pausedDuration = Date.now() - this.pauseStartTime;
        this.startTime += pausedDuration;
        this.isPaused = false;
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    reset(newDuration) {
        this.stop();
        if (newDuration !== undefined) this.duration = newDuration;
        this.remainingSeconds = this.duration;
        this.elapsedSeconds = 0;
        this.isPaused = false;
    }

    extend(seconds) {
        this.remainingSeconds += seconds;
        this.duration += seconds; // Update total duration for progress calculation
    }

    getFormattedTime(totalSeconds) {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
}
