import { useRef, useEffect, useState, Suspense, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { useGradius } from "@/lib/stores/useGradius";
import { PLAYER_SIZE } from "@/lib/constants";

// Preload player ship model
useGLTF.preload('/models/player_ship.glb');

const Player = () => {
  const { playerPosition, isPlayerInvulnerable, weaponLevel } = useGradius();
  const playerRef = useRef<THREE.Group>(null);
  const engineGlowRef = useRef<THREE.PointLight>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Load player ship model
  const { scene: playerModel } = useGLTF('/models/player_ship.glb') as GLTF & {
    scene: THREE.Group
  };
  
  // Update model loaded state
  useEffect(() => {
    if (playerModel) {
      setModelLoaded(true);
      console.log("Player ship model loaded successfully");
    }
  }, [playerModel]);
  
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
    
    // Add slight rotation based on movement for visual effect
    if (playerRef.current && modelLoaded) {
      // Add a small tilt when moving horizontally and vertically
      const tiltFactor = 0.1;
      
      // Reset rotation to avoid accumulation
      playerRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05;
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
      scale={[PLAYER_SIZE * 2.5, PLAYER_SIZE * 2.5, PLAYER_SIZE * 2.5]}
      rotation={[0, 0, 0]}
    >
      {/* 3Dモデルの宇宙船 */}
      {modelLoaded ? (
        <Suspense fallback={
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.3, 0.1]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        }>
          <primitive object={playerModel.clone()} castShadow receiveShadow />
        </Suspense>
      ) : (
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.3, 0.1]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      )}
      
      {/* エンジン光エフェクト */}
      <pointLight 
        ref={engineGlowRef}
        position={[-0.5, 0, 0]} 
        intensity={1.5} 
        distance={2} 
        color="#00FFFF"
      />
      
      {/* 武器レベルインジケーター - モデルの上に表示 */}
      <group position={[0, 0.5, 0]}>
        <mesh>
          <boxGeometry args={[0.3, 0.1, 0.05]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[0.2, 0.1, 0.01]} />
          <meshBasicMaterial color={weaponLevelColor} />
        </mesh>
      </group>
    </group>
  );
};

export default Player;
