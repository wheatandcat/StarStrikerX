// Game control keys
export enum Controls {
  up = "up",
  down = "down",
  left = "left",
  right = "right",
  shoot = "shoot",
  pause = "pause"
}

// Game phases
export type GamePhase = "menu" | "playing" | "paused" | "gameOver" | "stageClear";

// Power-up types
export enum PowerUpType {
  WeaponUpgrade = "weapon_upgrade"
}

// Weapon upgrade levels
export enum WeaponLevel {
  Single = 0,   // Single straight shot
  Double = 1,   // Double straight shot
  Triple = 2,   // 3-way shot
  Ultimate = 3  // 3-way + back shot
}

// Enemy types
export enum EnemyType {
  Small = "small",
  Medium = "medium",
  Large = "large",
  Boss = "boss"
}

// Boss attack patterns
export enum BossAttackPattern {
  Straight = "straight",
  Spread = "spread",
  Aimed = "aimed",
  Circular = "circular"
}

// High score entry
export interface HighScore {
  id: number;
  name: string;
  score: number;
  date: string;
}

// Collision types for detection
export type CollisionObject = {
  position: [number, number];
  radius: number;
};
