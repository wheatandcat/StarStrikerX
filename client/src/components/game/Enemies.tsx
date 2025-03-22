import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGradius } from "@/lib/stores/useGradius";
import { EnemyType } from "@/lib/types";
import { getEnemyProperties } from "@/lib/gameUtils";

// 敵キャラをドット絵風メカデザインに変更
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
      groupRef.current.rotation.z += 0.02;
    } else if (type === EnemyType.Large) {
      // Large enemy: ゆっくりとしたパルス
      const pulse = 0.95 + Math.sin(time * 1.5) * 0.05;
      groupRef.current.scale.set(pulse, pulse, pulse);
    }
  });
  
  // 敵のサイズに基づいてスケールを調整
  const scale = properties.size;
  
  // 敵タイプごとの異なるデザイン
  switch (type) {
    case EnemyType.Small:
      // 小型敵 - 小型の円形メカドット風
      return (
        <group 
          ref={groupRef} 
          position={[enemy.position[0], enemy.position[1], 0]}
          scale={[scale, scale, scale]}
        >
          {/* 中央ボディ - 赤 */}
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.5, 0.2]} />
            <meshStandardMaterial color="#FF0000" />
          </mesh>
          
          {/* 目/センサー - 黄色 */}
          <mesh position={[0, 0, 0.15]}>
            <boxGeometry args={[0.2, 0.2, 0.1]} />
            <meshStandardMaterial 
              color="#FFFF00" 
              emissive="#FFFF00"
              emissiveIntensity={0.5}
            />
          </mesh>
          
          {/* 中央サーキュラーパーツ */}
          <mesh position={[0, 0, -0.1]}>
            <boxGeometry args={[0.3, 0.3, 0.1]} />
            <meshStandardMaterial color="#555555" />
          </mesh>
          
          {/* 光エフェクト */}
          <pointLight position={[0, 0, 0.3]} color="#FFFF00" intensity={0.5} distance={1} />
        </group>
      );
      
    case EnemyType.Medium:
      // 中型敵 - 六角形メカドット風
      return (
        <group 
          ref={groupRef} 
          position={[enemy.position[0], enemy.position[1], 0]}
          scale={[scale, scale, scale]}
        >
          {/* 中央ボディ - オレンジ */}
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.6, 0.2]} />
            <meshStandardMaterial color="#FF6600" />
          </mesh>
          
          {/* 上部ウィング */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.4, 0.2, 0.1]} />
            <meshStandardMaterial color="#994400" />
          </mesh>
          
          {/* 下部ウィング */}
          <mesh position={[0, -0.4, 0]}>
            <boxGeometry args={[0.4, 0.2, 0.1]} />
            <meshStandardMaterial color="#994400" />
          </mesh>
          
          {/* 中央コア - 黄色 */}
          <mesh position={[0, 0, 0.2]}>
            <boxGeometry args={[0.3, 0.3, 0.1]} />
            <meshStandardMaterial 
              color="#FFAA00" 
              emissive="#FFAA00"
              emissiveIntensity={0.6}
            />
          </mesh>
          
          {/* 砲台 1 */}
          <mesh position={[-0.2, 0.2, 0.1]}>
            <boxGeometry args={[0.1, 0.1, 0.2]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          
          {/* 砲台 2 */}
          <mesh position={[-0.2, -0.2, 0.1]}>
            <boxGeometry args={[0.1, 0.1, 0.2]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          
          {/* 光エフェクト */}
          <pointLight position={[0, 0, 0.4]} color="#FFAA00" intensity={0.7} distance={1.5} />
        </group>
      );
      
    case EnemyType.Large:
      // 大型敵 - 大型メカドット風
      return (
        <group 
          ref={groupRef} 
          position={[enemy.position[0], enemy.position[1], 0]}
          scale={[scale, scale, scale]}
        >
          {/* メインボディ - 紫 */}
          <mesh castShadow>
            <boxGeometry args={[0.8, 0.6, 0.3]} />
            <meshStandardMaterial color="#9900CC" />
          </mesh>
          
          {/* 上部構造物 */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.6, 0.2, 0.1]} />
            <meshStandardMaterial color="#6600AA" />
          </mesh>
          
          {/* 下部構造物 */}
          <mesh position={[0, -0.4, 0]}>
            <boxGeometry args={[0.6, 0.2, 0.1]} />
            <meshStandardMaterial color="#6600AA" />
          </mesh>
          
          {/* 中央コア - 明るい紫 */}
          <mesh position={[0, 0, 0.2]}>
            <boxGeometry args={[0.4, 0.3, 0.1]} />
            <meshStandardMaterial 
              color="#DD00FF" 
              emissive="#DD00FF"
              emissiveIntensity={0.7}
            />
          </mesh>
          
          {/* 左砲台 */}
          <mesh position={[-0.3, 0.2, 0.2]}>
            <boxGeometry args={[0.2, 0.1, 0.2]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          
          {/* 右砲台 */}
          <mesh position={[-0.3, -0.2, 0.2]}>
            <boxGeometry args={[0.2, 0.1, 0.2]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          
          {/* 後部エンジン */}
          <mesh position={[0.4, 0, 0.1]}>
            <boxGeometry args={[0.1, 0.3, 0.2]} />
            <meshStandardMaterial 
              color="#FF00FF" 
              emissive="#FF00FF"
              emissiveIntensity={0.5}
            />
          </mesh>
          
          {/* 光エフェクト */}
          <pointLight position={[0, 0, 0.5]} color="#FF00FF" intensity={0.8} distance={2} />
        </group>
      );
      
    default:
      // デフォルト (念のため)
      return (
        <group 
          ref={groupRef} 
          position={[enemy.position[0], enemy.position[1], 0]}
          scale={[scale, scale, scale]}
        >
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.5, 0.2]} />
            <meshStandardMaterial color="#FF0000" />
          </mesh>
        </group>
      );
  }
};

const Enemies = () => {
  const { enemies } = useGradius();
  
  return (
    <group>
      {enemies.map((enemy) => (
        <Enemy key={enemy.id} enemy={enemy} />
      ))}
    </group>
  );
};

export default Enemies;
