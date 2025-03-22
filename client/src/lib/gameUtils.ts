import { Vector3 } from "three";
import { EnemyType, PowerUpType } from "./types";
import { ENEMY_PROPERTIES, ENEMY_POWERUP_DROP_CHANCE, GAME_WIDTH, GAME_HEIGHT } from "./constants";

// Normalize a direction vector
export function normalizeDirection(direction: [number, number]): [number, number] {
  const magnitude = Math.sqrt(direction[0] * direction[0] + direction[1] * direction[1]);
  if (magnitude === 0) return [0, 0];
  return [direction[0] / magnitude, direction[1] / magnitude];
}

// Determine if an enemy should drop a power-up
export function shouldDropPowerUp(): boolean {
  return Math.random() < ENEMY_POWERUP_DROP_CHANCE;
}

// Generate a random position for enemy spawning
export function getRandomSpawnPosition(): [number, number] {
  const x = GAME_WIDTH / 2 + Math.random() * 2;
  const y = (Math.random() * GAME_HEIGHT) - (GAME_HEIGHT / 2);
  return [x, y];
}

// Generate a random enemy type (excluding boss)
export function getRandomEnemyType(): EnemyType {
  const types = [EnemyType.Small, EnemyType.Medium, EnemyType.Large];
  const weights = [0.6, 0.3, 0.1]; // Probability weights
  
  const random = Math.random();
  let cumulativeWeight = 0;
  
  for (let i = 0; i < types.length; i++) {
    cumulativeWeight += weights[i];
    if (random < cumulativeWeight) {
      return types[i];
    }
  }
  
  return EnemyType.Small; // Default fallback
}

// Get enemy properties based on enemy type
export function getEnemyProperties(type: EnemyType) {
  return ENEMY_PROPERTIES[type];
}

// Calculate a score's position in the high scores list
export function getScorePosition(score: number, highScores: { name: string; score: number }[]): number {
  if (highScores.length === 0) return 0;
  
  let position = highScores.length;
  for (let i = 0; i < highScores.length; i++) {
    if (score > highScores[i].score) {
      position = i;
      break;
    }
  }
  
  return position;
}

// Format a score number with commas
export function formatScore(score: number): string {
  return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Generate a unique ID
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

// Lerp (Linear interpolation) between two values
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Lerp between two Vector3s
export function lerpVector3(a: Vector3, b: Vector3, t: number): Vector3 {
  return new Vector3(
    lerp(a.x, b.x, t),
    lerp(a.y, b.y, t),
    lerp(a.z, b.z, t)
  );
}

// Clamp a value between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Get a sine wave value for oscillating movement
export function sineWave(time: number, amplitude: number, frequency: number): number {
  return amplitude * Math.sin(time * frequency);
}

// Smooth step function
export function smoothStep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3 - 2 * t);
}
