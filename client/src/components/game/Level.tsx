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
    
    // Update bullets
    bullets.forEach(bullet => {
      const [bx, by] = bullet.position;
      const [dx, dy] = bullet.direction;
      const speed = bullet.isPlayerBullet ? 0.3 : 0.15;
      
      const newX = bx + dx * speed;
      const newY = by + dy * speed;
      
      // Remove out-of-bounds bullets
      if (isOutOfBounds([newX, newY])) {
        removeBullet(bullet.id);
        return;
      }
      
      // Update bullet position using a safer approach
      // Creating a new tuple to ensure type safety
      const newPosition: [number, number] = [newX, newY];
      bullet.position = newPosition;
      
      // Check bullet collisions
      if (bullet.isPlayerBullet) {
        // Player bullets hit enemies
        enemies.forEach(enemy => {
          const enemyProps = getEnemyProperties(enemy.type as EnemyType);
          if (checkBulletEnemyCollision(
            [newX, newY],
            enemy.position,
            enemyProps.collisionRadius
          )) {
            removeBullet(bullet.id);
            
            // Damage enemy or remove if health depleted
            enemy.health -= 1;
            
            if (enemy.health <= 0) {
              removeEnemy(enemy.id);
              incrementScore(enemyProps.scoreValue);
              playHit();
              
              // Chance to spawn power-up
              if (shouldDropPowerUp()) {
                spawnPowerUp(enemy.position);
              }
              
              // Track defeated enemies for boss spawn
              defeatedEnemiesRef.current += 1;
            }
          }
        });
        
        // Player bullets hit boss
        if (bossActive) {
          const bossProps = getEnemyProperties(EnemyType.Boss);
          if (checkBulletEnemyCollision(
            [newX, newY],
            useGradius.getState().bossPosition,
            bossProps.collisionRadius
          )) {
            removeBullet(bullet.id);
            damageBoss(1);
            playHit();
          }
        }
      } else {
        // Enemy bullets hit player
        if (!isPlayerInvulnerable && checkEnemyBulletPlayerCollision([newX, newY], playerPosition)) {
          removeBullet(bullet.id);
          takeDamage();
          playHit();
        }
      }
    });
    
    // Update enemies
    enemies.forEach(enemy => {
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
      
      // Remove enemies that move off-screen
      if (newX < -12) {
        removeEnemy(enemy.id);
        return;
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
          takeDamage();
          removeEnemy(enemy.id);
          playHit();
        }
      }
    });
    
    // Update power-ups
    powerUps.forEach(powerUp => {
      const [px, py] = powerUp.position;
      
      // PowerUps drift to the left
      const newX = px - 0.05;
      
      // Remove power-ups that move off-screen
      if (newX < -12) {
        removePowerUp(powerUp.id);
        return;
      }
      
      // Update power-up position using a safer approach
      // Creating a new tuple to ensure type safety
      const newPowerUpPosition: [number, number] = [newX, py];
      powerUp.position = newPowerUpPosition;
      
      // Check player collision with power-up
      if (checkPlayerPowerUpCollision(playerPosition, [newX, py])) {
        collectPowerUp(powerUp.type);
        removePowerUp(powerUp.id);
        playSuccess();
      }
    });
    
    // Check if boss should spawn based on score or enemy count
    if (!bossActive && 
        (useGradius.getState().score >= BOSS_SPAWN_SCORE || 
         defeatedEnemiesRef.current >= ENEMIES_TO_SPAWN_BOSS)) {
      // Clear existing enemies before boss
      enemies.forEach(enemy => removeEnemy(enemy.id));
      spawnBoss();
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
