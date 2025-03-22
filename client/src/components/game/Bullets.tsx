import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGradius } from "@/lib/stores/useGradius";
import { BULLET_SIZE } from "@/lib/constants";

// Create bullet mesh based on whether it's a player or enemy bullet - レトロスタイル
const Bullet = ({ bullet }: { bullet: any }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Different styles for player and enemy bullets
  const isPlayerBullet = bullet.isPlayerBullet;
  const bulletColor = isPlayerBullet ? "#00FFFF" : "#FF4400";
  const bulletSize = BULLET_SIZE * (isPlayerBullet ? 1 : 1.2);
  
  // Update bullet position
  useFrame(() => {
    if (!meshRef.current) return;
    
    // Update position from bullet state
    meshRef.current.position.x = bullet.position[0];
    meshRef.current.position.y = bullet.position[1];
    
    // Rotation effect for enemy bullets
    if (!isPlayerBullet) {
      meshRef.current.rotation.z += 0.2;
    }
  });
  
  // 弾の回転角度を計算（弾の方向に合わせる）
  const direction = bullet.direction;
  const bulletRotation = Math.atan2(direction[1], direction[0]);
  
  return (
    <group>
      {/* プレイヤーの弾 - シンプルな矩形 */}
      {isPlayerBullet ? (
        <mesh 
          ref={meshRef} 
          position={[bullet.position[0], bullet.position[1], 0]}
          rotation={[0, 0, bulletRotation]}
        >
          <planeGeometry args={[bulletSize * 0.8, bulletSize * 0.4]} />
          <meshBasicMaterial color={bulletColor} />
        </mesh>
      ) : (
        /* 敵の弾 - 小さな円形 */
        <mesh 
          ref={meshRef} 
          position={[bullet.position[0], bullet.position[1], 0]}
        >
          <circleGeometry args={[bulletSize * 0.3, 8]} />
          <meshBasicMaterial color={bulletColor} />
        </mesh>
      )}
    </group>
  );
};

const Bullets = () => {
  const { bullets } = useGradius();
  
  return (
    <group>
      {bullets.map((bullet) => (
        <Bullet key={bullet.id} bullet={bullet} />
      ))}
    </group>
  );
};

export default Bullets;
