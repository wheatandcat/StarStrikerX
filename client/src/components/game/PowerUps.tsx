import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useGradius } from "@/lib/stores/useGradius";
import { useAudio } from "@/lib/stores/useAudio";
import { PowerUpType } from "@/lib/types";
import { POWERUP_SIZE } from "@/lib/constants";

// レトロスタイルのパワーアップ
const PowerUp = ({ powerUp }: { powerUp: any }) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Different styles for different power-up types
  let color = "#FFFF00"; // Default yellow
  let label = "W";
  
  if (powerUp.type === PowerUpType.WeaponUpgrade) {
    color = "#00FFAA";
    label = "W";
  }
  
  // Update power-up position and add hover/rotation effects
  useFrame(({ clock }) => {
    if (!groupRef.current || !meshRef.current) return;
    
    const time = clock.getElapsedTime();
    
    // 位置のアップデート
    groupRef.current.position.x = powerUp.position[0];
    groupRef.current.position.y = powerUp.position[1];
    
    // 浮遊効果を追加
    const hoverOffset = Math.sin(time * 3) * 0.05;
    groupRef.current.position.y = powerUp.position[1] + hoverOffset;
    
    // 回転エフェクト
    groupRef.current.rotation.z = time * 2;
    
    // サイズの脈動
    const scalePulse = 1.0 + Math.sin(time * 4) * 0.1;
    groupRef.current.scale.set(scalePulse, scalePulse, 1);
    
    // パワーアップの色も脈動
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      const hue = (Math.sin(time * 2) * 0.1) + 0.5; // 色相を少し変化させる
      material.color.setHSL(hue, 1, 0.5);
    }
  });
  
  return (
    <group 
      ref={groupRef} 
      position={[powerUp.position[0], powerUp.position[1], 0]}
      scale={[1, 1, 1]}
    >
      {/* グラディウス/R-Type風のウェポンカプセル */}
      <group>
        {/* カプセルの外殻 - グラディウス風の赤いカプセル */}
        <mesh ref={meshRef}>
          <capsuleGeometry args={[POWERUP_SIZE * 0.25, POWERUP_SIZE * 0.3, 8, 16]} />
          <meshBasicMaterial color="#F44336" />
        </mesh>
        
        {/* 内側のコア - オレンジのエネルギー */}
        <mesh position={[0, 0, 0.01]}>
          <capsuleGeometry args={[POWERUP_SIZE * 0.18, POWERUP_SIZE * 0.2, 8, 16]} />
          <meshBasicMaterial 
            color="#FFEB3B" 
            transparent={true}
            opacity={Math.abs(Math.sin(Date.now() * 0.003)) * 0.2 + 0.8}
          />
        </mesh>
        
        {/* カプセルの側面マーカー - 上部 */}
        <mesh position={[0, POWERUP_SIZE * 0.25, 0.02]}>
          <planeGeometry args={[POWERUP_SIZE * 0.15, POWERUP_SIZE * 0.08]} />
          <meshBasicMaterial color="#B71C1C" />
        </mesh>
        
        {/* カプセルの側面マーカー - 下部 */}
        <mesh position={[0, -POWERUP_SIZE * 0.25, 0.02]}>
          <planeGeometry args={[POWERUP_SIZE * 0.15, POWERUP_SIZE * 0.08]} />
          <meshBasicMaterial color="#B71C1C" />
        </mesh>
        
        {/* R-Type風の中央シンボル */}
        <group position={[0, 0, 0.02]}>
          {/* 中央の円形マーカー */}
          <mesh>
            <circleGeometry args={[POWERUP_SIZE * 0.15, 6]} />
            <meshBasicMaterial color="#B71C1C" />
          </mesh>
          
          {/* 内側のシンボル */}
          <mesh position={[0, 0, 0.01]}>
            <circleGeometry args={[POWERUP_SIZE * 0.1, 6]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          
          {/* アップグレードアイコン - 上向き矢印 */}
          <group position={[0, 0, 0.01]}>
            {/* 矢印の縦棒 */}
            <mesh position={[0, 0, 0.01]}>
              <planeGeometry args={[POWERUP_SIZE * 0.05, POWERUP_SIZE * 0.15]} />
              <meshBasicMaterial color="#263238" />
            </mesh>
            
            {/* 矢印の頭 - 左側 */}
            <mesh position={[-POWERUP_SIZE * 0.05, POWERUP_SIZE * 0.05, 0.01]} rotation={[0, 0, Math.PI / 4]}>
              <planeGeometry args={[POWERUP_SIZE * 0.1, POWERUP_SIZE * 0.05]} />
              <meshBasicMaterial color="#263238" />
            </mesh>
            
            {/* 矢印の頭 - 右側 */}
            <mesh position={[POWERUP_SIZE * 0.05, POWERUP_SIZE * 0.05, 0.01]} rotation={[0, 0, -Math.PI / 4]}>
              <planeGeometry args={[POWERUP_SIZE * 0.1, POWERUP_SIZE * 0.05]} />
              <meshBasicMaterial color="#263238" />
            </mesh>
          </group>
        </group>
        
        {/* エネルギー放射エフェクト - グラディウス風 */}
        <group>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh 
              key={i} 
              position={[0, 0, -0.01]}
              rotation={[0, 0, (Math.PI * i) / 4 + (Date.now() * 0.001) % (Math.PI * 2)]}
            >
              <planeGeometry args={[POWERUP_SIZE * 0.5, POWERUP_SIZE * 0.08]} />
              <meshBasicMaterial 
                color="#FF5722" 
                transparent={true}
                opacity={Math.abs(Math.sin(Date.now() * 0.003 + i)) * 0.3 + 0.2}
              />
            </mesh>
          ))}
        </group>
        
        {/* オービットリング - R-Type風 */}
        <mesh position={[0, 0, -0.02]} rotation={[0, 0, Date.now() * 0.001]}>
          <ringGeometry args={[POWERUP_SIZE * 0.4, POWERUP_SIZE * 0.45, 16]} />
          <meshBasicMaterial 
            color="#4FC3F7"
            transparent={true}
            opacity={0.4}
          />
        </mesh>
        
        {/* リングマーカー - 小さな球体 */}
        <group position={[0, 0, -0.02]}>
          {[0, 1, 2, 3].map((i) => (
            <mesh 
              key={i} 
              position={[
                Math.cos(Date.now() * 0.001 + i * Math.PI / 2) * POWERUP_SIZE * 0.42,
                Math.sin(Date.now() * 0.001 + i * Math.PI / 2) * POWERUP_SIZE * 0.42,
                0
              ]}
            >
              <circleGeometry args={[POWERUP_SIZE * 0.05, 8]} />
              <meshBasicMaterial color="#4FC3F7" />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

const PowerUps = () => {
  const { powerUps } = useGradius();
  const { playWeaponUpgrade } = useAudio();
  
  // パワーアップ取得時の効果音
  const previousPowerUpsRef = useRef<Record<string, boolean>>({});
  
  useEffect(() => {
    const currentPowerUpIds: Record<string, boolean> = {};
    
    // 現在のパワーアップをマーク
    powerUps.forEach(powerUp => {
      currentPowerUpIds[powerUp.id] = true;
    });
    
    // 前フレームにあったが現在のフレームにないパワーアップを検出
    // これは取得されたことを意味する
    Object.keys(previousPowerUpsRef.current).forEach(id => {
      if (!currentPowerUpIds[id]) {
        // パワーアップが取得された、効果音を再生
        playWeaponUpgrade();
        console.log(`PowerUp ${id} collected`);
      }
    });
    
    // 前フレームの参照を更新
    previousPowerUpsRef.current = currentPowerUpIds;
  }, [powerUps, playWeaponUpgrade]);
  
  return (
    <group>
      {powerUps.map((powerUp) => (
        <PowerUp key={powerUp.id} powerUp={powerUp} />
      ))}
    </group>
  );
};

export default PowerUps;
