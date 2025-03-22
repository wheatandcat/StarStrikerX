import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useMemo } from "react";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useGradius } from "@/lib/stores/useGradius";
import { useAudio } from "@/lib/stores/useAudio";
import { Controls, EnemyType } from "@/lib/types";
import Player from "./Player";
import Enemies from "./Enemies";
import Bullets from "./Bullets";
import PowerUps from "./PowerUps";
import Background from "./Background";
import Boss from "./Boss";
import GameUI from "./GameUI";
import ParticleEffects from "./ParticleEffects";
import { 
  PLAYER_SPEED, 
  PLAYER_SHOOT_COOLDOWN, 
  ENEMY_SPAWN_RATE,
  GAME_WIDTH,
  GAME_HEIGHT,
  BOSS_SPAWN_SCORE,
  ENEMIES_TO_SPAWN_BOSS
} from "@/lib/constants";
import { 
  checkPlayerEnemyCollision,
  checkBulletEnemyCollision,
  checkEnemyBulletPlayerCollision,
  checkPlayerPowerUpCollision,
  isOutOfBounds
} from "@/lib/collision";
import {
  getRandomSpawnPosition,
  getRandomEnemyType,
  getEnemyProperties,
  shouldDropPowerUp
} from "@/lib/gameUtils";

interface LevelProps {
  viewport: {
    fov: number;
    aspectRatio: number;
  };
}

