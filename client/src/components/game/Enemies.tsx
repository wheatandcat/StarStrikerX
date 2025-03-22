import { useRef, useState, useEffect, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { useGradius } from "@/lib/stores/useGradius";
import { EnemyType } from "@/lib/types";
import { getEnemyProperties } from "@/lib/gameUtils";

// Preload enemy models
useGLTF.preload('/models/enemy_small.glb');
useGLTF.preload('/models/enemy_medium.glb');
useGLTF.preload('/models/enemy_large.glb');
useGLTF.preload('/models/enemy_boss.glb');

// 敵キャラを3Dモデルに変更
const Enemy = ({ enemy }: { enemy: any }) => {
  const groupRef = useRef<THREE.Group>(null);
  const type = enemy.type as EnemyType;
  const properties = getEnemyProperties(type);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Load appropriate enemy model based on type
  const smallModel = useGLTF('/models/enemy_small.glb') as GLTF & { scene: THREE.Group };
  const mediumModel = useGLTF('/models/enemy_medium.glb') as GLTF & { scene: THREE.Group };
  const largeModel = useGLTF('/models/enemy_large.glb') as GLTF & { scene: THREE.Group };
  const bossModel = useGLTF('/models/enemy_boss.glb') as GLTF & { scene: THREE.Group };
  
  // Get the appropriate model based on enemy type
  const getModelForType = () => {
    switch (type) {
      case EnemyType.Small:
        return smallModel.scene.clone();
      case EnemyType.Medium:
        return mediumModel.scene.clone();
      case EnemyType.Boss:
        return bossModel.scene.clone();
      case EnemyType.Large:
        return largeModel.scene.clone();
      default:
        return smallModel.scene.clone();
    }
  };
  
  // Update model loaded state
  useEffect(() => {
    if (smallModel && mediumModel && largeModel && bossModel) {
      setModelLoaded(true);
      console.log(`Enemy model loaded: ${type}`);
    }
  }, [smallModel, mediumModel, largeModel, bossModel, type]);
  
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
        scale * pulse
      );
    } else if (type === EnemyType.Boss) {
      // Boss: メカニカルな動き
      groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.05;
      // Move slightly up and down
      groupRef.current.position.y = enemy.position[1] + Math.sin(time * 0.7) * 0.2;
    }
  });
  
  // 敵のサイズに基づいてスケールを調整
  const scale = properties.size * 2.5; // Scale up the models
  
  // エネミーのヘルスに基づく色の変化
  const getHealthColor = () => {
    const healthPercent = enemy.health / properties.health; // maxHealthはないので初期healthを使用
    if (healthPercent > 0.7) return new THREE.Color(0.2, 1.0, 0.2); // 健康 - 緑
    if (healthPercent > 0.3) return new THREE.Color(1.0, 1.0, 0.2); // 中程度ダメージ - 黄色
    return new THREE.Color(1.0, 0.2, 0.2); // 重度ダメージ - 赤
  };
  
  // エネミーの光エフェクト
  const lightColor = getHealthColor();
  
  return (
    <group
      ref={groupRef}
      position={[enemy.position[0], enemy.position[1], 0]}
      scale={[scale, scale, scale]}
      rotation={[0, 0, 0]}
    >
      {/* 3Dモデルの敵 */}
      {modelLoaded ? (
        <Suspense fallback={
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.5, 0.2]} />
            <meshStandardMaterial color="#FF0000" />
          </mesh>
        }>
          <primitive object={getModelForType()} castShadow receiveShadow />
        </Suspense>
      ) : (
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.5, 0.2]} />
          <meshStandardMaterial color="#FF0000" />
        </mesh>
      )}
      
      {/* 光エフェクト - 敵の種類によってサイズと強度が変わる */}
      <pointLight 
        position={[0, 0, 0.3]} 
        color={lightColor} 
        intensity={properties.size * 0.5} 
        distance={properties.size * 2}
      />
    </group>
  );
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
