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
  
  // グラディウス/ダライアス/R-Type風の敵機デザイン
  const renderEnemyByType = () => {
    switch (type) {
      case EnemyType.Small:
        return (
          <>
            {/* 小型敵 - グラディウス風の小型ファンガー */}
            <group rotation={[0, 0, Math.PI]}>
              {/* メインボディ - 角張ったデザイン */}
              <mesh>
                <shapeGeometry args={[new THREE.Shape()
                  .moveTo(0.3, 0) // 先端
                  .lineTo(0.2, 0.15) // 上部前方
                  .lineTo(-0.2, 0.15) // 上部後方
                  .lineTo(-0.3, 0) // 後部
                  .lineTo(-0.2, -0.15) // 下部後方
                  .lineTo(0.2, -0.15) // 下部前方
                  .lineTo(0.3, 0) // 先端に戻る
                ]} />
                <meshBasicMaterial color="#E53935" />
              </mesh>
              
              {/* 中央部分 - 機械的なディテール */}
              <mesh position={[0, 0, 0.01]}>
                <shapeGeometry args={[new THREE.Shape()
                  .moveTo(0.15, 0) // 先端
                  .lineTo(0.05, 0.08) // 上部
                  .lineTo(-0.15, 0.08) // 上部後方
                  .lineTo(-0.20, 0) // 後部
                  .lineTo(-0.15, -0.08) // 下部後方
                  .lineTo(0.05, -0.08) // 下部
                  .lineTo(0.15, 0) // 先端に戻る
                ]} />
                <meshBasicMaterial color="#9C0D00" />
              </mesh>
              
              {/* メカニカルライン - 水平 */}
              <mesh position={[0, 0, 0.02]}>
                <planeGeometry args={[0.35, 0.02]} />
                <meshBasicMaterial color="#6D0000" />
              </mesh>
              
              {/* メカニカルライン - 垂直 */}
              <mesh position={[-0.1, 0, 0.02]} rotation={[0, 0, Math.PI/2]}>
                <planeGeometry args={[0.2, 0.02]} />
                <meshBasicMaterial color="#6D0000" />
              </mesh>
              
              {/* R-Type風の機械的ウィング - 上 */}
              <mesh position={[-0.1, 0.18, 0.01]}>
                <shapeGeometry args={[new THREE.Shape()
                  .moveTo(0.15, 0) // 前部
                  .lineTo(0.05, 0.08) // 上部
                  .lineTo(-0.15, 0.08) // 後部上
                  .lineTo(-0.2, 0) // 後部
                  .lineTo(0.15, 0) // 前部に戻る
                ]} />
                <meshBasicMaterial color="#9C0D00" />
              </mesh>
              
              {/* R-Type風の機械的ウィング - 下 */}
              <mesh position={[-0.1, -0.18, 0.01]}>
                <shapeGeometry args={[new THREE.Shape()
                  .moveTo(0.15, 0) // 前部
                  .lineTo(0.05, -0.08) // 下部
                  .lineTo(-0.15, -0.08) // 後部下
                  .lineTo(-0.2, 0) // 後部
                  .lineTo(0.15, 0) // 前部に戻る
                ]} />
                <meshBasicMaterial color="#9C0D00" />
              </mesh>
              
              {/* エンジン発光 */}
              <mesh position={[-0.3, 0, 0.02]}>
                <planeGeometry args={[0.1, 0.15]} />
                <meshBasicMaterial 
                  color="#FF5722" 
                  transparent={true}
                  opacity={0.8}
                />
              </mesh>
            </group>
          </>
        );
        
      case EnemyType.Medium:
        return (
          <>
            {/* 中型敵 - ダライアス風の中型戦闘機 */}
            <group>
              {/* メインボディ - 折り紙のような形状 */}
              <mesh>
                <shapeGeometry args={[new THREE.Shape()
                  .moveTo(0.4, 0) // 先端
                  .lineTo(0.3, 0.15) // 上部前方
                  .lineTo(0.1, 0.25) // 上部中央
                  .lineTo(-0.3, 0.2) // 上部後方
                  .lineTo(-0.4, 0) // 後部
                  .lineTo(-0.3, -0.2) // 下部後方
                  .lineTo(0.1, -0.25) // 下部中央
                  .lineTo(0.3, -0.15) // 下部前方
                  .lineTo(0.4, 0) // 先端に戻る
                ]} />
                <meshBasicMaterial color={getHealthColor()} />
              </mesh>
              
              {/* エンジン発光 - 後部 */}
              <mesh position={[-0.4, 0, 0.01]}>
                <planeGeometry args={[0.1, 0.3]} />
                <meshBasicMaterial 
                  color="#FF5722" 
                  transparent={true}
                  opacity={0.8}
                />
              </mesh>
              
              {/* コックピット部分 - ダライアス風の幾何学的デザイン */}
              <mesh position={[0.1, 0, 0.01]}>
                <shapeGeometry args={[new THREE.Shape()
                  .moveTo(0.2, 0) // 先端
                  .lineTo(0.1, 0.1) // 上部前方
                  .lineTo(-0.1, 0.1) // 上部後方
                  .lineTo(-0.2, 0) // 後部
                  .lineTo(-0.1, -0.1) // 下部後方
                  .lineTo(0.1, -0.1) // 下部前方
                  .lineTo(0.2, 0) // 先端に戻る
                ]} />
                <meshBasicMaterial color="#616161" />
              </mesh>
              
              {/* メカニカルディテール - 水平 */}
              <mesh position={[0, 0, 0.02]}>
                <planeGeometry args={[0.6, 0.03]} />
                <meshBasicMaterial color="#424242" />
              </mesh>
              
              {/* メカニカルディテール - 垂直 */}
              <mesh position={[-0.15, 0, 0.02]} rotation={[0, 0, Math.PI/2]}>
                <planeGeometry args={[0.3, 0.03]} />
                <meshBasicMaterial color="#424242" />
              </mesh>
              
              {/* アクスレイ風のサイドアーマー - 上 */}
              <mesh position={[-0.05, 0.25, 0.01]}>
                <shapeGeometry args={[new THREE.Shape()
                  .moveTo(0.25, 0) 
                  .lineTo(0.15, 0.1) 
                  .lineTo(-0.25, 0.1) 
                  .lineTo(-0.35, 0) 
                  .lineTo(0.25, 0)
                ]} />
                <meshBasicMaterial color="#546E7A" />
              </mesh>
              
              {/* アクスレイ風のサイドアーマー - 下 */}
              <mesh position={[-0.05, -0.25, 0.01]}>
                <shapeGeometry args={[new THREE.Shape()
                  .moveTo(0.25, 0) 
                  .lineTo(0.15, -0.1) 
                  .lineTo(-0.25, -0.1) 
                  .lineTo(-0.35, 0) 
                  .lineTo(0.25, 0)
                ]} />
                <meshBasicMaterial color="#546E7A" />
              </mesh>
              
              {/* 前方センサー/武器ポッド */}
              <mesh position={[0.35, 0, 0.03]}>
                <circleGeometry args={[0.06, 6]} />
                <meshBasicMaterial color="#FFC107" />
              </mesh>
            </group>
          </>
        );
        
      case EnemyType.Large:
        return (
          <>
            {/* 大型敵 - R-Type風の重装甲戦艦 */}
            <group>
              {/* メインボディ - 未来的な幾何学デザイン */}
              <mesh>
                <shapeGeometry args={[new THREE.Shape()
                  .moveTo(0.5, 0) // 先端
                  .lineTo(0.4, 0.2) // 上部前方
                  .lineTo(0.2, 0.3) // 上部中央前方
                  .lineTo(-0.3, 0.35) // 上部後方
                  .lineTo(-0.5, 0.1) // 後部上
                  .lineTo(-0.6, 0) // 後部
                  .lineTo(-0.5, -0.1) // 後部下
                  .lineTo(-0.3, -0.35) // 下部後方
                  .lineTo(0.2, -0.3) // 下部中央前方
                  .lineTo(0.4, -0.2) // 下部前方
                  .lineTo(0.5, 0) // 先端に戻る
                ]} />
                <meshBasicMaterial color={getHealthColor()} />
              </mesh>
              
              {/* 中央コア - R-Type風のバイオメカコア */}
              <mesh position={[0, 0, 0.01]}>
                <circleGeometry args={[0.25, 6]} />
                <meshBasicMaterial color="#880E4F" />
              </mesh>
              
              {/* コアの内側 - 鼓動するようなエフェクト */}
              <mesh position={[0, 0, 0.02]}>
                <circleGeometry args={[0.2, 6]} />
                <meshBasicMaterial 
                  color={`hsl(${(Date.now() * 0.05) % 360}, 100%, 50%)`} 
                  transparent={true}
                  opacity={0.8}
                />
              </mesh>
              
              {/* コア内部の十字線 - 縦 */}
              <mesh position={[0, 0, 0.03]} rotation={[0, 0, 0]}>
                <planeGeometry args={[0.03, 0.4]} />
                <meshBasicMaterial color="#000000" opacity={0.6} transparent={true} />
              </mesh>
              
              {/* コア内部の十字線 - 横 */}
              <mesh position={[0, 0, 0.03]} rotation={[0, 0, Math.PI/2]}>
                <planeGeometry args={[0.03, 0.4]} />
                <meshBasicMaterial color="#000000" opacity={0.6} transparent={true} />
              </mesh>
              
              {/* 上部の武器システム - R-Type風 */}
              <group position={[0.1, 0.25, 0.02]}>
                {/* ベース部分 */}
                <mesh>
                  <boxGeometry args={[0.4, 0.1, 0.02]} />
                  <meshBasicMaterial color="#303F9F" />
                </mesh>
                
                {/* 砲身 */}
                <mesh position={[0.25, 0, 0.01]}>
                  <boxGeometry args={[0.15, 0.06, 0.01]} />
                  <meshBasicMaterial color="#1A237E" />
                </mesh>
                
                {/* ライト/センサー */}
                <mesh position={[0.35, 0, 0.02]}>
                  <circleGeometry args={[0.02, 8]} />
                  <meshBasicMaterial color="#F44336" />
                </mesh>
              </group>
              
              {/* 下部の武器システム - R-Type風 */}
              <group position={[0.1, -0.25, 0.02]}>
                {/* ベース部分 */}
                <mesh>
                  <boxGeometry args={[0.4, 0.1, 0.02]} />
                  <meshBasicMaterial color="#303F9F" />
                </mesh>
                
                {/* 砲身 */}
                <mesh position={[0.25, 0, 0.01]}>
                  <boxGeometry args={[0.15, 0.06, 0.01]} />
                  <meshBasicMaterial color="#1A237E" />
                </mesh>
                
                {/* ライト/センサー */}
                <mesh position={[0.35, 0, 0.02]}>
                  <circleGeometry args={[0.02, 8]} />
                  <meshBasicMaterial color="#F44336" />
                </mesh>
              </group>
              
              {/* 側面装甲 - 上部 */}
              <mesh position={[-0.1, 0.2, 0.01]}>
                <boxGeometry args={[0.5, 0.1, 0.01]} />
                <meshBasicMaterial color="#303F9F" />
              </mesh>
              
              {/* 側面装甲 - 下部 */}
              <mesh position={[-0.1, -0.2, 0.01]}>
                <boxGeometry args={[0.5, 0.1, 0.01]} />
                <meshBasicMaterial color="#303F9F" />
              </mesh>
              
              {/* エンジン排気 - 2基 */}
              <group position={[-0.55, 0, 0.01]}>
                {/* 上部エンジン */}
                <mesh position={[0, 0.15, 0]}>
                  <planeGeometry args={[0.15, 0.15]} />
                  <meshBasicMaterial 
                    color="#FF9800" 
                    transparent={true}
                    opacity={0.8}
                  />
                </mesh>
                
                {/* 下部エンジン */}
                <mesh position={[0, -0.15, 0]}>
                  <planeGeometry args={[0.15, 0.15]} />
                  <meshBasicMaterial 
                    color="#FF9800" 
                    transparent={true}
                    opacity={0.8}
                  />
                </mesh>
              </group>
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