const Level: React.FC<LevelProps> = ({ viewport: canvasViewport }) => {
  // Game state from store
  const { 
    playerPosition, 
    movePlayer,
    shootBullet,
    takeDamage,
    incrementScore,
    collectPowerUp,
    bullets,
    enemies,
    powerUps,
    removeBullet,
    removeEnemy,
    removePowerUp,
    spawnEnemy,
    spawnPowerUp,
    gamePhase,
    bossActive,
    spawnBoss,
    damageBoss,
    isPlayerInvulnerable,
  } = useGradius();
  
  // Sound effects
  const { playHit, playSuccess } = useAudio();
  
  // References for timers and game loop
  const lastShootTimeRef = useRef<number>(0);
  const lastEnemySpawnRef = useRef<number>(0);
  const defeatedEnemiesRef = useRef<number>(0);
  
  // Get keyboard controls
  const [subscribeKeys, getKeys] = useKeyboardControls<Controls>();
  
  // Get screen dimensions from three.js
  const { viewport: threeViewport } = useThree();
  
  // ポーズキー用のエフェクト - 複数のキーの同時押下を防ぐためのフラグ
  const pauseKeyRef = useRef({
    isPressed: false, 
    lastPressTime: 0,
    pauseToggleInProgress: false
  });
  
  // ポーズトグル関数を作成 - useGradius.getState()をここで呼び出して最新の状態を取得
  const togglePauseWrapper = () => {
    const now = Date.now();
    
    // 連続したトグル操作を防ぐためのチェック
    if (pauseKeyRef.current.pauseToggleInProgress || 
        now - pauseKeyRef.current.lastPressTime < 300) {
      console.log("Pause toggle skipped - too frequent or already in progress");
      return;
    }
    
    // ポーズトグル処理を開始
    console.log("Pause key triggered - toggling pause state");
    pauseKeyRef.current.pauseToggleInProgress = true;
    
    try {
      // 現在のゲーム状態を取得
      const currentState = useGradius.getState();
      const currentPhase = currentState.gamePhase;
      console.log(`Current game phase before toggle: ${currentPhase}`);
      
      // togglePause関数を呼び出し
      currentState.togglePause();
      
      // タイムスタンプを更新
      pauseKeyRef.current.lastPressTime = now;
      
      // 状態変更を確認するために少し遅延
      setTimeout(() => {
        const newPhase = useGradius.getState().gamePhase;
        console.log(`Game phase after toggle: ${newPhase}`);
        pauseKeyRef.current.pauseToggleInProgress = false;
      }, 100);
    } catch (error) {
      console.error("Error during pause toggle:", error);
      pauseKeyRef.current.pauseToggleInProgress = false;
    }
  };
  
  useEffect(() => {
    // ポーズキーのサブスクリプション
    const unsubscribePause = subscribeKeys(
      (state) => state.pause,
      (pressed) => {
        // キーが押されたとき
        if (pressed && !pauseKeyRef.current.isPressed) {
          pauseKeyRef.current.isPressed = true;
          togglePauseWrapper();
        } else if (!pressed) {
          // キーが離されたとき
          pauseKeyRef.current.isPressed = false;
        }
      }
    );
    
    // ESCキーのイベントリスナーを追加 (バックアップとして)
    const handleEscKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        togglePauseWrapper();
      }
    };
    
    window.addEventListener('keydown', handleEscKeyPress);
    
    // クリーンアップ
    return () => {
      unsubscribePause();
      window.removeEventListener('keydown', handleEscKeyPress);
    };
  }, [subscribeKeys]);
  
  // Create a ref to track boss active state to avoid stale closures
  const isBossActiveRef = useRef(bossActive);
  
  // Update the ref when bossActive changes
  useEffect(() => {
    isBossActiveRef.current = bossActive;
  }, [bossActive]);
  
  // Create and manage enemy spawning interval
  useEffect(() => {
    // Only spawn enemies when the game is actively playing
    if (gamePhase !== "playing") return;
    
    // Set up enemy spawning timer with proper cleanup
    const spawnEnemyInterval = setInterval(() => {
      // Check the current game state and boss state via store to avoid stale values
      const currentState = useGradius.getState();
      
      // Only spawn if we're playing and boss is not active
      if (currentState.gamePhase !== "playing" || isBossActiveRef.current) {
        return;
      }
      
      const enemyType = getRandomEnemyType();
      const spawnPosition = getRandomSpawnPosition();
      const properties = getEnemyProperties(enemyType);
      
      spawnEnemy(
        enemyType,
        spawnPosition,
        properties.health,
        properties.speed
      );
    }, ENEMY_SPAWN_RATE);
    
    // Proper cleanup of interval when component unmounts or dependencies change
    return () => {
      clearInterval(spawnEnemyInterval);
    };
  }, [gamePhase, spawnEnemy]); // Removed bossActive from dependencies to avoid recreating interval
  
  // Main game loop
  useFrame((state, delta) => {
    if (gamePhase !== "playing") return;
    
    // Handle player input
    const keys = getKeys();
    const currentTime = state.clock.getElapsedTime() * 1000;
    
    // Movement
    let [x, y] = playerPosition;
    if (keys.up) y += PLAYER_SPEED;
    if (keys.down) y -= PLAYER_SPEED;
    if (keys.left) x -= PLAYER_SPEED;
    if (keys.right) x += PLAYER_SPEED;
    
    // Get game bounds based on viewport and aspect ratio
    const gameRatio = canvasViewport.aspectRatio;
    
    // Calculate game bounds dynamically based on aspect ratio
    // The base game area is designed for a 2:1 aspect ratio (GAME_WIDTH = 20, GAME_HEIGHT = 10)
    let horizontalLimit = 9; // Default for aspect ratio = 2
    let verticalLimit = 4.5; // Default
    
    // Adjust horizontal boundary for wider/narrower screens
    if (gameRatio > 2) {
      // Wider screens - player can't move all the way to the edge
      horizontalLimit = horizontalLimit * (2 / gameRatio);
    } else if (gameRatio < 1) {
      // Very tall/narrow screens
      horizontalLimit = 8; // Restrict horizontal movement more
      verticalLimit = 6;   // Allow more vertical movement
    }
    
    console.log(`Game bounds: horizontal=${horizontalLimit.toFixed(1)}, vertical=${verticalLimit.toFixed(1)}, ratio=${gameRatio.toFixed(2)}`);
    
    // Clamp player position within game bounds
    x = Math.max(-horizontalLimit, Math.min(horizontalLimit, x));
    y = Math.max(-verticalLimit, Math.min(verticalLimit, y));
    
    // Only update position if it changed
    if (x !== playerPosition[0] || y !== playerPosition[1]) {
      movePlayer(x, y);
    }
    
    // Shooting
    if (keys.shoot && currentTime - lastShootTimeRef.current > PLAYER_SHOOT_COOLDOWN) {
      shootBullet();
      lastShootTimeRef.current = currentTime;
    }
    
    // Copy the bullets array to avoid modification issues during iteration
    const bulletsCopy = [...bullets];
    const bulletsToRemove: string[] = [];
    const enemiesWithDamage: { id: string, newHealth: number }[] = [];
    
    // Update bullets
    for (let i = 0; i < bulletsCopy.length; i++) {
      const bullet = bulletsCopy[i];
      const [bx, by] = bullet.position;
      const [dx, dy] = bullet.direction;
      const speed = bullet.isPlayerBullet ? 0.3 : 0.15;
      
      const newX = bx + dx * speed;
      const newY = by + dy * speed;
      
      // Flag out-of-bounds bullets for removal
      if (isOutOfBounds([newX, newY])) {
        bulletsToRemove.push(bullet.id);
        continue;
      }
      
      // Update bullet position using a safer approach
      // Creating a new tuple to ensure type safety
      const newPosition: [number, number] = [newX, newY];
      bullet.position = newPosition;
      
      // Check bullet collisions
      if (bullet.isPlayerBullet) {
        // Player bullets hit enemies
        let bulletHit = false;
        
        for (let j = 0; j < enemies.length; j++) {
          const enemy = enemies[j];
          const enemyProps = getEnemyProperties(enemy.type as EnemyType);
          
          if (checkBulletEnemyCollision(
            [newX, newY],
            enemy.position,
            enemyProps.collisionRadius
          )) {
            // Flag bullet for removal
            bulletsToRemove.push(bullet.id);
            bulletHit = true;
            
            // Calculate new health and update
            const newHealth = enemy.health - 1;
            
            if (newHealth <= 0) {
              try {
                // Store the position before removing the enemy
                const enemyPosition: [number, number] = [...enemy.position];
                const enemyId = enemy.id;
                
                console.log(`Defeating enemy ${enemyId} at position [${enemyPosition[0]}, ${enemyPosition[1]}]`);
                
                // Track defeated enemies for boss spawn before removing the enemy
                defeatedEnemiesRef.current += 1;
                
                // Flag enemy for removal, increment score
                removeEnemy(enemyId);
                incrementScore(enemyProps.scoreValue);
                playHit();
                
                // Use the stored position for power-up spawning
                if (shouldDropPowerUp()) {
                  console.log(`Spawning power-up at [${enemyPosition[0]}, ${enemyPosition[1]}]`);
                  // Use a delay to ensure the enemy is fully removed first
                  setTimeout(() => {
                    if (useGradius.getState().gamePhase === "playing") {
                      spawnPowerUp(enemyPosition);
                    }
                  }, 50);
                }
              } catch (error) {
                console.error("Error in enemy defeat logic:", error);
              }
            } else {
              // Store health update for later
              enemiesWithDamage.push({ id: enemy.id, newHealth });
            }
            
            // Break since this bullet hit something
            break;
          }
        }
        
        // If bullet already hit something, skip the boss check
        if (bulletHit) continue;
        
        // Player bullets hit boss
        if (bossActive) {
          const bossProps = getEnemyProperties(EnemyType.Boss);
          if (checkBulletEnemyCollision(
            [newX, newY],
            useGradius.getState().bossPosition,
            bossProps.collisionRadius
          )) {
            bulletsToRemove.push(bullet.id);
            damageBoss(1);
            playHit();
          }
        }
      } else {
        // Enemy bullets hit player
        if (!isPlayerInvulnerable && checkEnemyBulletPlayerCollision([newX, newY], playerPosition)) {
          bulletsToRemove.push(bullet.id);
          takeDamage();
          playHit();
        }
      }
    }
    
    // Apply all bullet removals in one batch at the end
    if (bulletsToRemove.length > 0) {
      for (const bulletId of bulletsToRemove) {
        removeBullet(bulletId);
      }
    }
    
    // Apply enemy health updates
    for (const { id, newHealth } of enemiesWithDamage) {
      // Find the enemy in the current state
      const enemy = enemies.find(e => e.id === id);
      if (enemy) {
        enemy.health = newHealth;
      }
    }
    
    // Update enemies - use a copy to avoid modification issues during iteration
    const enemiesCopy = [...enemies];
    const enemiesToRemove: string[] = [];
    
    for (let i = 0; i < enemiesCopy.length; i++) {
      const enemy = enemiesCopy[i];
      const [ex, ey] = enemy.position;
      
      // Basic movement: move towards the left side
      const newX = ex - enemy.speed;
      let newY = ey;
      
      // Add some variation to enemy movement based on type
      if (enemy.type === EnemyType.Medium) {
        // Medium enemies move in a sine wave pattern
        newY = ey + Math.sin(state.clock.getElapsedTime() * 2) * 0.01;
      } else if (enemy.type === EnemyType.Large) {
        // Large enemies track the player's Y position slightly
        const playerY = playerPosition[1];
        newY = ey + (playerY - ey) * 0.005;
      }
      
      // Flag enemies that move off-screen for removal
      if (newX < -12) {
        enemiesToRemove.push(enemy.id);
        continue;
      }
      
      // Update enemy position using a safer approach
      // Creating a new tuple to ensure type safety
      const newEnemyPosition: [number, number] = [newX, newY];
      enemy.position = newEnemyPosition;
      
      // Check player collision with enemy
      if (!isPlayerInvulnerable) {
        const enemyProps = getEnemyProperties(enemy.type as EnemyType);
        if (checkPlayerEnemyCollision(
          playerPosition,
          [newX, newY],
          enemyProps.collisionRadius
        )) {
          // Take damage first
          takeDamage();
          
          // Flag enemy for removal
          enemiesToRemove.push(enemy.id);
          playHit();
          
          // Continue to the next enemy
          continue;
        }
      }
    }
    
    // Apply all enemy removals in one batch at the end
    if (enemiesToRemove.length > 0) {
      for (const enemyId of enemiesToRemove) {
        try {
          removeEnemy(enemyId);
        } catch (error) {
          console.error(`Failed to remove enemy ${enemyId}:`, error);
        }
      }
    }
    
    // Update power-ups - use a copy to avoid modification issues
    const powerUpsCopy = [...powerUps];
    const powerUpsToRemove: string[] = [];
    
    for (let i = 0; i < powerUpsCopy.length; i++) {
      const powerUp = powerUpsCopy[i];
      const [px, py] = powerUp.position;
      
      // PowerUps drift to the left
      const newX = px - 0.05;
      
      // Flag power-ups that move off-screen for removal
      if (newX < -12) {
        powerUpsToRemove.push(powerUp.id);
        continue;
      }
      
      // Update power-up position using a safer approach
      // Creating a new tuple to ensure type safety
      const newPowerUpPosition: [number, number] = [newX, py];
      powerUp.position = newPowerUpPosition;
      
      // Check player collision with power-up
      if (checkPlayerPowerUpCollision(playerPosition, [newX, py])) {
        // Collect power-up and flag for removal
        collectPowerUp(powerUp.type);
        powerUpsToRemove.push(powerUp.id);
        playSuccess();
      }
    }
    
    // Apply all power-up removals in one batch
    if (powerUpsToRemove.length > 0) {
      for (const powerUpId of powerUpsToRemove) {
        try {
          removePowerUp(powerUpId);
        } catch (error) {
          console.error(`Failed to remove power-up ${powerUpId}:`, error);
        }
      }
    }
    
    // Check if boss should spawn based on score or enemy count
    if (gamePhase === "playing" && !bossActive && 
        (useGradius.getState().score >= BOSS_SPAWN_SCORE || 
         defeatedEnemiesRef.current >= ENEMIES_TO_SPAWN_BOSS)) {
      
      console.log("Preparing to spawn boss!");
      
      // Clear existing enemies before boss in a separate closure
      setTimeout(() => {
        if (useGradius.getState().gamePhase === "playing") {
          // Get the current enemies from the state
          const currentEnemies = useGradius.getState().enemies;
          
          // For safety, process in small batches with delays
          const processBatch = (start: number, batchSize: number) => {
            const end = Math.min(start + batchSize, currentEnemies.length);
            
            for (let i = start; i < end; i++) {
              try {
                removeEnemy(currentEnemies[i].id);
              } catch (error) {
                console.error(`Failed to remove enemy before boss (batch ${start}-${end}):`, error);
              }
            }
            
            // Process next batch if needed
            if (end < currentEnemies.length) {
              setTimeout(() => processBatch(end, batchSize), 10);
            } else {
              // All enemies removed, spawn boss
              console.log("All enemies cleared, spawning boss");
              setTimeout(() => {
                if (useGradius.getState().gamePhase === "playing") {
                  spawnBoss();
                }
              }, 100);
            }
          };
          
          // Start processing in batches of 3
          processBatch(0, 3);
        }
      }, 50);
    }
  });
  
  return (
    <>
      <Background />
      <Player />
      <Bullets />
      <Enemies />
      <PowerUps />
      {bossActive && <Boss />}
      <ParticleEffects />
      <GameUI />
    </>
  );
};

export default Level;
