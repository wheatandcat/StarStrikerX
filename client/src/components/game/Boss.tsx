import { useRef, useState, useEffect, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { useGradius } from "@/lib/stores/useGradius";
import { BossAttackPattern, EnemyType } from "@/lib/types";
import { 
  BOSS_ENTRY_POSITION, 
  BOSS_BATTLE_POSITION, 
  BOSS_MOVEMENT_RANGE,
  BOSS_MOVEMENT_SPEED,
  BOSS_SHOOT_RATE,
  BOSS_PHASE_THRESHOLD
} from "@/lib/constants";

// Preload the boss model
useGLTF.preload('/models/enemy_boss.glb');

const Boss = () => {
  const { 
    bossHealth, 
    bossPosition, 
    moveBoss, 
    spawnEnemy, 
    bullets,
    playerPosition
  } = useGradius();
  
  const meshRef = useRef<THREE.Group>(null);
  const gunRef1 = useRef<THREE.Group>(null);
  const gunRef2 = useRef<THREE.Group>(null);
  const core1Ref = useRef<THREE.Mesh>(null);
  const core2Ref = useRef<THREE.Mesh>(null);
  
  // Load boss model
  const { scene: bossModel } = useGLTF('/models/enemy_boss.glb') as GLTF & {
    scene: THREE.Group
  };
  
  // Track if model loaded
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Update model loaded state
  useEffect(() => {
    if (bossModel) {
      setModelLoaded(true);
      console.log("Boss model loaded successfully");
    }
  }, [bossModel]);
  
  const [isEntering, setIsEntering] = useState(true);
  const [currentAttackPattern, setCurrentAttackPattern] = useState<BossAttackPattern>(BossAttackPattern.Straight);
  const [lastShootTime, setLastShootTime] = useState(0);
  
  // Track the boss's original max health for phase changes
  const [maxHealth, setMaxHealth] = useState(100);
  
  // Initialize maxHealth on first render
  useEffect(() => {
    setMaxHealth(bossHealth);
  }, []);
  
  // Change attack pattern based on health
  useEffect(() => {
    // Calculate health percentage
    const healthPercent = bossHealth / maxHealth;
    
    // Change attack pattern based on health
    if (healthPercent <= BOSS_PHASE_THRESHOLD) {
      // Boss is enraged at low health
      const patterns = [BossAttackPattern.Spread, BossAttackPattern.Circular, BossAttackPattern.Aimed];
      const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
      
      if (randomPattern !== currentAttackPattern) {
        setCurrentAttackPattern(randomPattern);
        console.log(`Boss changing to attack pattern: ${randomPattern}`);
      }
    } else {
      // Boss uses simpler patterns at high health
      const patterns = [BossAttackPattern.Straight, BossAttackPattern.Spread];
      const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
      
      if (randomPattern !== currentAttackPattern) {
        setCurrentAttackPattern(randomPattern);
        console.log(`Boss changing to attack pattern: ${randomPattern}`);
      }
    }
  }, [bossHealth, maxHealth, currentAttackPattern]);
  
  useFrame(({ clock }) => {
    if (!meshRef.current || !core1Ref.current || !core2Ref.current) return;
    
    const time = clock.getElapsedTime();
    
    // Update boss position
    if (isEntering) {
      // Boss is entering the screen from the right
      const startX = BOSS_ENTRY_POSITION[0];
      const targetX = BOSS_BATTLE_POSITION[0];
      
      // Move boss towards the battle position
      const newX = bossPosition[0] - 0.05;
      
      if (newX <= targetX) {
        // Boss has reached battle position
        setIsEntering(false);
      } else {
        // Update boss position in store
        moveBoss(newX, bossPosition[1]);
        meshRef.current.position.x = newX;
        meshRef.current.position.y = bossPosition[1];
      }
    } else {
      // Boss is in battle position, move in a sinusoidal pattern
      const newX = BOSS_BATTLE_POSITION[0];
      const newY = Math.sin(time * 0.5) * BOSS_MOVEMENT_RANGE;
      
      // Update boss position in store
      moveBoss(newX, newY);
      meshRef.current.position.x = newX;
      meshRef.current.position.y = newY;
      
      // Shoot bullets based on the current pattern and time interval
      if (time - lastShootTime > BOSS_SHOOT_RATE / 1000) {
        shootBullets();
        setLastShootTime(time);
      }
    }
    
    // Visual effects based on boss health
    const healthPercent = bossHealth / maxHealth;
    
    // Core pulsing effect
    const pulseSpeed = 2 + (1 - healthPercent) * 3; // Pulse faster at low health
    const pulseIntensity = 0.5 + (1 - healthPercent) * 0.5;
    
    const corePulse = Math.sin(time * pulseSpeed) * pulseIntensity + 1;
    core1Ref.current.scale.set(corePulse, corePulse, corePulse);
    
    // Second core pulses slightly out of phase
    const core2Pulse = Math.sin(time * pulseSpeed + 1) * pulseIntensity + 1;
    core2Ref.current.scale.set(core2Pulse, core2Pulse, core2Pulse);
    
    // Rotate the whole boss slightly
    meshRef.current.rotation.z = Math.sin(time * 0.3) * 0.05;
    
    // Gun rotation targeting player
    if (gunRef1.current && gunRef2.current) {
      const [playerX, playerY] = playerPosition;
      const targetAngle = Math.atan2(playerY - meshRef.current.position.y, playerX - meshRef.current.position.x);
      
      // Apply rotation to guns with limits
      gunRef1.current.rotation.z = targetAngle;
      gunRef2.current.rotation.z = targetAngle;
    }
  });
  
  // Function to shoot bullets in different patterns
  const shootBullets = () => {
    const bossX = meshRef.current?.position.x || bossPosition[0];
    const bossY = meshRef.current?.position.y || bossPosition[1];
    
    switch (currentAttackPattern) {
      case BossAttackPattern.Straight:
        // Shoot straight bullets
        const bullet = {
          id: `boss_bullet_${Date.now()}_${Math.random()}`,
          position: [bossX - 1, bossY] as [number, number],
          direction: [-1, 0] as [number, number],
          isPlayerBullet: false
        };
        
        useGradius.getState().bullets.push(bullet);
        break;
        
      case BossAttackPattern.Spread:
        // Shoot in a spread pattern
        for (let i = -2; i <= 2; i++) {
          const bullet = {
            id: `boss_bullet_${Date.now()}_${Math.random()}`,
            position: [bossX - 1, bossY] as [number, number],
            direction: [-1, i * 0.2] as [number, number],
            isPlayerBullet: false
          };
          
          useGradius.getState().bullets.push(bullet);
        }
        break;
        
      case BossAttackPattern.Aimed:
        // Shoot aimed at player
        const [playerX, playerY] = playerPosition;
        const angle = Math.atan2(playerY - bossY, playerX - bossX);
        
        const bullet3 = {
          id: `boss_bullet_${Date.now()}_${Math.random()}`,
          position: [bossX - 1, bossY] as [number, number],
          direction: [Math.cos(angle), Math.sin(angle)] as [number, number],
          isPlayerBullet: false
        };
        
        useGradius.getState().bullets.push(bullet3);
        break;
        
      case BossAttackPattern.Circular:
        // Shoot in a circular pattern
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          
          const bullet = {
            id: `boss_bullet_${Date.now()}_${Math.random()}`,
            position: [bossX, bossY] as [number, number],
            direction: [Math.cos(angle), Math.sin(angle)] as [number, number],
            isPlayerBullet: false
          };
          
          useGradius.getState().bullets.push(bullet);
        }
        break;
    }
  };
  
  // Calculate health percentage for visual effects
  const healthPercent = bossHealth / maxHealth;
  const damageColor = new THREE.Color().setHSL(
    healthPercent * 0.3, // Hue shifts from red to orange as health decreases
    0.8,                 // High saturation
    0.4 + healthPercent * 0.2 // Brightness
  );
  
  return (
    <group 
      ref={meshRef} 
      position={[bossPosition[0], bossPosition[1], 0]}
      scale={[3, 3, 3]} // スケールアップ
      rotation={[0, Math.PI, 0]} // ボスが左向きになるよう回転
    >
      {/* 3Dモデルのボス */}
      {modelLoaded ? (
        <Suspense fallback={
          <mesh castShadow>
            <boxGeometry args={[1.5, 1.2, 0.3]} />
            <meshStandardMaterial 
              color={damageColor} 
              metalness={0.7}
              roughness={0.2}
              emissive={damageColor}
              emissiveIntensity={0.3}
            />
          </mesh>
        }>
          <primitive object={bossModel.clone()} castShadow receiveShadow />
        </Suspense>
      ) : (
        // フォールバック
        <group>
          {/* 中央ボディ - メタリック */}
          <mesh castShadow>
            <boxGeometry args={[1.5, 1.2, 0.3]} />
            <meshStandardMaterial 
              color={damageColor} 
              metalness={0.7}
              roughness={0.2}
              emissive={damageColor}
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      )}
      
      {/* コア1 - 赤 (左上) - エフェクトのみ残す */}
      <mesh ref={core1Ref} position={[0.3, 0.4, 0.3]} visible={false}>
        <boxGeometry args={[0.4, 0.4, 0.2]} />
        <meshStandardMaterial 
          color="#FF0000"
          emissive="#FF0000"
          emissiveIntensity={0.8}
        />
        <pointLight color="#FF3333" intensity={1} distance={3} />
      </mesh>
      
      {/* コア2 - 青 (右下) - エフェクトのみ残す */}
      <mesh ref={core2Ref} position={[0.3, -0.4, 0.3]} visible={false}>
        <boxGeometry args={[0.4, 0.4, 0.2]} />
        <meshStandardMaterial 
          color="#0088FF"
          emissive="#0088FF"
          emissiveIntensity={0.8}
        />
        <pointLight color="#3399FF" intensity={1} distance={3} />
      </mesh>
      
      {/* 全体のライトエフェクト - ダメージに応じた色 */}
      <pointLight 
        position={[0, 0, 0.5]} 
        color={damageColor} 
        intensity={1 + (1 - healthPercent) * 2} 
        distance={5}
      />
      
      {/* Health bar */}
      <group position={[0, 1.8, 0]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2, 0.15, 0.05]} />
          <meshBasicMaterial color={0x333333} />
        </mesh>
        <mesh 
          position={[(healthPercent - 1) * 1, 0, 0.05]}
          scale={[healthPercent, 1, 1]}
        >
          <boxGeometry args={[2, 0.15, 0.05]} />
          <meshBasicMaterial color={damageColor} />
        </mesh>
      </group>
    </group>
  );
};

export default Boss;
