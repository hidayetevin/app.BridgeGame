/**
 * AudioManager.ts
 * Manages background music and sound effects for the Bridge Game.
 * Settings are persisted in localStorage.
 */

const STORAGE_KEY_MUSIC = 'bridge_music_muted';
const STORAGE_KEY_SFX = 'bridge_sfx_muted';

class AudioManagerClass {
    private static instance: AudioManagerClass;
    private bgMusic: HTMLAudioElement | null = null;
    private sounds: Map<string, HTMLAudioElement> = new Map();
    private _isMusicMuted: boolean = false;
    private _isSfxMuted: boolean = false;

    private constructor() {
        // Load saved preferences
        this._isMusicMuted = localStorage.getItem(STORAGE_KEY_MUSIC) === 'true';
        this._isSfxMuted = localStorage.getItem(STORAGE_KEY_SFX) === 'true';

        // Preload SFX
        this.loadSound('click', '/sounds/click.mp3');
        this.loadSound('place_node', '/sounds/click.mp3');
        this.loadSound('place_beam', '/sounds/wood_place.mp3');
        this.loadSound('break', '/sounds/break.mp3');
        this.loadSound('win', '/sounds/win.mp3');
        this.loadSound('loss', '/sounds/loss.mp3');
        this.loadSound('money', '/sounds/coin.mp3');
    }

    public static getInstance(): AudioManagerClass {
        if (!AudioManagerClass.instance) {
            AudioManagerClass.instance = new AudioManagerClass();
        }
        return AudioManagerClass.instance;
    }

    private loadSound(name: string, path: string) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        this.sounds.set(name, audio);
    }

    // ── Music ──────────────────────────────────────────────────

    public playMusic(path: string = '/sounds/bg_music.mp3') {
        if (this.bgMusic) this.bgMusic.pause();
        this.bgMusic = new Audio(path);
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.4;
        if (!this._isMusicMuted) {
            this.bgMusic.play().catch(e => console.log('Autoplay blocked:', e));
        }
    }

    public stopMusic() {
        if (this.bgMusic) {
            this.bgMusic.pause();
            this.bgMusic = null;
        }
    }

    public pauseMusic() {
        if (this.bgMusic && !this.bgMusic.paused) {
            this.bgMusic.pause();
        }
    }

    public resumeMusic() {
        if (this.bgMusic && this.bgMusic.paused && !this._isMusicMuted) {
            this.bgMusic.play().catch(() => { });
        }
    }

    // ── SFX ───────────────────────────────────────────────────

    public playSound(name: string) {
        if (this._isSfxMuted) return;
        const sound = this.sounds.get(name);
        if (sound) {
            const s = sound.cloneNode() as HTMLAudioElement;
            s.volume = 0.6;
            s.play().catch(e => console.log('Error playing sound:', e));
        }
    }

    // ── Mute Controls ─────────────────────────────────────────

    get isMusicMuted(): boolean { return this._isMusicMuted; }
    get isSfxMuted(): boolean { return this._isSfxMuted; }

    public setMusicMute(mute: boolean) {
        this._isMusicMuted = mute;
        localStorage.setItem(STORAGE_KEY_MUSIC, String(mute));
        if (mute) {
            this.pauseMusic();
        } else {
            this.resumeMusic();
        }
    }

    public setSfxMute(mute: boolean) {
        this._isSfxMuted = mute;
        localStorage.setItem(STORAGE_KEY_SFX, String(mute));
    }

    /** Legacy: Mutes everything at once (used for ad display) */
    public setMute(mute: boolean) {
        if (mute) this.pauseMusic();
        else this.resumeMusic();
    }
}

export default AudioManagerClass.getInstance();
