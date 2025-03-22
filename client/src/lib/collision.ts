import { CollisionObject } from "./types";
import { PLAYER_COLLISION_RADIUS, BULLET_COLLISION_RADIUS, POWERUP_COLLISION_RADIUS } from "./constants";

// Check collision between two circular objects
export function checkCollision(obj1: CollisionObject, obj2: CollisionObject): boolean {
  const dx = obj1.position[0] - obj2.position[0];
  const dy = obj1.position[1] - obj2.position[1];
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  return distance < (obj1.radius + obj2.radius);
}

// Check if player collides with enemy
export function checkPlayerEnemyCollision(
  playerPosition: [number, number],
  enemyPosition: [number, number],
  enemyRadius: number
): boolean {
  return checkCollision(
    { position: playerPosition, radius: PLAYER_COLLISION_RADIUS },
    { position: enemyPosition, radius: enemyRadius }
  );
}

// Check if player bullet collides with enemy
export function checkBulletEnemyCollision(
  bulletPosition: [number, number],
  enemyPosition: [number, number],
  enemyRadius: number
): boolean {
  return checkCollision(
    { position: bulletPosition, radius: BULLET_COLLISION_RADIUS },
    { position: enemyPosition, radius: enemyRadius }
  );
}

// Check if enemy bullet collides with player
export function checkEnemyBulletPlayerCollision(
  bulletPosition: [number, number],
  playerPosition: [number, number]
): boolean {
  return checkCollision(
    { position: bulletPosition, radius: BULLET_COLLISION_RADIUS },
    { position: playerPosition, radius: PLAYER_COLLISION_RADIUS }
  );
}

// Check if player collides with power-up
export function checkPlayerPowerUpCollision(
  playerPosition: [number, number],
  powerUpPosition: [number, number]
): boolean {
  return checkCollision(
    { position: playerPosition, radius: PLAYER_COLLISION_RADIUS },
    { position: powerUpPosition, radius: POWERUP_COLLISION_RADIUS }
  );
}

// Check if object is out of bounds
export function isOutOfBounds(position: [number, number], buffer: number = 2): boolean {
  const [x, y] = position;
  return x < -12 - buffer || x > 12 + buffer || y < -6 - buffer || y > 6 + buffer;
}
