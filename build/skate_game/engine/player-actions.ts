// player-actions.ts
// Trick system: rotations, flips, manuals, Natas spins, scoring (all delta-based)

export interface TrickState {
  isManual: boolean;
  manualTimer: number;
  natas: boolean;
  natasRotation: number;
  natasSpeed: number;
  flipRotation: number;
  flipActive: boolean;
  scoreBuffer: number;
}

export interface PlayerActionsConfig {
  manualDifficulty: number;    // score per second while manualing
  natasRotationSpeed: number;  // radians per second
  flipSpeed: number;           // radians per second
  flipReward: number;          // points for completing a flip
}

export class PlayerActions {
  constructor(private config: PlayerActionsConfig) {}

  startManual(state: TrickState) {
    if (!state.isManual) {
      state.isManual = true;
      state.manualTimer = 0;
    }
  }

  stopManual(state: TrickState) {
    state.isManual = false;
    const reward = Math.floor(state.manualTimer * this.config.manualDifficulty);
    state.scoreBuffer += reward;
    state.manualTimer = 0;
    return reward;
  }

  startNatasSpin(state: TrickState) {
    if (!state.natas) {
      state.natas = true;
      state.natasSpeed = this.config.natasRotationSpeed;
    }
  }

  stopNatasSpin(state: TrickState) {
    state.natas = false;
    const fullRotations = Math.floor(state.natasRotation / (Math.PI * 2));
    const reward = fullRotations * 500;
    state.scoreBuffer += reward;
    state.natasRotation = 0;
    state.natasSpeed = 0;
    return reward;
  }

  startKickflip(state: TrickState) {
    if (!state.flipActive) {
      state.flipActive = true;
      state.flipRotation = 0;
    }
  }

  update(state: TrickState, delta: number) {
    // Manual scoring
    if (state.isManual) {
      state.manualTimer += delta;
    }

    // Natas spin rotation
    if (state.natas) {
      state.natasRotation += state.natasSpeed * delta;
    }

    // Flip rotation
    if (state.flipActive) {
      state.flipRotation += this.config.flipSpeed * delta;

      // Flip completed?
      if (state.flipRotation >= Math.PI * 2) {
        state.flipActive = false;
        state.scoreBuffer += this.config.flipReward;
        state.flipRotation = 0;
      }
    }
  }

  getBufferedScore(state: TrickState) {
    const reward = state.scoreBuffer;
    state.scoreBuffer = 0;
    return reward;
  }
}
