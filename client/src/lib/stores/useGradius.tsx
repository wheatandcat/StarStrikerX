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
  moveBoss: (x: number, y: number) => void;
  
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
      
      // Create a type-safe array for new bullets
      const bulletsToAdd: {
        id: string;
        position: [number, number];
        direction: [number, number];
        isPlayerBullet: boolean;
      }[] = [];
      
      // Generate a unique ID for each bullet
      const createBulletId = () => `bullet_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      
      // Helper function to create a bullet with proper typing
      const createBullet = (
        posX: number, 
        posY: number, 
        dirX: number, 
        dirY: number
      ) => {
        return {
          id: createBulletId(),
          position: [posX, posY] as [number, number],
          direction: [dirX, dirY] as [number, number],
          isPlayerBullet: true
        };
      };
      
      // Create bullets based on weapon level
      switch (weaponLevel) {
        case WeaponLevel.Single:
          // Single straight bullet
          bulletsToAdd.push(createBullet(px + 1, py, 1, 0));
          break;
          
        case WeaponLevel.Double:
          // Two straight bullets
          bulletsToAdd.push(createBullet(px + 1, py - 0.3, 1, 0));
          bulletsToAdd.push(createBullet(px + 1, py + 0.3, 1, 0));
          break;
          
        case WeaponLevel.Triple:
          // Three-way shot
          bulletsToAdd.push(createBullet(px + 1, py, 1, 0));
          bulletsToAdd.push(createBullet(px + 0.8, py, 1, -0.2));
          bulletsToAdd.push(createBullet(px + 0.8, py, 1, 0.2));
          break;
          
        case WeaponLevel.Ultimate:
          // Three-way shot + backward shot
          bulletsToAdd.push(createBullet(px + 1, py, 1, 0));
          bulletsToAdd.push(createBullet(px + 0.8, py, 1, -0.2));
          bulletsToAdd.push(createBullet(px + 0.8, py, 1, 0.2));
          bulletsToAdd.push(createBullet(px - 0.5, py, -1, 0));
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
      
      // Ensure position is a tuple of exactly [number, number]
      const safePosition: [number, number] = 
        Array.isArray(position) && position.length === 2
          ? [position[0], position[1]]
          : [0, 0]; // Default position if invalid
      
      const newEnemy = {
        id: `enemy_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        type,
        position: safePosition,
        health,
        speed,
      };
      
      set({ enemies: [...enemies, newEnemy] });
    },
    
    removeEnemy: (id) => {
      // 安全に状態更新を行うため、参照渡しではなくコピーしたデータで処理
      const { enemies } = get();
      
      // コンソールで状態変化を追跡
      console.log(`Defeating enemy ${id} at position [${enemies.find(e => e.id === id)?.position}]`);
      
      // 安全な方法で配列をフィルタリング
      const updatedEnemies = enemies.filter(enemy => enemy.id !== id);
      
      // 状態を一度のステップで更新（バッチ処理）
      set({ enemies: updatedEnemies });
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
      const { bossHealth, bossActive, gamePhase } = get();
      
      // ボスがアクティブでない、または既に他のゲームフェーズに移行している場合は処理しない
      if (!bossActive || gamePhase !== "playing") return;
      
      // 新しい体力を計算
      const newHealth = Math.max(0, bossHealth - amount);
      
      // デバッグログ
      console.log(`Boss damaged: ${amount} damage, health: ${bossHealth} -> ${newHealth}`);
      
      if (newHealth <= 0) {
        // まずスコアを増加させる
        get().incrementScore(1000);
        console.log("Boss defeated! Clearing stage");
        
        // ボス撃破時の処理を安全に行う
        // レンダリングの問題を防ぐために少し遅延を入れる
        const stageClearTimer = window.setTimeout(() => {
          // 現在のゲームフェーズを再確認して安全に状態を更新
          if (get().gamePhase === "playing") {
            // ステートを一度にまとめて更新
            set({ 
              bossActive: false,
              bossHealth: 0
            });
            
            // ステージクリア処理を呼び出す
            get().stageClear();
          }
        }, 200); // 少し長めの遅延を設定
        
        // メモリリーク防止のためにクリーンアップ関数を返す
        return () => window.clearTimeout(stageClearTimer);
      } else {
        // 通常のダメージ処理
        set({ bossHealth: newHealth });
      }
    },
    
    moveBoss: (x, y) => {
      set({ bossPosition: [x, y] });
    },
    
    // Bullet actions
    removeBullet: (id) => {
      // より安全なバレット削除処理
      const { bullets } = get();
      
      // debugログを追加して追跡可能に
      const bullet = bullets.find(b => b.id === id);
      if (bullet) {
        console.log(`Removing bullet ${id} at position [${bullet.position}]`);
      }
      
      // 状態更新を一度のステップで行う
      set({ bullets: bullets.filter(bullet => bullet.id !== id) });
    },
    
    // PowerUp actions
    spawnPowerUp: (position) => {
      const { powerUps } = get();
      const powerUpTypes = [PowerUpType.WeaponUpgrade];
      const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      
      // Ensure position is a tuple of exactly [number, number]
      const safePosition: [number, number] = 
        Array.isArray(position) && position.length === 2
          ? [position[0], position[1]]
          : [0, 0]; // Default position if invalid
      
      // 既存のパワーアップが多すぎる場合は追加しない（パフォーマンス対策）
      if (powerUps.length >= 5) {
        console.log("Too many power-ups on screen, skipping spawn");
        return;
      }
      
      // ユニークIDを生成
      const powerUpId = `powerup_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      
      // 新しいパワーアップを作成
      const newPowerUp = {
        id: powerUpId,
        type: randomType,
        position: safePosition
      };
      
      // ログ出力
      console.log(`Spawning power-up at [${safePosition}]`);
      
      // 安全に状態を更新
      set({ powerUps: [...powerUps, newPowerUp] });
    },
    
    removePowerUp: (id) => {
      // パワーアップを安全に削除
      const { powerUps } = get();
      
      // デバッグログを追加
      const powerUp = powerUps.find(p => p.id === id);
      if (powerUp) {
        console.log(`Collecting power-up ${id} (${powerUp.type}) at position [${powerUp.position}]`);
      }
      
      // 状態更新を一度のステップで行う
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
