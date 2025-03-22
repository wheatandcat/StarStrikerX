import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useGradius } from "@/lib/stores/useGradius";
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
      {/* パワーアップの四角形 */}
      <mesh ref={meshRef}>
        <planeGeometry args={[POWERUP_SIZE * 0.8, POWERUP_SIZE * 0.8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      
      {/* 内側のシンボル */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[POWERUP_SIZE * 0.4, POWERUP_SIZE * 0.4]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      
      {/* テキストラベル */}
      <Html
        position={[0, 0, 0.1]}
        transform
        center
        scale={0.5}
      >
        <div style={{ 
          fontFamily: 'Arial, sans-serif',
          color: '#000000', 
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {label}
        </div>
      </Html>
    </group>
  );
};

const PowerUps = () => {
  const { powerUps } = useGradius();
  
  return (
    <group>
      {powerUps.map((powerUp) => (
        <PowerUp key={powerUp.id} powerUp={powerUp} />
      ))}
    </group>
  );
};

export default PowerUps;
