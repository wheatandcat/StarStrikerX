import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Text } from "@react-three/drei";
import * as THREE from "three";
import { useGradius } from "@/lib/stores/useGradius";
import { PLAYER_SIZE } from "@/lib/constants";

const Player = () => {
  const { playerPosition, isPlayerInvulnerable, weaponLevel } = useGradius();
  const playerRef = useRef<THREE.Group>(null);
  const engineGlowRef = useRef<THREE.PointLight>(null);
  
  // For blinking when invulnerable
  useFrame((state) => {
    if (!playerRef.current) return;
    
    // Position the player
    playerRef.current.position.x = playerPosition[0];
    playerRef.current.position.y = playerPosition[1];
    
    // Blinking effect when invulnerable
    if (isPlayerInvulnerable) {
      const blinkRate = Math.sin(state.clock.getElapsedTime() * 10);
      playerRef.current.visible = blinkRate > 0;
    } else {
      playerRef.current.visible = true;
    }
    
    // Engine glow pulsing
    if (engineGlowRef.current) {
      const pulseIntensity = 0.8 + Math.sin(state.clock.getElapsedTime() * 8) * 0.2;
      engineGlowRef.current.intensity = pulseIntensity;
    }
  });
  
  // Weapon level indicator color
  const weaponLevelColor = useMemo(() => {
    switch (weaponLevel) {
      case 0: return "#66ccff"; // Level 1 - Blue
      case 1: return "#66ff66"; // Level 2 - Green
      case 2: return "#ffcc00"; // Level 3 - Gold
      case 3: return "#ff3333"; // Level 4 - Red
      default: return "#66ccff";
    }
  }, [weaponLevel]);
  
  return (
    <group
      ref={playerRef}
      position={[playerPosition[0], playerPosition[1], 0]}
      scale={[PLAYER_SIZE, PLAYER_SIZE, PLAYER_SIZE]}
    >
      {/* 本体中央 - メインボディ (白) */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.3, 0.1]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* 本体前部 - 先端 (赤) */}
      <mesh position={[0.35, 0, 0]}>
        <boxGeometry args={[0.1, 0.2, 0.1]} />
        <meshStandardMaterial color="#FF0000" />
      </mesh>
      
      {/* 上部翼 (白) */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.4, 0.1, 0.1]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* 下部翼 (白) */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[0.4, 0.1, 0.1]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* 翼端部 上 (赤) */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.1]} />
        <meshStandardMaterial color="#FF0000" />
      </mesh>
      
      {/* 翼端部 下 (赤) */}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.1]} />
        <meshStandardMaterial color="#FF0000" />
      </mesh>
      
      {/* コックピット (青) */}
      <mesh position={[0.15, 0, 0.1]}>
        <boxGeometry args={[0.2, 0.15, 0.05]} />
        <meshStandardMaterial color="#00AAFF" />
      </mesh>
      
      {/* エンジン部分 (グレー) */}
      <mesh position={[-0.35, 0, 0]}>
        <boxGeometry args={[0.1, 0.2, 0.1]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      {/* エンジン光 */}
      <mesh position={[-0.45, 0, 0]}>
        <boxGeometry args={[0.05, 0.15, 0.05]} />
        <meshStandardMaterial 
          color="#00FFFF" 
          emissive="#00FFFF"
          emissiveIntensity={2}
        />
      </mesh>
      
      {/* エンジン光エフェクト */}
      <pointLight 
        ref={engineGlowRef}
        position={[-0.5, 0, 0]} 
        intensity={1.5} 
        distance={2} 
        color="#00FFFF"
      />
      
      {/* 武器レベルインジケーター */}
      <group position={[0, 0.5, 0]}>
        <mesh>
          <boxGeometry args={[0.3, 0.1, 0.05]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.15}
          color={weaponLevelColor}
          anchorX="center"
          anchorY="middle"
          font="Press Start 2P"
        >
          {`L${weaponLevel + 1}`}
        </Text>
      </group>
    </group>
  );
};

export default Player;
