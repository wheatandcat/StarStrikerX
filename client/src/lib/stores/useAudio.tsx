import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  bossMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  weaponUpgradeSound: HTMLAudioElement | null;
  shieldSound: HTMLAudioElement | null;
  playerShootSound: HTMLAudioElement | null;
  enemyDestroySound: HTMLAudioElement | null;
  isMuted: boolean;
  currentMusic: "normal" | "boss" | null;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setBossMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  setWeaponUpgradeSound: (sound: HTMLAudioElement) => void;
  setShieldSound: (sound: HTMLAudioElement) => void;
  setPlayerShootSound: (sound: HTMLAudioElement) => void;
  setEnemyDestroySound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  playWeaponUpgrade: () => void;
  playShield: () => void;
  playPlayerShoot: () => void;
  playEnemyDestroy: () => void;
  pauseAllSounds: () => void;
  resumeBackgroundMusic: () => void;
  switchToBossMusic: () => void;
  switchToNormalMusic: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  bossMusic: null,
  hitSound: null,
  successSound: null,
  weaponUpgradeSound: null,
  shieldSound: null,
  playerShootSound: null,
  enemyDestroySound: null,
  isMuted: true, // Start muted by default
  currentMusic: null,
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setBossMusic: (music) => set({ bossMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  setWeaponUpgradeSound: (sound) => set({ weaponUpgradeSound: sound }),
  setShieldSound: (sound) => set({ shieldSound: sound }),
  setPlayerShootSound: (sound) => set({ playerShootSound: sound }),
  setEnemyDestroySound: (sound) => set({ enemyDestroySound: sound }),
  
  toggleMute: () => {
    const { isMuted } = get();
    const newMutedState = !isMuted;
    
    // Just update the muted state
    set({ isMuted: newMutedState });
    
    // Log the change
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Hit sound skipped (muted)");
        return;
      }
      
      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(error => {
        console.log("Hit sound play prevented:", error);
      });
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Success sound skipped (muted)");
        return;
      }
      
      successSound.currentTime = 0;
      successSound.play().catch(error => {
        console.log("Success sound play prevented:", error);
      });
    }
  },
  
  playWeaponUpgrade: () => {
    const { weaponUpgradeSound, isMuted } = get();
    if (weaponUpgradeSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Weapon upgrade sound skipped (muted)");
        return;
      }
      
      weaponUpgradeSound.currentTime = 0;
      weaponUpgradeSound.volume = 0.5;
      weaponUpgradeSound.play().catch(error => {
        console.log("Weapon upgrade sound play prevented:", error);
      });
    }
  },
  
  playShield: () => {
    const { shieldSound, isMuted } = get();
    if (shieldSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Shield sound skipped (muted)");
        return;
      }
      
      shieldSound.currentTime = 0;
      shieldSound.volume = 0.4;
      shieldSound.play().catch(error => {
        console.log("Shield sound play prevented:", error);
      });
    }
  },
  
  playPlayerShoot: () => {
    const { playerShootSound, isMuted } = get();
    if (playerShootSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Player shoot sound skipped (muted)");
        return;
      }
      
      // Clone the sound to allow overlapping playback (multiple shots at once)
      const soundClone = playerShootSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.2;
      soundClone.play().catch(error => {
        console.log("Player shoot sound play prevented:", error);
      });
    }
  },
  
  playEnemyDestroy: () => {
    const { enemyDestroySound, isMuted } = get();
    if (enemyDestroySound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Enemy destroy sound skipped (muted)");
        return;
      }
      
      // Clone the sound to allow overlapping playback (multiple enemies at once)
      const soundClone = enemyDestroySound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.4;
      soundClone.play().catch(error => {
        console.log("Enemy destroy sound play prevented:", error);
      });
    }
  },
  
  pauseAllSounds: () => {
    const { 
      backgroundMusic, 
      bossMusic, 
      hitSound, 
      successSound, 
      weaponUpgradeSound,
      shieldSound,
      playerShootSound,
      enemyDestroySound,
      currentMusic 
    } = get();
    
    // ポーズ中はすべての音を停止
    if (currentMusic === "normal" && backgroundMusic && !backgroundMusic.paused) {
      backgroundMusic.pause();
      console.log("Background music paused");
    } else if (currentMusic === "boss" && bossMusic && !bossMusic.paused) {
      bossMusic.pause();
      console.log("Boss music paused");
    }
    
    // 他の効果音も一時停止（実行中のものがあれば）
    if (hitSound) {
      hitSound.pause();
    }
    
    if (successSound) {
      successSound.pause();
    }
    
    if (weaponUpgradeSound) {
      weaponUpgradeSound.pause();
    }
    
    if (shieldSound) {
      shieldSound.pause();
    }
    
    if (playerShootSound) {
      playerShootSound.pause();
    }
    
    if (enemyDestroySound) {
      enemyDestroySound.pause();
    }
  },
  
  resumeBackgroundMusic: () => {
    const { backgroundMusic, bossMusic, isMuted, currentMusic } = get();
    
    // ミュート設定でなければBGMを再開
    if (!isMuted) {
      if (currentMusic === "normal" && backgroundMusic) {
        backgroundMusic.play().catch(error => {
          console.log("Background music resume prevented:", error);
        });
        console.log("Background music resumed");
      } else if (currentMusic === "boss" && bossMusic) {
        bossMusic.play().catch(error => {
          console.log("Boss music resume prevented:", error);
        });
        console.log("Boss music resumed");
      }
    }
  },
  
  switchToBossMusic: () => {
    const { backgroundMusic, bossMusic, isMuted } = get();
    
    // 現在のBGMを停止
    if (backgroundMusic && !backgroundMusic.paused) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    }
    
    // ボスBGMを再生
    if (bossMusic && !isMuted) {
      bossMusic.currentTime = 0;
      bossMusic.loop = true;
      bossMusic.play().catch(error => {
        console.log("Boss music play prevented:", error);
      });
      console.log("Switched to boss music");
    }
    
    // 現在の音楽タイプを設定
    set({ currentMusic: "boss" });
  },
  
  switchToNormalMusic: () => {
    const { backgroundMusic, bossMusic, isMuted } = get();
    
    // ボスBGMを停止
    if (bossMusic && !bossMusic.paused) {
      bossMusic.pause();
      bossMusic.currentTime = 0;
    }
    
    // 通常BGMを再生
    if (backgroundMusic && !isMuted) {
      backgroundMusic.currentTime = 0;
      backgroundMusic.loop = true;
      backgroundMusic.play().catch(error => {
        console.log("Background music play prevented:", error);
      });
      console.log("Switched to normal music");
    }
    
    // 現在の音楽タイプを設定
    set({ currentMusic: "normal" });
  }
}));
