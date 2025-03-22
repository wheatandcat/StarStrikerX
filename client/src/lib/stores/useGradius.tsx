import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { PowerUpType, GamePhase, WeaponLevel } from "../types";

interface GradiusState {
  // Game state
  gamePhase: GamePhase;
  stageNumber: number;
  score: number;
  lives: number;
  weaponLevel: WeaponLevel;
  playerName: string;
  showLeaderboard: boolean;
  highScores: { name: string; score: number }[];
  
  // Player state
  playerPosition: [number, number];
  isPlayerInvulnerable: boolean;
  
  // Game objects
  bullets: {
    id: string;
    position: [number, number];
    direction: [number, number];
    isPlayerBullet: boolean;
  }[];
  enemies: {
    id: string;
    type: string;
    position: [number, number];
    health: number;
    speed: number;
  }[];
  powerUps: {
    id: string;
    type: PowerUpType;
    position: [number, number];
  }[];
  bossActive: boolean;
  bossHealth: number;
  bossPosition: [number, number];
  
  // Actions
  startGame: () => void;
  restartGame: () => void;
  continueToNextStage: () => void;
  gameOver: () => void;
  stageClear: () => void;
  
  // Player actions
  movePlayer: (x: number, y: number) => void;
  shootBullet: () => void;
  takeDamage: () => void;
  collectPowerUp: (type: PowerUpType) => void;
  incrementScore: (points: number) => void;
  
  // Enemy actions
  spawnEnemy: (type: string, position: [number, number], health: number, speed: number) => void;
  removeEnemy: (id: string) => void;
  spawnBoss: () => void;
  damageBoss: (amount: number) => void;
  
  // Bullet actions
  removeBullet: (id: string) => void;
  
  // PowerUp actions
  spawnPowerUp: (position: [number, number]) => void;
  removePowerUp: (id: string) => void;
  
  // UI actions
  setPlayerName: (name: string) => void;
  setShowLeaderboard: (show: boolean) => void;
  updateHighScores: (scores: { name: string; score: number }[]) => void;
}

