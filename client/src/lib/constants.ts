import { EnemyType } from "./types";

// Game area dimensions
export const GAME_WIDTH = 20;
export const GAME_HEIGHT = 10;

// Player constants
export const PLAYER_SPEED = 0.2;
export const PLAYER_SIZE = 0.8;
export const PLAYER_BULLET_SPEED = 0.4;
export const PLAYER_SHOOT_COOLDOWN = 200; // ms
export const PLAYER_COLLISION_RADIUS = 0.4;

// Enemy constants
export const ENEMY_SPAWN_RATE = 1000; // ms
export const ENEMY_BULLET_SPEED = 0.2;
export const ENEMY_SHOOT_RATE = 2000; // ms
export const ENEMY_MOVEMENT_SPEED = 0.05;
export const ENEMY_POWERUP_DROP_CHANCE = 0.2; // 20% chance

export const ENEMY_PROPERTIES = {
  [EnemyType.Small]: {
    health: 1,
    size: 0.6,
    speed: 0.08,
    scoreValue: 100,
    collisionRadius: 0.3
  },
  [EnemyType.Medium]: {
    health: 2,
    size: 0.8,
    speed: 0.05,
    scoreValue: 200,
    collisionRadius: 0.4
  },
  [EnemyType.Large]: {
    health: 4,
    size: 1.2,
    speed: 0.03,
    scoreValue: 400,
    collisionRadius: 0.6
  },
  [EnemyType.Boss]: {
    health: 100,
    size: 2.5,
    speed: 0.02,
    scoreValue: 1000,
    collisionRadius: 1.2
  }
};

// Bullet constants
export const BULLET_SIZE = 0.3;
export const BULLET_COLLISION_RADIUS = 0.15;

// PowerUp constants
export const POWERUP_SIZE = 0.6;
export const POWERUP_SPEED = 0.05;
export const POWERUP_COLLISION_RADIUS = 0.3;

// Boss constants
export const BOSS_ENTRY_POSITION = [12, 0];
export const BOSS_BATTLE_POSITION = [8, 0];
export const BOSS_MOVEMENT_RANGE = 3;
export const BOSS_MOVEMENT_SPEED = 0.02;
export const BOSS_SHOOT_RATE = 1000; // ms
export const BOSS_PHASE_THRESHOLD = 0.5; // Boss changes pattern at 50% health

// Game progress constants
export const BOSS_SPAWN_SCORE = 5000; // Score needed to spawn boss
export const ENEMIES_TO_SPAWN_BOSS = 30; // Or number of enemies to defeat

// Background constants
export const BACKGROUND_SCROLL_SPEED = 0.01;
export const STAR_COUNT = 100;

// Game settings
export const MAX_HIGH_SCORES = 10;
