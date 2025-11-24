/* ============================================================================
   SOUND MANAGER — INVERT FM SKATE GAME
   Lightweight, mobile-safe audio loader and one-shot SFX player.
   ============================================================================ */

const soundCache = new Map<string, HTMLAudioElement>();

export class SoundManager {
    muted = false;

    constructor() {}

    /* -----------------------------------------------
       Load & cache audio
    ------------------------------------------------ */
    async load(src: string): Promise<HTMLAudioElement> {
        if (soundCache.has(src)) return soundCache.get(src)!;

        const audio = new Audio(src);

        await new Promise((resolve) => {
            audio.onloadeddata = resolve;
        });

        soundCache.set(src, audio);
        return audio;
    }

    /* -----------------------------------------------
       Play a sound once (coin, landing, crash…)
    ------------------------------------------------ */
    async playOneShot(src: string, volume: number = 1.0) {
        if (this.muted) return;

        const base = await this.load(src);
        const clone = base.cloneNode(true) as HTMLAudioElement;
        clone.volume = volume;
        clone.play().catch(() => {});
    }

    /* -----------------------------------------------
       Looping background music (optional)
    ------------------------------------------------ */
    async playLoop(src: string, volume: number = 0.6) {
        if (this.muted) return;

        const audio = await this.load(src);
        audio.loop = true;
        audio.volume = volume;

        audio.play().catch(() => {});
    }

    /* -----------------------------------------------
       Stop all sounds
    ------------------------------------------------ */
    stopAll() {
        for (const a of soundCache.values()) {
            try {
                a.pause();
                a.currentTime = 0;
            } catch {}
        }
    }

    /* -----------------------------------------------
       Toggle mute
    ------------------------------------------------ */
    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) this.stopAll();
    }
}