export const useGradius = create<GradiusState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    gamePhase: "menu",
    stageNumber: 1,
    score: 0,
    lives: 3,
    weaponLevel: WeaponLevel.Single,
    playerName: "Player1",
    showLeaderboard: false,
    highScores: [],
    
    // Player state
    playerPosition: [-8, 0],
    isPlayerInvulnerable: false,
    
    // Game objects
    bullets: [],
    enemies: [],
    powerUps: [],
    bossActive: false,
    bossHealth: 100,
    bossPosition: [9, 0],
    
    // Actions
    startGame: () => {
      set({
        gamePhase: "playing",
        stageNumber: 1,
        score: 0,
        lives: 3,
        weaponLevel: WeaponLevel.Single,
        bullets: [],
        enemies: [],
        powerUps: [],
        bossActive: false,
        bossHealth: 100,
        playerPosition: [-8, 0]
      });
      
      console.log("Game started");
    },
    
    restartGame: () => {
      set({
        gamePhase: "playing",
        stageNumber: 1,
        score: 0,
        lives: 3,
        weaponLevel: WeaponLevel.Single,
        bullets: [],
        enemies: [],
        powerUps: [],
        bossActive: false,
        bossHealth: 100,
        playerPosition: [-8, 0]
      });
      
      console.log("Game restarted");
    },
    
    continueToNextStage: () => {
      const { stageNumber } = get();
      
      set({
        gamePhase: "playing",
        stageNumber: stageNumber + 1,
        bullets: [],
        enemies: [],
        powerUps: [],
        bossActive: false,
        bossHealth: 100 + (stageNumber * 50), // Boss gets harder each stage
        playerPosition: [-8, 0]
      });
      
      console.log(`Starting stage ${stageNumber + 1}`);
    },
    
    gameOver: () => {
      set({ gamePhase: "gameOver" });
      console.log("Game over");
    },
    
    stageClear: () => {
      set({ gamePhase: "stageClear" });
      console.log("Stage clear");
    },
    
    // Player actions
    movePlayer: (x, y) => {
      set({ playerPosition: [x, y] });
    },
    
    shootBullet: () => {
      const { playerPosition, bullets, weaponLevel } = get();
      const [px, py] = playerPosition;
      const bulletsToAdd = [];
      
      // Generate a unique ID for each bullet
      const createBulletId = () => `bullet_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      
      // Create bullets based on weapon level
      switch (weaponLevel) {
        case WeaponLevel.Single:
          // Single straight bullet
          bulletsToAdd.push({
            id: createBulletId(),
            position: [px + 1, py],
            direction: [1, 0],
            isPlayerBullet: true
          });
          break;
          
        case WeaponLevel.Double:
          // Two straight bullets
          bulletsToAdd.push({
            id: createBulletId(),
            position: [px + 1, py - 0.3],
            direction: [1, 0],
            isPlayerBullet: true
          });
          bulletsToAdd.push({
            id: createBulletId(),
            position: [px + 1, py + 0.3],
            direction: [1, 0],
            isPlayerBullet: true
          });
          break;
          
        case WeaponLevel.Triple:
          // Three-way shot
          bulletsToAdd.push({
            id: createBulletId(),
            position: [px + 1, py],
            direction: [1, 0],
            isPlayerBullet: true
          });
          bulletsToAdd.push({
            id: createBulletId(),
            position: [px + 0.8, py],
            direction: [1, -0.2],
            isPlayerBullet: true
          });
          bulletsToAdd.push({
            id: createBulletId(),
            position: [px + 0.8, py],
            direction: [1, 0.2],
            isPlayerBullet: true
          });
          break;
          
        case WeaponLevel.Ultimate:
          // Three-way shot + backward shot
          bulletsToAdd.push({
            id: createBulletId(),
            position: [px + 1, py],
            direction: [1, 0],
            isPlayerBullet: true
          });
          bulletsToAdd.push({
            id: createBulletId(),
            position: [px + 0.8, py],
            direction: [1, -0.2],
            isPlayerBullet: true
          });
          bulletsToAdd.push({
            id: createBulletId(),
            position: [px + 0.8, py],
            direction: [1, 0.2],
            isPlayerBullet: true
          });
          bulletsToAdd.push({
            id: createBulletId(),
            position: [px - 0.5, py],
            direction: [-1, 0],
            isPlayerBullet: true
          });
          break;
      }
      
      set({ bullets: [...bullets, ...bulletsToAdd] });
    },
    
    takeDamage: () => {
      const { lives, isPlayerInvulnerable } = get();
      
      if (isPlayerInvulnerable) return;
      
      if (lives <= 1) {
        set({ lives: 0 });
        get().gameOver();
      } else {
        // Set temporary invulnerability
        set({ 
          lives: lives - 1,
          isPlayerInvulnerable: true,
          weaponLevel: Math.max(get().weaponLevel - 1, WeaponLevel.Single) as WeaponLevel // Lose one weapon level
        });
        
        // Reset invulnerability after 2 seconds - using a safer approach
        const invulnerabilityTimer = window.setTimeout(() => {
          // Only reset if the game is still in the playing state
          if (get().gamePhase === "playing") {
            set({ isPlayerInvulnerable: false });
          }
        }, 2000);
        
        // Store the timeout ID for cleanup
        // This is important to prevent memory leaks
        return () => window.clearTimeout(invulnerabilityTimer);
      }
      
      console.log(`Player took damage. Lives remaining: ${lives - 1}`);
    },
    
    collectPowerUp: (type) => {
      if (type === PowerUpType.WeaponUpgrade) {
        const { weaponLevel } = get();
        // Maximum weapon level is Ultimate (3)
        const newLevel = Math.min(weaponLevel + 1, WeaponLevel.Ultimate) as WeaponLevel;
        set({ weaponLevel: newLevel });
        console.log(`Weapon upgraded to level ${newLevel}`);
      }
    },
    
    incrementScore: (points) => {
      const { score } = get();
      set({ score: score + points });
    },
    
    // Enemy actions
    spawnEnemy: (type, position, health, speed) => {
      const { enemies } = get();
      const newEnemy = {
        id: `enemy_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        type,
        position,
        health,
        speed,
      };
      
      set({ enemies: [...enemies, newEnemy] });
    },
    
    removeEnemy: (id) => {
      const { enemies } = get();
      set({ enemies: enemies.filter(enemy => enemy.id !== id) });
    },
    
    spawnBoss: () => {
      const { stageNumber } = get();
      set({ 
        bossActive: true,
        bossHealth: 100 + (stageNumber * 50),
        bossPosition: [9, 0]
      });
      console.log("Boss spawned");
    },
    
    damageBoss: (amount) => {
      const { bossHealth, bossActive } = get();
      if (!bossActive) return;
      
      const newHealth = bossHealth - amount;
      
      if (newHealth <= 0) {
        set({ 
          bossActive: false,
          bossHealth: 0
        });
        get().incrementScore(1000);
        get().stageClear();
      } else {
        set({ bossHealth: newHealth });
      }
    },
    
    // Bullet actions
    removeBullet: (id) => {
      const { bullets } = get();
      set({ bullets: bullets.filter(bullet => bullet.id !== id) });
    },
    
    // PowerUp actions
    spawnPowerUp: (position) => {
      const { powerUps } = get();
      const powerUpTypes = [PowerUpType.WeaponUpgrade];
      const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      
      const newPowerUp = {
        id: `powerup_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        type: randomType,
        position
      };
      
      set({ powerUps: [...powerUps, newPowerUp] });
    },
    
    removePowerUp: (id) => {
      const { powerUps } = get();
      set({ powerUps: powerUps.filter(powerUp => powerUp.id !== id) });
    },
    
    // UI actions
    setPlayerName: (name) => {
      set({ playerName: name });
    },
    
    setShowLeaderboard: (show) => {
      set({ showLeaderboard: show });
    },
    
    updateHighScores: (scores) => {
      set({ highScores: scores });
    }
  }))
);
