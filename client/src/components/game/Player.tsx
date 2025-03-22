import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Text } from "@react-three/drei";
import * as THREE from "three";
import { useGradius } from "@/lib/stores/useGradius";
import { PLAYER_SIZE } from "@/lib/constants";

const Player = () => {
  const { playerPosition, isPlayerInvulnerable, weaponLevel } = useGradius();
  const playerRef = useRef<THREE.Mesh>(null);
  const engineGlowRef = useRef<THREE.PointLight>(null);
  
  // Create a simple ship geometry
  const shipGeometry = useMemo(() => new THREE.BoxGeometry(1, 0.4, 0.2), []);
  const shipMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x3399ff,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x0066cc,
    emissiveIntensity: 0.5
  }), []);
  
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
    <group>
      {/* Main ship body */}
      <mesh 
        ref={playerRef} 
        geometry={shipGeometry} 
        material={shipMaterial}
        position={[playerPosition[0], playerPosition[1], 0]} 
        castShadow
      >
        {/* Ship nose/cockpit */}
        <mesh position={[0.4, 0, 0.1]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial 
            color={0x99ccff} 
            transparent
            opacity={0.8}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        
        {/* Wing top */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.8, 0.1, 0.05]} />
          <meshStandardMaterial color={0x2266aa} />
        </mesh>
        
        {/* Wing bottom */}
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[0.8, 0.1, 0.05]} />
          <meshStandardMaterial color={0x2266aa} />
        </mesh>
        
        {/* Engine */}
        <mesh position={[-0.5, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.2, 0.3, 6]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color={0x222222} />
        </mesh>
        
        {/* Engine glow */}
        <pointLight 
          ref={engineGlowRef}
          position={[-0.7, 0, 0]} 
          intensity={1} 
          distance={2} 
          color={0x00aaff}
        />
        
        {/* Weapon level indicator */}
        <Text
          position={[0, 0.6, 0]}
          rotation={[0, 0, 0]}
          fontSize={0.2}
          color={weaponLevelColor}
          anchorX="center"
          anchorY="middle"
        >
          {`L${weaponLevel + 1}`}
        </Text>
      </mesh>
    </group>
  );
};

export default Player;
