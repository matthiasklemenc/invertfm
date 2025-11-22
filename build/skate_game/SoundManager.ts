
import * as Tone from 'tone';

class SoundManager {
    // Music Instruments
    kick: Tone.MembraneSynth;
    snare: Tone.NoiseSynth;
    hihat: Tone.MetalSynth;
    bass: Tone.MonoSynth;
    lead: Tone.PolySynth; // Added lead for melody
    
    // FX Instruments
    jumpSynth: Tone.Synth;
    doubleJumpSynth: Tone.PolySynth;
    trickSynth: Tone.PolySynth;
    grindSynth: Tone.MetalSynth;
    crashSynth: Tone.NoiseSynth;
    launchSynth: Tone.Synth;
    sirenSynth: Tone.Synth; 
    sirenLFO: Tone.LFO;     
    metalImpactSynth: Tone.MetalSynth; 
    firecrackerSynth: Tone.NoiseSynth; 
    
    loop: Tone.Sequence | null = null;
    bassLoop: Tone.Sequence | null = null;
    leadLoop: Tone.Sequence | null = null; // Added lead loop
    
    isMuted: boolean = false;
    currentMusicType: 'MAIN' | 'UNDERWORLD' | 'NONE' = 'NONE';

    constructor() {
        // --- Music Kit ---
        this.kick = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 6, 
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 },
            volume: -8
        }).toDestination();

        this.snare = new Tone.NoiseSynth({
            noise: { type: "pink" },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0 },
            volume: -12
        }).toDestination();

        this.hihat = new Tone.MetalSynth({
            frequency: 200,
            envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5,
            volume: -14
        }).toDestination();

        this.bass = new Tone.MonoSynth({
            oscillator: { type: "square" }, 
            envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.2 },
            filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.2, baseFrequency: 300, octaves: 2 },
            volume: -10
        }).toDestination();

        // Happy Lead Synth
        this.lead = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 },
            volume: -14
        }).toDestination();

        // --- FX Kit ---
        this.jumpSynth = new Tone.Synth({
            oscillator: { type: "square" },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
            volume: -10
        }).toDestination();

        this.doubleJumpSynth = new Tone.PolySynth(Tone.Synth, {
            volume: -10,
            envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }
        }).toDestination();

        this.trickSynth = new Tone.PolySynth(Tone.Synth, {
            volume: -10,
            oscillator: { type: "sawtooth" }
        }).toDestination();

        this.grindSynth = new Tone.MetalSynth({
            harmonicity: 12,
            resonance: 800,
            modulationIndex: 20,
            envelope: { decay: 0.1, release: 0.1 },
            volume: -15
        }).toDestination();

        this.crashSynth = new Tone.NoiseSynth({
            volume: -5
        }).toDestination();

        this.launchSynth = new Tone.Synth({
             oscillator: { type: "triangle" },
             envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.1 },
             volume: -8
        }).toDestination();

        this.sirenSynth = new Tone.Synth({
            oscillator: { type: "sawtooth" },
            envelope: { attack: 0.1, decay: 0, sustain: 1, release: 0.5 },
            volume: -10
        }).toDestination();
        
        this.sirenLFO = new Tone.LFO(2, 600, 900).start(); 
        this.sirenLFO.connect(this.sirenSynth.frequency);

        this.metalImpactSynth = new Tone.MetalSynth({
            frequency: 200,
            envelope: { attack: 0.001, decay: 0.2, release: 0.1 },
            harmonicity: 3.1,
            modulationIndex: 16,
            resonance: 2000,
            octaves: 1.5,
            volume: -5
        }).toDestination();

        this.firecrackerSynth = new Tone.NoiseSynth({
            noise: { type: "white" },
            envelope: { attack: 0.001, decay: 0.01, sustain: 0 },
            volume: -5
        }).toDestination();
    }

    async startMusic() {
        this.playMainMusic();
    }

    async playMainMusic() {
        if (this.currentMusicType === 'MAIN') {
            if (Tone.Transport.state !== "started") Tone.Transport.start();
            return;
        }
        this.stopCurrentMusic();
        this.currentMusicType = 'MAIN';
        
        try {
            await Tone.start();
            if (Tone.Transport.state !== "started") Tone.Transport.start();
            Tone.Transport.bpm.value = 165; // Upbeat skate punk tempo

            // 4-Chord Pop Punk Progression: I - V - vi - IV (C - G - Am - F)
            // Extended 16-bar loop for less repetition
            const bassNotes = [
                // C Major
                "C2", "C2", "C2", "C2", "C2", "C2", "C2", "C2", 
                "C2", "C2", "E2", "E2", "F2", "F2", "G2", "G2",
                // G Major
                "G1", "G1", "G1", "G1", "G1", "G1", "G1", "G1", 
                "G1", "G1", "B1", "B1", "C2", "C2", "D2", "D2",
                // A Minor
                "A1", "A1", "A1", "A1", "A1", "A1", "A1", "A1", 
                "A1", "A1", "C2", "C2", "D2", "D2", "E2", "E2",
                // F Major
                "F1", "F1", "F1", "F1", "F1", "F1", "F1", "F1", 
                "F1", "F1", "A1", "A1", "C2", "C2", "G2", "G2"
            ];
            
            this.bassLoop = new Tone.Sequence((time, note) => {
                if (this.isMuted || !note) return;
                this.bass.triggerAttackRelease(note, "8n", time);
            }, bassNotes, "8n").start(0);

            // Catchy Lead Melody (Call and Response style)
            const leadNotes = [
                // Bar 1-2 (C)
                "E4", null, "E4", "D4", "C4", null, "G3", null, 
                "C4", "D4", "E4", "F4", "E4", "D4", "C4", "G3",
                // Bar 3-4 (G)
                "D4", null, "D4", "C4", "B3", null, "G3", null,
                "B3", "C4", "D4", "E4", "D4", "C4", "B3", "A3",
                // Bar 5-6 (Am)
                "C4", null, "C4", "B3", "A3", null, "E3", null,
                "A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4",
                // Bar 7-8 (F)
                "F4", null, "A4", null, "C5", null, "A4", null,
                "G4", "F4", "E4", "D4", "C4", "B3", "C4", null
            ];

            this.leadLoop = new Tone.Sequence((time, note) => {
                if (this.isMuted || !note) return;
                this.lead.triggerAttackRelease(note, "8n", time);
            }, leadNotes, "8n").start(0);

            // Driving Drum Beat (Punk Rock)
            const drumPattern = [
                { k: true, s: false, h: true }, { k: false, s: false, h: true }, 
                { k: false, s: true, h: true }, { k: false, s: false, h: true },
                { k: false, s: false, h: true }, { k: true, s: false, h: true }, 
                { k: false, s: true, h: true }, { k: false, s: false, h: true },
                
                { k: true, s: false, h: true }, { k: true, s: false, h: true },
                { k: false, s: true, h: true }, { k: false, s: false, h: true },
                { k: false, s: false, h: true }, { k: false, s: false, h: true },
                { k: true, s: true, h: true }, { k: false, s: true, h: true } // Snare roll finish
            ];

            this.loop = new Tone.Sequence((time, step) => {
                if (this.isMuted) return;
                const s = drumPattern[step % drumPattern.length];
                if (s.k) this.kick.triggerAttackRelease("C1", "8n", time);
                if (s.s) this.snare.triggerAttackRelease("8n", time);
                if (s.h) this.hihat.triggerAttackRelease("32n", time, 0.3);
            }, Array.from({length: 16}, (_, i) => i), "8n").start(0);

        } catch (e) {
            console.error("Main music start failed", e);
        }
    }

    async playUnderworldMusic() {
        if (this.currentMusicType === 'UNDERWORLD') {
            if (Tone.Transport.state !== "started") Tone.Transport.start();
            return;
        }
        this.stopCurrentMusic();
        this.currentMusicType = 'UNDERWORLD';

        try {
            await Tone.start();
            if (Tone.Transport.state !== "started") Tone.Transport.start();
            Tone.Transport.bpm.value = 110; // Slower, menacing

            // Drone Bass
            const bassNotes = ["C1", null, null, null, "G1", null, "F1", null];
            this.bassLoop = new Tone.Sequence((time, note) => {
                if (this.isMuted || !note) return;
                this.bass.triggerAttackRelease(note, "1n", time, 0.9); 
            }, bassNotes, "2n").start(0);

            // Sparse Industrial Drums
            this.loop = new Tone.Sequence((time, col) => {
                if (this.isMuted) return;
                if (col === 0) this.kick.triggerAttackRelease("C1", "8n", time);
                if (col === 4) this.metalImpactSynth.triggerAttackRelease(100, "16n", time, 0.6);
                if (col === 8) this.kick.triggerAttackRelease("C1", "8n", time);
                if (col === 12) this.snare.triggerAttackRelease("8n", time, 0.5);
            }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], "16n").start(0);

        } catch (e) {
            console.error("Underworld music start failed", e);
        }
    }

    stopCurrentMusic() {
        if (this.loop) {
            this.loop.dispose();
            this.loop = null;
        }
        if (this.bassLoop) {
            this.bassLoop.dispose();
            this.bassLoop = null;
        }
        if (this.leadLoop) {
            this.leadLoop.dispose();
            this.leadLoop = null;
        }
    }

    pauseMusic() {
        if (this.currentMusicType !== 'NONE') {
             Tone.Transport.pause();
        }
    }

    resumeMusic() {
        if (this.currentMusicType !== 'NONE') {
             Tone.Transport.start();
        }
    }

    stopMusic() {
        this.currentMusicType = 'NONE';
        try {
            Tone.Transport.stop();
            Tone.Transport.cancel(0); 
            this.stopCurrentMusic();
        } catch (e) {
            console.error("Audio stop failed", e);
        }
    }

    private getSafeTime() {
        return Tone.now() + 0.05;
    }

    playJump() {
        if (this.isMuted) return;
        try { this.jumpSynth.triggerAttackRelease("A4", "16n", this.getSafeTime()); } catch(e){}
    }

    playDoubleJump() {
        if (this.isMuted) return;
        try { this.doubleJumpSynth.triggerAttackRelease(["E4", "G4"], "16n", this.getSafeTime()); } catch(e){}
    }

    playTrick() {
        if (this.isMuted) return;
        try { this.trickSynth.triggerAttackRelease(["C5", "E5"], "16n", this.getSafeTime()); } catch(e){}
    }

    playGrind() {
        if (this.isMuted) return;
        try { 
            this.grindSynth.triggerAttackRelease(200, "32n", this.getSafeTime()); 
        } catch(e){}
    }

    playLaunch() {
        if (this.isMuted) return;
        try {
            const now = this.getSafeTime();
            this.launchSynth.triggerAttackRelease("C5", "8n", now);
            this.launchSynth.frequency.rampTo("C6", 0.3, now);
        } catch(e){}
    }

    playCrash() {
        if (this.isMuted) return;
        try { this.crashSynth.triggerAttackRelease("8n", this.getSafeTime()); } catch(e){}
    }

    playMetalHit() {
        if (this.isMuted) return;
        try { this.metalImpactSynth.triggerAttackRelease(300, "16n", this.getSafeTime()); } catch(e){}
    }

    playSiren() {
        if (this.isMuted) return;
        try {
             this.sirenSynth.triggerAttackRelease("C4", 1.5, this.getSafeTime()); 
        } catch(e){}
    }

    playFirecracker() {
        if (this.isMuted) return;
        try {
             const now = this.getSafeTime();
             this.firecrackerSynth.triggerAttackRelease("32n", now);
             this.firecrackerSynth.triggerAttackRelease("32n", now + 0.05);
             this.firecrackerSynth.triggerAttackRelease("32n", now + 0.1);
        } catch(e){}
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        Tone.Destination.mute = this.isMuted;
    }
}

let instance: SoundManager | null = null;

export const getSoundManager = () => {
    if (!instance) {
        try {
             instance = new SoundManager();
        } catch (e) {
            console.error("Tone.js init failed", e);
            return {
                startMusic: async () => {},
                playMainMusic: async () => {},
                playUnderworldMusic: async () => {},
                pauseMusic: () => {},
                resumeMusic: () => {},
                stopMusic: () => {},
                playJump: () => {},
                playDoubleJump: () => {},
                playTrick: () => {},
                playGrind: () => {},
                playLaunch: () => {},
                playCrash: () => {},
                playSiren: () => {},
                playMetalHit: () => {},
                playFirecracker: () => {},
                toggleMute: () => {},
                isMuted: true
            } as any as SoundManager;
        }
    }
    return instance;
};
