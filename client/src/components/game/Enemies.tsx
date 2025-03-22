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
  
  // SFC風の詳細な敵の形状と色を敵タイプごとに決定
  const renderEnemyByType = () => {
    switch (type) {
      case EnemyType.Small:
        return (
          <>
            {/* 小型敵 - SFC風の小型戦闘機 */}
            <group rotation={[0, 0, Math.PI]}>
              {/* メインボディ */}
              <mesh>
                <shapeGeometry args={[new THREE.Shape()
                  .moveTo(0.3, 0) // 先端
                  .lineTo(0.1, 0.15) // 上部前方
                  .lineTo(-0.2, 0.15) // 上部後方
                  .lineTo(-0.3, 0) // 後部
                  .lineTo(-0.2, -0.15) // 下部後方
                  .lineTo(0.1, -0.15) // 下部前方
                  .lineTo(0.3, 0) // 先端に戻る
                ]} />
                <meshBasicMaterial color={getHealthColor()} />
              </mesh>
              
              {/* 中央部分 */}
              <mesh position={[0, 0, 0.01]}>
                <shapeGeometry args={[new THREE.Shape()
                  .moveTo(0.1, 0) // 先端
                  .lineTo(0, 0.08) // 上部
                  .lineTo(-0.15, 0.08) // 上部後方
                  .lineTo(-0.15, -0.08) // 下部後方
                  .lineTo(0, -0.08) // 下部
                  .lineTo(0.1, 0) // 先端に戻る
                ]} />
                <meshBasicMaterial color="#880000" />
              </mesh>
              
              {/* ウィング - 上下に突き出た部分 */}
              <mesh position={[-0.05, 0.15, 0.01]}>
                <planeGeometry args={[0.25, 0.1]} />
                <meshBasicMaterial color="#CC0000" />
              </mesh>
              
              <mesh position={[-0.05, -0.15, 0.01]}>
                <planeGeometry args={[0.25, 0.1]} />
                <meshBasicMaterial color="#CC0000" />
              </mesh>
            </group>
          </>
        );
        
      case EnemyType.Medium:
        return (
          <>
            {/* 中型敵 - SFC風の中型戦闘機 */}
            <group>
              {/* メインボディ */}
              <mesh>
                <shapeGeometry args={[new THREE.Shape()
                  .moveTo(0.4, 0) // 先端
                  .lineTo(0.2, 0.2) // 上部前方
                  .lineTo(-0.3, 0.2) // 上部後方
                  .lineTo(-0.4, 0) // 後部
                  .lineTo(-0.3, -0.2) // 下部後方
                  .lineTo(0.2, -0.2) // 下部前方
                  .lineTo(0.4, 0) // 先端に戻る
                ]} />
                <meshBasicMaterial color={getHealthColor()} />
              </mesh>
              
              {/* エンジン部分 */}
              <mesh position={[-0.3, 0, 0.01]}>
                <planeGeometry args={[0.2, 0.3]} />
                <meshBasicMaterial color="#DD2200" />
              </mesh>
              
              {/* コックピット部分 */}
              <mesh position={[0.1, 0, 0.01]}>
                <shapeGeometry args={[new THREE.Shape()
                  .moveTo(0.15, 0) // 先端
                  .lineTo(0.05, 0.1) // 上部前方
                  .lineTo(-0.15, 0.1) // 上部後方
                  .lineTo(-0.15, -0.1) // 下部後方
                  .lineTo(0.05, -0.1) // 下部前方
                  .lineTo(0.15, 0) // 先端に戻る
                ]} />
                <meshBasicMaterial color="#FFCC00" />
              </mesh>
              
              {/* 装甲パネル */}
              <mesh position={[-0.1, 0.15, 0.01]}>
                <planeGeometry args={[0.3, 0.05]} />
                <meshBasicMaterial color="#881100" />
              </mesh>
              
              <mesh position={[-0.1, -0.15, 0.01]}>
                <planeGeometry args={[0.3, 0.05]} />
                <meshBasicMaterial color="#881100" />
              </mesh>
              
              {/* ウィングチップ - 上下 */}
              <mesh position={[-0.1, 0.25, 0.01]}>
                <circleGeometry args={[0.05, 8]} />
                <meshBasicMaterial color="#FF4400" />
              </mesh>
              
              <mesh position={[-0.1, -0.25, 0.01]}>
                <circleGeometry args={[0.05, 8]} />
                <meshBasicMaterial color="#FF4400" />
              </mesh>
            </group>
          </>
        );
        
      case EnemyType.Large:
        return (
          <>
            {/* 大型敵 - SFC風の重装甲戦艦 */}
            <group>
              {/* メインボディ - 大型の艦体 */}
              <mesh>
                <shapeGeometry args={[new THREE.Shape()
                  .moveTo(0.5, 0) // 先端
                  .lineTo(0.3, 0.3) // 上部前方
                  .lineTo(-0.4, 0.3) // 上部後方
                  .lineTo(-0.5, 0) // 後部
                  .lineTo(-0.4, -0.3) // 下部後方
                  .lineTo(0.3, -0.3) // 下部前方
                  .lineTo(0.5, 0) // 先端に戻る
                ]} />
                <meshBasicMaterial color={getHealthColor()} />
              </mesh>
              
              {/* 中央部のコア */}
              <mesh position={[0, 0, 0.01]}>
                <circleGeometry args={[0.25, 16]} />
                <meshBasicMaterial color="#FFDD00" />
              </mesh>
              
              {/* 内側のコア - 発光効果 */}
              <mesh position={[0, 0, 0.02]}>
                <circleGeometry args={[0.15, 16]} />
                <meshBasicMaterial 
                  color={`hsl(${(Date.now() * 0.05) % 360}, 100%, 60%)`} 
                />
              </mesh>
              
              {/* 装甲パネル - 上部 */}
              <mesh position={[0.1, 0.2, 0.01]}>
                <shapeGeometry args={[new THREE.Shape()
                  .moveTo(0.2, 0) 
                  .lineTo(0.1, 0.1) 
                  .lineTo(-0.3, 0.1) 
                  .lineTo(-0.3, -0.1) 
                  .lineTo(0.1, -0.1)
                  .lineTo(0.2, 0)
                ]} />
                <meshBasicMaterial color="#664400" />
              </mesh>
              
              {/* 装甲パネル - 下部 */}
              <mesh position={[0.1, -0.2, 0.01]}>
                <shapeGeometry args={[new THREE.Shape()
                  .moveTo(0.2, 0) 
                  .lineTo(0.1, -0.1) 
                  .lineTo(-0.3, -0.1) 
                  .lineTo(-0.3, 0.1) 
                  .lineTo(0.1, 0.1)
                  .lineTo(0.2, 0)
                ]} />
                <meshBasicMaterial color="#664400" />
              </mesh>
              
              {/* 砲台 - 上部 */}
              <mesh position={[0.2, 0.15, 0.02]}>
                <boxGeometry args={[0.2, 0.1, 0.01]} />
                <meshBasicMaterial color="#444444" />
              </mesh>
              
              {/* 砲台 - 下部 */}
              <mesh position={[0.2, -0.15, 0.02]}>
                <boxGeometry args={[0.2, 0.1, 0.01]} />
                <meshBasicMaterial color="#444444" />
              </mesh>
              
              {/* エンジン部分 */}
              <mesh position={[-0.4, 0, 0.01]}>
                <planeGeometry args={[0.2, 0.4]} />
                <meshBasicMaterial color="#FF6600" />
              </mesh>
            </group>
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
