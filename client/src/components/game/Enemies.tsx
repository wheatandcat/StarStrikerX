import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGradius } from "@/lib/stores/useGradius";
import { EnemyType } from "@/lib/types";
import { getEnemyProperties } from "@/lib/gameUtils";

// 敵キャラをレトロな2Dスタイルに変更
const Enemy = ({ enemy }: { enemy: any }) => {
  const groupRef = useRef<THREE.Group>(null);
  const type = enemy.type as EnemyType;
  const properties = getEnemyProperties(type);
  
  // Update position based on enemy position
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    
    // Update position from the enemy state
    groupRef.current.position.x = enemy.position[0];
    groupRef.current.position.y = enemy.position[1];
    
    // 敵タイプに応じた動きのパターン
    const time = clock.getElapsedTime();
    
    if (type === EnemyType.Small) {
      // Small enemy: 小さく揺れる
      groupRef.current.rotation.z = Math.sin(time * 3) * 0.1;
    } else if (type === EnemyType.Medium) {
      // Medium enemy: 回転
      groupRef.current.rotation.z = Math.sin(time * 2) * 0.2;
    } else if (type === EnemyType.Large) {
      // Large enemy: ゆっくりとしたパルス
      const pulse = 0.95 + Math.sin(time * 1.5) * 0.05;
      groupRef.current.scale.set(
        scale * pulse, 
        scale * pulse, 
        1
      );
    }
    // Bossはここでは処理しない（Boss.tsxで処理）
  });
  
  // 敵のサイズに基づいてスケールを調整
  const scale = properties.size * 1.5;
  
  // エネミーのヘルスに基づく色の変化
  const getHealthColor = () => {
    const healthPercent = enemy.health / properties.health;
    if (healthPercent > 0.7) return "#22FF22"; // 健康 - 緑
    if (healthPercent > 0.3) return "#FFFF22"; // 中程度ダメージ - 黄色
    return "#FF2222"; // 重度ダメージ - 赤
  };
  
  // 敵の形状と色を敵タイプごとに決定
  const renderEnemyByType = () => {
    switch (type) {
      case EnemyType.Small:
        return (
          <>
            {/* 小型敵 - シンプルな三角形 */}
            <mesh rotation={[0, 0, Math.PI]}>
              <planeGeometry args={[0.6, 0.6]} />
              <meshBasicMaterial color={getHealthColor()} />
            </mesh>
          </>
        );
        
      case EnemyType.Medium:
        return (
          <>
            {/* 中型敵 - 少し複雑な形状 */}
            <mesh>
              <planeGeometry args={[0.8, 0.5]} />
              <meshBasicMaterial color={getHealthColor()} />
            </mesh>
            
            {/* サイドウィング */}
            <mesh position={[0, 0.3, 0.01]}>
              <planeGeometry args={[0.4, 0.2]} />
              <meshBasicMaterial color="#FF4444" />
            </mesh>
            
            <mesh position={[0, -0.3, 0.01]}>
              <planeGeometry args={[0.4, 0.2]} />
              <meshBasicMaterial color="#FF4444" />
            </mesh>
          </>
        );
        
      case EnemyType.Large:
        return (
          <>
            {/* 大型敵 - より複雑な形状 */}
            <mesh>
              <planeGeometry args={[1, 0.7]} />
              <meshBasicMaterial color={getHealthColor()} />
            </mesh>
            
            {/* 追加パーツ */}
            <mesh position={[0.3, 0, 0.01]}>
              <planeGeometry args={[0.3, 0.3]} />
              <meshBasicMaterial color="#884444" />
            </mesh>
            
            <mesh position={[-0.4, 0, 0.01]}>
              <circleGeometry args={[0.25, 16]} />
              <meshBasicMaterial color="#FFFF44" />
            </mesh>
          </>
        );
        
      default:
        return (
          <mesh>
            <planeGeometry args={[0.5, 0.5]} />
            <meshBasicMaterial color={getHealthColor()} />
          </mesh>
        );
    }
  };
  
  return (
    <group
      ref={groupRef}
      position={[enemy.position[0], enemy.position[1], 0]}
      scale={[scale, scale, 1]}
      rotation={[0, 0, 0]}
    >
      {renderEnemyByType()}
      
      {/* ダメージエフェクト - HPが低いほど点滅 */}
      {enemy.health / properties.health < 0.3 && (
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[1.2, 0.8]} />
          <meshBasicMaterial 
            color="#FFFFFF" 
            transparent={true} 
            opacity={Math.abs(Math.sin(Date.now() * 0.01)) * 0.3} 
          />
        </mesh>
      )}
    </group>
  );
};

const Enemies = () => {
  const { enemies } = useGradius();
  
  return (
    <group>
      {enemies.map((enemy) => (
        enemy.type !== EnemyType.Boss && <Enemy key={enemy.id} enemy={enemy} />
      ))}
    </group>
  );
};

export default Enemies;
