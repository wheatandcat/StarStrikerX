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
      {/* SFC風のカプセル型パワーアップ */}
      <group>
        {/* 背景のカプセル - 六角形 */}
        <mesh ref={meshRef}>
          <shapeGeometry args={[new THREE.Shape()
            .moveTo(POWERUP_SIZE * 0.3, 0) // 右
            .lineTo(POWERUP_SIZE * 0.15, POWERUP_SIZE * 0.3) // 右上
            .lineTo(-POWERUP_SIZE * 0.15, POWERUP_SIZE * 0.3) // 左上
            .lineTo(-POWERUP_SIZE * 0.3, 0) // 左
            .lineTo(-POWERUP_SIZE * 0.15, -POWERUP_SIZE * 0.3) // 左下
            .lineTo(POWERUP_SIZE * 0.15, -POWERUP_SIZE * 0.3) // 右下
            .lineTo(POWERUP_SIZE * 0.3, 0) // 右に戻る
          ]} />
          <meshBasicMaterial color={color} />
        </mesh>
        
        {/* 内側の装飾 - 内部の六角形 */}
        <mesh position={[0, 0, 0.01]}>
          <shapeGeometry args={[new THREE.Shape()
            .moveTo(POWERUP_SIZE * 0.2, 0) // 右
            .lineTo(POWERUP_SIZE * 0.1, POWERUP_SIZE * 0.2) // 右上
            .lineTo(-POWERUP_SIZE * 0.1, POWERUP_SIZE * 0.2) // 左上
            .lineTo(-POWERUP_SIZE * 0.2, 0) // 左
            .lineTo(-POWERUP_SIZE * 0.1, -POWERUP_SIZE * 0.2) // 左下
            .lineTo(POWERUP_SIZE * 0.1, -POWERUP_SIZE * 0.2) // 右下
            .lineTo(POWERUP_SIZE * 0.2, 0) // 右に戻る
          ]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        
        {/* 上部の光沢エフェクト */}
        <mesh position={[0, POWERUP_SIZE * 0.1, 0.02]}>
          <planeGeometry args={[POWERUP_SIZE * 0.3, POWERUP_SIZE * 0.05]} />
          <meshBasicMaterial 
            color="#FFFFFF"
            transparent={true}
            opacity={0.7}
          />
        </mesh>
        
        {/* 下部の光沢エフェクト */}
        <mesh position={[0, -POWERUP_SIZE * 0.1, 0.02]}>
          <planeGeometry args={[POWERUP_SIZE * 0.3, POWERUP_SIZE * 0.05]} />
          <meshBasicMaterial 
            color="#000000"
            transparent={true}
            opacity={0.3}
          />
        </mesh>
        
        {/* 武器アップグレードシンボル - "W"の代わりにレトロな装飾 */}
        <group position={[0, 0, 0.03]}>
          {/* 横線 - 上 */}
          <mesh position={[0, POWERUP_SIZE * 0.08, 0]}>
            <planeGeometry args={[POWERUP_SIZE * 0.25, POWERUP_SIZE * 0.06]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          
          {/* 横線 - 下 */}
          <mesh position={[0, -POWERUP_SIZE * 0.08, 0]}>
            <planeGeometry args={[POWERUP_SIZE * 0.25, POWERUP_SIZE * 0.06]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          
          {/* 縦線 - 左 */}
          <mesh position={[-POWERUP_SIZE * 0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <planeGeometry args={[POWERUP_SIZE * 0.2, POWERUP_SIZE * 0.06]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          
          {/* 縦線 - 右 */}
          <mesh position={[POWERUP_SIZE * 0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <planeGeometry args={[POWERUP_SIZE * 0.2, POWERUP_SIZE * 0.06]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </group>
        
        {/* 発光エフェクト - 外周 */}
        <mesh position={[0, 0, -0.01]}>
          <ringGeometry args={[POWERUP_SIZE * 0.35, POWERUP_SIZE * 0.4, 6]} />
          <meshBasicMaterial 
            color={color}
            transparent={true}
            opacity={0.5}
          />
        </mesh>
      </group>
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
