/**
 * AudioManager.ts
 * Manages background music and sound effects for the Bridge Game.
 */

class AudioManager {
    private static instance: AudioManager;
    private bgMusic: HTMLAudioElement | null = null;
    private sounds: Map<string, HTMLAudioElement> = new Map();
    private isMuted: boolean = false;

    private constructor() {
        // Initialize with placeholder paths
        // In a real scenario, these files should exist in public/sounds/
        this.loadSound('click', '/sounds/click.mp3');
        this.loadSound('place_node', '/sounds/click.mp3');
        this.loadSound('place_beam', '/sounds/wood_place.mp3');
        this.loadSound('break', '/sounds/break.mp3');
        this.loadSound('win', '/sounds/win.mp3');
        this.loadSound('loss', '/sounds/loss.mp3');
        this.loadSound('money', '/sounds/coin.mp3');
    }

    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    private loadSound(name: string, path: string) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        this.sounds.set(name, audio);
    }

    public playMusic(path: string = '/sounds/bg_music.mp3') {
        if (this.bgMusic) {
            this.bgMusic.pause();
        }
        this.bgMusic = new Audio(path);
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.4;
        if (!this.isMuted) {
            this.bgMusic.play().catch(e => console.log('Autoplay blocked:', e));
        }
    }

    public stopMusic() {
        if (this.bgMusic) {
            this.bgMusic.pause();
            this.bgMusic = null;
        }
    }

    public playSound(name: string) {
        if (this.isMuted) return;
        const sound = this.sounds.get(name);
        if (sound) {
            // Clone to allow overlapping plays of same sound
            const s = sound.cloneNode() as HTMLAudioElement;
            s.volume = 0.6;
            s.play().catch(e => console.log('Error playing sound:', e));
        }
    }

    public setMute(mute: boolean) {
        this.isMuted = mute;
        if (this.bgMusic) {
            if (mute) this.bgMusic.pause();
            else this.bgMusic.play();
        }
    }
}

export default AudioManager.getInstance();
