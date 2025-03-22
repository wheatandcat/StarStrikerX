import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGradius } from "@/lib/stores/useGradius";
import { BULLET_SIZE } from "@/lib/constants";

// Create bullet mesh based on whether it's a player or enemy bullet - レトロスタイル
const Bullet = ({ bullet }: { bullet: any }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Different styles for player and enemy bullets
  const isPlayerBullet = bullet.isPlayerBullet;
  const bulletColor = isPlayerBullet ? "#00FFFF" : "#FF4400";
  const bulletSize = BULLET_SIZE * (isPlayerBullet ? 1 : 1.2);
  
  // Update bullet position
  useFrame(() => {
    if (!groupRef.current) return;
    
    // Update position from bullet state
    groupRef.current.position.x = bullet.position[0];
    groupRef.current.position.y = bullet.position[1];
    
    // Rotation effect for enemy bullets
    if (!isPlayerBullet) {
      groupRef.current.rotation.z += 0.2;
    }
  });
  
  // 弾の回転角度を計算（弾の方向に合わせる）
  const direction = bullet.direction;
  const bulletRotation = Math.atan2(direction[1], direction[0]);
  
  return (
    <group>
      {/* グラディウス/R-Type風の弾 - 幾何学的で精密な形状 */}
      {isPlayerBullet ? (
        // プレイヤーの弾 - グラディウス風ツインレーザー
        <group 
          ref={groupRef}
          position={[bullet.position[0], bullet.position[1], 0]}
          rotation={[0, 0, bulletRotation]}
        >
          {/* メインレーザービーム - 楕円形状 */}
          <mesh>
            <capsuleGeometry args={[bulletSize * 0.12, bulletSize * 0.7, 4, 8]} />
            <meshBasicMaterial color="#00FFFF" />
          </mesh>
          
          {/* 内側の高エネルギー部分 */}
          <mesh position={[0, 0, 0.01]}>
            <capsuleGeometry args={[bulletSize * 0.08, bulletSize * 0.6, 4, 8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          
          {/* 前方チップ - 六角形 */}
          <mesh position={[bulletSize * 0.35, 0, 0.01]}>
            <circleGeometry args={[bulletSize * 0.15, 6]} />
            <meshBasicMaterial 
              color="#00FFFF" 
              transparent={true}
              opacity={0.9}
            />
          </mesh>
          
          {/* 後方の発光エフェクト */}
          <mesh position={[-bulletSize * 0.35, 0, 0]}>
            <circleGeometry args={[bulletSize * 0.1, 8]} />
            <meshBasicMaterial 
              color="#80DEEA" 
              transparent={true}
              opacity={0.7}
            />
          </mesh>
        </group>
      ) : (
        // 敵の弾 - ダライアス/R-Type風のエネルギー弾
        <group
          ref={groupRef}
          position={[bullet.position[0], bullet.position[1], 0]}
        >
          {/* 弾の本体 - 六角形 */}
          <mesh rotation={[0, 0, Date.now() * 0.005]}>
            <circleGeometry args={[bulletSize * 0.25, 6]} />
            <meshBasicMaterial color="#F44336" />
          </mesh>
          
          {/* 中央のエネルギーコア */}
          <mesh position={[0, 0, 0.01]} rotation={[0, 0, -Date.now() * 0.003]}>
            <circleGeometry args={[bulletSize * 0.15, 6]} />
            <meshBasicMaterial 
              color="#FFEB3B" 
              transparent={true}
              opacity={Math.abs(Math.sin(Date.now() * 0.01)) * 0.3 + 0.7}
            />
          </mesh>
          
          {/* 発光リング */}
          <mesh position={[0, 0, 0.005]}>
            <ringGeometry args={[bulletSize * 0.25, bulletSize * 0.3, 6]} />
            <meshBasicMaterial 
              color="#FF5722" 
              transparent={true}
              opacity={0.6}
            />
          </mesh>
          
          {/* R-Type風の軌跡エフェクト */}
          {[0, 1, 2].map((i) => (
            <mesh 
              key={i}
              position={[-bulletSize * 0.1 * (i + 1), 0, -0.01 * i]}
              scale={[1 - i * 0.2, 1 - i * 0.2, 1]}
            >
              <circleGeometry args={[bulletSize * 0.15, 6]} />
              <meshBasicMaterial 
                color="#FF9800" 
                transparent={true}
                opacity={0.4 - i * 0.1}
              />
            </mesh>
          ))}
        </group>
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
