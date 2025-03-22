import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGradius } from "@/lib/stores/useGradius";

// 爆発パーティクル用の型
type Explosion = {
  id: string;
  position: [number, number];
  particles: {
    position: [number, number, number];
    velocity: [number, number, number];
    size: number;
    color: string;
    life: number;
    maxLife: number;
  }[];
  life: number;
  maxLife: number;
  type: 'small' | 'medium' | 'large' | 'boss';
};

const ParticleEffects = () => {
  // Reference for background particle system
  const particlesRef = useRef<THREE.Points>(null);
  
  // Create particles geometry
  const particleCount = 100;
  
  // 爆発パーティクルの状態
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  
  // ゲーム状態から必要なデータを取得
  const { 
    enemies, 
    bossHealth, 
    bossActive,
    bossPosition
  } = useGradius();
  
  // 前のフレームの敵の状態を保存
  const prevEnemiesRef = useRef<typeof enemies>([]);
  const prevBossHealthRef = useRef<number>(bossHealth);
  
  // Particle attributes for background stars
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 5;
      
      // Random particle speed
      const vx = -Math.random() * 0.02 - 0.01;
      const vy = (Math.random() - 0.5) * 0.01;
      
      // Random size
      const size = Math.random() * 0.1 + 0.05;
      
      // Random particle color
      const colors = [0x3366ff, 0x00aaff, 0x66ccff];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Random lifetime
      const lifetime = Math.random() * 100 + 100;
      
      temp.push({
        position: [x, y, z],
        velocity: [vx, vy, 0],
        size,
        color,
        lifetime,
        age: Math.random() * lifetime // Start at random age
      });
    }
    return temp;
  }, []);
  
  // Create buffer geometry and point cloud for background particles
  const [positions, sizes, colors] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const particle = particles[i];
      
      positions[i3] = particle.position[0];
      positions[i3 + 1] = particle.position[1];
      positions[i3 + 2] = particle.position[2];
      
      sizes[i] = particle.size;
      
      const color = new THREE.Color(particle.color);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }
    
    return [positions, sizes, colors];
  }, [particles]);
  
  // 爆発を作成する関数
  const createExplosion = (position: [number, number], type: 'small' | 'medium' | 'large' | 'boss') => {
    const id = `explosion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // パーティクル数とサイズを敵のタイプに基づいて決定
    let particleCount = 0;
    let maxLife = 0;
    
    switch (type) {
      case 'small':
        particleCount = 15;
        maxLife = 30;
        break;
      case 'medium':
        particleCount = 25;
        maxLife = 35;
        break;
      case 'large':
        particleCount = 35;
        maxLife = 40;
        break;
      case 'boss':
        particleCount = 80;
        maxLife = 60;
        break;
    }
    
    // グラディウス/R-Type風の爆発色
    const colors = [
      '#FF4500', // 赤橙
      '#FFA500', // オレンジ
      '#FFFF00', // 黄
      '#FFFFFF', // 白
    ];
    
    // パーティクルを生成
    const particles = Array.from({ length: particleCount }).map(() => {
      // ランダム方向
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.15 + 0.05;
      const x = Math.cos(angle) * speed;
      const y = Math.sin(angle) * speed;
      
      return {
        position: [0, 0, 0] as [number, number, number],
        velocity: [x, y, 0] as [number, number, number],
        size: Math.random() * 0.15 + 0.05,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: Math.random() * 10 + maxLife - 10,
        maxLife: maxLife
      };
    });
    
    return {
      id,
      position,
      particles,
      life: maxLife,
      maxLife,
      type,
    };
  };
  
  // 敵の破壊を検出して爆発を作成
  useEffect(() => {
    if (prevEnemiesRef.current.length > 0 && enemies.length < prevEnemiesRef.current.length) {
      // 現在存在しない敵を見つける（破壊された敵）
      const destroyedEnemies = prevEnemiesRef.current.filter(
        prevEnemy => !enemies.some(enemy => enemy.id === prevEnemy.id)
      );
      
      // 各破壊された敵に対して爆発を作成
      destroyedEnemies.forEach(enemy => {
        // 敵のタイプに基づいて爆発タイプを決定
        let explosionType: 'small' | 'medium' | 'large' = 'small';
        
        if (enemy.type === 'medium') {
          explosionType = 'medium';
        } else if (enemy.type === 'large') {
          explosionType = 'large';
        }
        
        setExplosions(prev => [
          ...prev,
          createExplosion([enemy.position[0], enemy.position[1]], explosionType)
        ]);
      });
    }
    
    // ボスのダメージを検出
    if (bossActive && prevBossHealthRef.current > bossHealth) {
      // ダメージ量に応じた小さい爆発を作成
      const damage = prevBossHealthRef.current - bossHealth;
      
      // ダメージを受けた場所（ボス位置からランダムなオフセット）を計算
      for (let i = 0; i < damage; i++) {
        const xOffset = (Math.random() - 0.5) * 2;
        const yOffset = (Math.random() - 0.5) * 2;
        
        setExplosions(prev => [
          ...prev,
          createExplosion(
            [bossPosition[0] + xOffset, bossPosition[1] + yOffset],
            'small'
          )
        ]);
      }
      
      // ボスが倒されたら大爆発を作成
      if (bossHealth <= 0 && prevBossHealthRef.current > 0) {
        // 複数の爆発を異なる位置に作成
        for (let i = 0; i < 5; i++) {
          const xOffset = (Math.random() - 0.5) * 3;
          const yOffset = (Math.random() - 0.5) * 3;
          
          setTimeout(() => {
            setExplosions(prev => [
              ...prev,
              createExplosion(
                [bossPosition[0] + xOffset, bossPosition[1] + yOffset],
                'boss'
              )
            ]);
          }, i * 150); // 連続爆発のタイミングをずらす
        }
      }
    }
    
    // 前フレームの状態を更新
    prevEnemiesRef.current = [...enemies];
    prevBossHealthRef.current = bossHealth;
  }, [enemies, bossHealth, bossActive, bossPosition]);
  
  // Update particles
  useFrame(() => {
    // 背景パーティクルの更新
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const sizes = particlesRef.current.geometry.attributes.size.array as Float32Array;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const particle = particles[i];
        
        // Update particle age
        particle.age += 1;
        
        // Reset particle if it's beyond its lifetime or out of bounds
        if (particle.age >= particle.lifetime || positions[i3] < -12) {
          positions[i3] = 12 + Math.random() * 2; // Respawn on the right
          positions[i3 + 1] = (Math.random() - 0.5) * 10;
          positions[i3 + 2] = (Math.random() - 0.5) * 5;
          
          particle.age = 0;
        } else {
          // Update position based on velocity
          positions[i3] += particle.velocity[0];
          positions[i3 + 1] += particle.velocity[1];
          positions[i3 + 2] += particle.velocity[2];
        }
        
        // Fade out particle as it ages
        const fadeRatio = 1 - particle.age / particle.lifetime;
        sizes[i] = particle.size * fadeRatio;
      }
      
      // Update buffer attributes
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.geometry.attributes.size.needsUpdate = true;
    }
    
    // 爆発パーティクルを更新
    setExplosions(prevExplosions => {
      return prevExplosions
        .map(explosion => {
          // ライフタイムを減少
          const updatedLife = explosion.life - 1;
          
          // パーティクルを更新
          const updatedParticles = explosion.particles.map(particle => {
            // 位置を更新
            const newPosition: [number, number, number] = [
              particle.position[0] + particle.velocity[0],
              particle.position[1] + particle.velocity[1],
              particle.position[2] + particle.velocity[2],
            ];
            
            // ライフを減少
            const newLife = particle.life - 1;
            
            // パーティクルの速度を緩やかに減少
            const drag = 0.98;
            const newVelocity: [number, number, number] = [
              particle.velocity[0] * drag,
              particle.velocity[1] * drag,
              particle.velocity[2] * drag,
            ];
            
            return {
              ...particle,
              position: newPosition,
              velocity: newVelocity,
              life: newLife,
            };
          });
          
          return {
            ...explosion,
            particles: updatedParticles,
            life: updatedLife,
          };
        })
        .filter(explosion => explosion.life > 0);
    });
  });
  
  return (
    <group>
      {/* Background particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={particleCount}
            array={sizes}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleCount}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          sizeAttenuation={true}
          vertexColors
          transparent
          alphaTest={0.01}
          depthWrite={false}
        />
      </points>
      
      {/* 各爆発のグループ */}
      {explosions.map(explosion => (
        <group 
          key={explosion.id} 
          position={[explosion.position[0], explosion.position[1], 0.1]}
        >
          {/* R-Type/グラディウス風の中央の爆発球 */}
          <mesh scale={[
            (explosion.life / explosion.maxLife) * 0.8 + 0.2,
            (explosion.life / explosion.maxLife) * 0.8 + 0.2,
            (explosion.life / explosion.maxLife) * 0.8 + 0.2
          ]}>
            <sphereGeometry args={[
              explosion.type === 'boss' ? 1.2 : 
              explosion.type === 'large' ? 0.6 : 
              explosion.type === 'medium' ? 0.4 : 0.25
            ]} />
            <meshBasicMaterial 
              color="#FFFFFF" 
              transparent
              opacity={(explosion.life / explosion.maxLife) * 0.8}
            />
          </mesh>
          
          {/* 各パーティクル */}
          {explosion.particles.map((particle, index) => (
            <mesh 
              key={`${explosion.id}_${index}`} 
              position={[
                particle.position[0], 
                particle.position[1], 
                particle.position[2]
              ]}
            >
              <planeGeometry args={[
                particle.size * (particle.life / particle.maxLife) + 0.05,
                particle.size * (particle.life / particle.maxLife) + 0.05
              ]} />
              <meshBasicMaterial 
                color={particle.color} 
                transparent
                opacity={(particle.life / particle.maxLife) * 0.9}
              />
            </mesh>
          ))}
          
          {/* 爆発の輪 - グラディウス風 */}
          <mesh scale={[
            (1 - explosion.life / explosion.maxLife) * 2 + 0.2,
            (1 - explosion.life / explosion.maxLife) * 2 + 0.2,
            1
          ]}>
            <ringGeometry args={[
              explosion.type === 'boss' ? 0.8 : 
              explosion.type === 'large' ? 0.4 : 
              explosion.type === 'medium' ? 0.3 : 0.2,
              explosion.type === 'boss' ? 1.0 : 
              explosion.type === 'large' ? 0.5 : 
              explosion.type === 'medium' ? 0.38 : 0.25,
              16
            ]} />
            <meshBasicMaterial 
              color="#FF4500" 
              transparent
              opacity={(explosion.life / explosion.maxLife) * 0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default ParticleEffects;
