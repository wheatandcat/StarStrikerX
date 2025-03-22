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
      {/* SFC風の弾 - 詳細な2D形状 */}
      {isPlayerBullet ? (
        // プレイヤーの弾 - エネルギーショット
        <group 
          ref={groupRef}
          position={[bullet.position[0], bullet.position[1], 0]}
          rotation={[0, 0, bulletRotation]}
        >
          {/* メイン弾体 */}
          <mesh>
            <shapeGeometry args={[new THREE.Shape()
              .moveTo(bulletSize * 0.4, 0) // 前部先端
              .lineTo(bulletSize * 0.2, bulletSize * 0.15) // 上部
              .lineTo(-bulletSize * 0.2, bulletSize * 0.15) // 後部上
              .lineTo(-bulletSize * 0.3, 0) // 後部
              .lineTo(-bulletSize * 0.2, -bulletSize * 0.15) // 後部下
              .lineTo(bulletSize * 0.2, -bulletSize * 0.15) // 下部
              .lineTo(bulletSize * 0.4, 0) // 前部先端に戻る
            ]} />
            <meshBasicMaterial color="#66FFFF" />
          </mesh>
          
          {/* 内側の発光部分 */}
          <mesh position={[0, 0, 0.01]}>
            <shapeGeometry args={[new THREE.Shape()
              .moveTo(bulletSize * 0.3, 0) // 前部先端
              .lineTo(bulletSize * 0.1, bulletSize * 0.1) // 上部
              .lineTo(-bulletSize * 0.15, bulletSize * 0.1) // 後部上
              .lineTo(-bulletSize * 0.2, 0) // 後部
              .lineTo(-bulletSize * 0.15, -bulletSize * 0.1) // 後部下
              .lineTo(bulletSize * 0.1, -bulletSize * 0.1) // 下部
              .lineTo(bulletSize * 0.3, 0) // 前部先端に戻る
            ]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          
          {/* 尾部の発光エフェクト */}
          <mesh position={[-bulletSize * 0.3, 0, 0]}>
            <planeGeometry args={[bulletSize * 0.2, bulletSize * 0.2]} />
            <meshBasicMaterial 
              color="#00FFFF" 
              transparent={true}
              opacity={0.7}
            />
          </mesh>
        </group>
      ) : (
        // 敵の弾 - 複数の要素を持つ
        <group
          ref={groupRef}
          position={[bullet.position[0], bullet.position[1], 0]}
        >
          {/* 弾の本体 */}
          <mesh>
            <shapeGeometry args={[new THREE.Shape()
              .moveTo(bulletSize * 0.2, 0) // 前部
              .lineTo(bulletSize * 0.1, bulletSize * 0.15) // 上部
              .lineTo(-bulletSize * 0.2, bulletSize * 0.15) // 後部上
              .lineTo(-bulletSize * 0.2, -bulletSize * 0.15) // 後部下
              .lineTo(bulletSize * 0.1, -bulletSize * 0.15) // 下部
              .lineTo(bulletSize * 0.2, 0) // 前部に戻る
            ]} />
            <meshBasicMaterial color="#FF6666" />
          </mesh>
          
          {/* 中央の発光部分 */}
          <mesh position={[0, 0, 0.01]}>
            <circleGeometry args={[bulletSize * 0.15, 16]} />
            <meshBasicMaterial color="#FFFF00" />
          </mesh>
          
          {/* 尾部のエフェクト */}
          <mesh position={[-bulletSize * 0.25, 0, 0]}>
            <planeGeometry args={[bulletSize * 0.15, bulletSize * 0.25]} />
            <meshBasicMaterial 
              color="#FF8800" 
              transparent={true}
              opacity={0.6}
            />
          </mesh>
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
