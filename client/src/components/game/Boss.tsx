import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGradius } from "@/lib/stores/useGradius";
import { BossAttackPattern } from "@/lib/types";
import { 
  BOSS_ENTRY_POSITION, 
  BOSS_BATTLE_POSITION, 
  BOSS_MOVEMENT_RANGE,
  BOSS_SHOOT_RATE,
  BOSS_PHASE_THRESHOLD
} from "@/lib/constants";

// レトロスタイルのボス
const Boss = () => {
  const { 
    bossHealth, 
    bossPosition, 
    moveBoss, 
    bullets,
    playerPosition
  } = useGradius();
  
  const meshRef = useRef<THREE.Group>(null);
  const gun1Ref = useRef<THREE.Group>(null);
  const gun2Ref = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  
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
    if (!meshRef.current) return;
    
    const time = clock.getElapsedTime();
    
    // Update boss position
    if (isEntering) {
      // Boss is entering the screen from the right
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
    
    // 視覚効果: ボスの体力に基づく点滅
    const healthPercent = bossHealth / maxHealth;
    
    // パーツのアニメーション
    if (coreRef.current) {
      // コアのパルス（体力が低いほど速く点滅）
      const pulseSpeed = 2 + (1 - healthPercent) * 3;
      const pulseValue = Math.sin(time * pulseSpeed) * 0.5 + 0.5;
      
      // 色を変更
      const coreMaterial = coreRef.current.material as THREE.MeshBasicMaterial;
      coreMaterial.color.setHSL(
        healthPercent * 0.3, // 健康なら赤寄り、ダメージを受けるとオレンジへ
        0.8,
        0.3 + pulseValue * 0.4 // 明るさをパルス
      );
    }
    
    // 砲台の回転（プレイヤーを狙う）
    if (gun1Ref.current && gun2Ref.current) {
      const [playerX, playerY] = playerPosition;
      const targetAngle = Math.atan2(playerY - meshRef.current.position.y, playerX - meshRef.current.position.x);
      
      // 上下の砲台を回転
      gun1Ref.current.rotation.z = targetAngle;
      gun2Ref.current.rotation.z = targetAngle;
    }
    
    // 全体を少し揺らす
    meshRef.current.rotation.z = Math.sin(time * 0.3) * 0.05;
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
  const bossColor = healthPercent > 0.7 ? "#FF0000" : 
                   healthPercent > 0.3 ? "#FF6600" : "#FF9900";
  
  return (
    <group 
      ref={meshRef} 
      position={[bossPosition[0], bossPosition[1], 0]}
      scale={[2, 2, 1]} // 適切なスケール
      rotation={[0, 0, 0]} 
    >
      {/* R-Type/グラディウス/ダライアス風のメカニカルボス */}
      <group>
        {/* メインボディ - 機械的な六角形に近い複雑形状 */}
        <mesh>
          <shapeGeometry args={[new THREE.Shape()
            .moveTo(0.7, 0) // 前部先端
            .lineTo(0.6, 0.3) // 上部前方
            .lineTo(0.3, 0.5) // 上部中央
            .lineTo(-0.4, 0.6) // 上部後方
            .lineTo(-0.8, 0.3) // 後部上
            .lineTo(-0.9, 0) // 後部
            .lineTo(-0.8, -0.3) // 後部下
            .lineTo(-0.4, -0.6) // 下部後方
            .lineTo(0.3, -0.5) // 下部中央
            .lineTo(0.6, -0.3) // 下部前方
            .lineTo(0.7, 0) // 前部先端に戻る
          ]} />
          <meshBasicMaterial color="#546E7A" />
        </mesh>

        {/* R-Type風の前部装甲 - 金属的な仕上げ */}
        <mesh position={[0.45, 0, 0.01]}>
          <shapeGeometry args={[new THREE.Shape()
            .moveTo(0.3, 0) // 前部先端
            .lineTo(0.2, 0.2) // 上部前方
            .lineTo(0.0, 0.25) // 上部中央
            .lineTo(-0.3, 0.2) // 上部後方
            .lineTo(-0.4, 0) // 中央後方
            .lineTo(-0.3, -0.2) // 下部後方
            .lineTo(0.0, -0.25) // 下部中央
            .lineTo(0.2, -0.2) // 下部前方
            .lineTo(0.3, 0) // 前部先端に戻る
          ]} />
          <meshBasicMaterial color="#37474F" />
        </mesh>
        
        {/* ダライアス風のセグメント分割ボディ */}
        <mesh position={[-0.1, 0, 0.01]}>
          <shapeGeometry args={[new THREE.Shape()
            .moveTo(0.4, 0) // 前部
            .lineTo(0.3, 0.3) // 上部前方
            .lineTo(-0.4, 0.3) // 上部後方
            .lineTo(-0.6, 0) // 後部
            .lineTo(-0.4, -0.3) // 下部後方
            .lineTo(0.3, -0.3) // 下部前方
            .lineTo(0.4, 0) // 前部に戻る
          ]} />
          <meshBasicMaterial color="#455A64" />
        </mesh>
        
        {/* R-Type風の上部サブウェポンモジュール */}
        <group position={[0.1, 0.5, 0.02]}>
          {/* モジュールベース */}
          <mesh>
            <boxGeometry args={[0.7, 0.2, 0.04]} />
            <meshBasicMaterial color="#263238" />
          </mesh>
          
          {/* モジュール側面装甲 */}
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[0.6, 0.1, 0.06]} />
            <meshBasicMaterial color="#37474F" />
          </mesh>
          
          {/* センサー/武器ポート */}
          <mesh position={[0.3, 0, 0.05]}>
            <circleGeometry args={[0.06, 6]} />
            <meshBasicMaterial color="#B71C1C" />
          </mesh>
          
          {/* センサー発光エフェクト */}
          <mesh position={[0.3, 0, 0.06]}>
            <circleGeometry args={[0.03, 6]} />
            <meshBasicMaterial 
              color="#FF5252" 
              transparent={true}
              opacity={Math.abs(Math.sin(Date.now() * 0.005)) * 0.5 + 0.5}
            />
          </mesh>
        </group>
        
        {/* R-Type風の下部サブウェポンモジュール */}
        <group position={[0.1, -0.5, 0.02]}>
          {/* モジュールベース */}
          <mesh>
            <boxGeometry args={[0.7, 0.2, 0.04]} />
            <meshBasicMaterial color="#263238" />
          </mesh>
          
          {/* モジュール側面装甲 */}
          <mesh position={[0, -0.15, 0]}>
            <boxGeometry args={[0.6, 0.1, 0.06]} />
            <meshBasicMaterial color="#37474F" />
          </mesh>
          
          {/* センサー/武器ポート */}
          <mesh position={[0.3, 0, 0.05]}>
            <circleGeometry args={[0.06, 6]} />
            <meshBasicMaterial color="#B71C1C" />
          </mesh>
          
          {/* センサー発光エフェクト */}
          <mesh position={[0.3, 0, 0.06]}>
            <circleGeometry args={[0.03, 6]} />
            <meshBasicMaterial 
              color="#FF5252" 
              transparent={true}
              opacity={Math.abs(Math.sin(Date.now() * 0.005 + 1.5)) * 0.5 + 0.5}
            />
          </mesh>
        </group>
        
        {/* グラディウス/R-Type風の中央コアシステム */}
        <group position={[0, 0, 0.03]}>
          {/* コアの外殻 - 六角形 */}
          <mesh>
            <circleGeometry args={[0.4, 6]} />
            <meshBasicMaterial color="#B71C1C" />
          </mesh>
          
          {/* 内側のコア - 点滅エフェクト */}
          <mesh ref={coreRef}>
            <circleGeometry args={[0.3, 6]} />
            <meshBasicMaterial color="#FF1744" />
          </mesh>
          
          {/* 内部の発光システム */}
          <mesh position={[0, 0, 0.01]}>
            <circleGeometry args={[0.2, 6]} />
            <meshBasicMaterial 
              color="#FFEB3B" 
              transparent={true}
              opacity={Math.abs(Math.sin(Date.now() * 0.002)) * 0.5 + 0.5}
            />
          </mesh>
          
          {/* バイオメカニカルなコアディテール - 横線 */}
          <mesh position={[0, 0, 0.01]} rotation={[0, 0, Math.PI/6]}>
            <boxGeometry args={[0.65, 0.03, 0.01]} />
            <meshBasicMaterial color="#000000" transparent={true} opacity={0.6} />
          </mesh>
          
          {/* バイオメカニカルなコアディテール - 縦線 */}
          <mesh position={[0, 0, 0.01]} rotation={[0, 0, Math.PI/6 + Math.PI/2]}>
            <boxGeometry args={[0.65, 0.03, 0.01]} />
            <meshBasicMaterial color="#000000" transparent={true} opacity={0.6} />
          </mesh>
          
          {/* 保護リングの外殻 */}
          <mesh>
            <ringGeometry args={[0.42, 0.45, 6]} />
            <meshBasicMaterial color="#263238" />
          </mesh>
        </group>
        
        {/* グラディウス風の上部メイン砲台 */}
        <group position={[-0.2, 0.6, 0.03]} ref={gun1Ref}>
          {/* 砲台のベース部分 - 六角形 */}
          <mesh>
            <circleGeometry args={[0.15, 6]} />
            <meshBasicMaterial color="#37474F" />
          </mesh>
          
          {/* 砲身 - 機械的な形状 */}
          <mesh position={[0.3, 0, 0]}>
            <boxGeometry args={[0.5, 0.12, 0.06]} />
            <meshBasicMaterial color="#263238" />
          </mesh>
          
          {/* 砲身のディテール - 上部 */}
          <mesh position={[0.3, 0.08, 0.04]}>
            <boxGeometry args={[0.48, 0.02, 0.01]} />
            <meshBasicMaterial color="#546E7A" />
          </mesh>
          
          {/* 砲身のディテール - 下部 */}
          <mesh position={[0.3, -0.08, 0.04]}>
            <boxGeometry args={[0.48, 0.02, 0.01]} />
            <meshBasicMaterial color="#546E7A" />
          </mesh>
          
          {/* 砲口の発光部分 */}
          <mesh position={[0.55, 0, 0.04]}>
            <circleGeometry args={[0.05, 6]} />
            <meshBasicMaterial 
              color="#F44336" 
              transparent={true}
              opacity={Math.abs(Math.sin(Date.now() * 0.01)) * 0.5 + 0.5}
            />
          </mesh>
        </group>
        
        {/* グラディウス風の下部メイン砲台 */}
        <group position={[-0.2, -0.6, 0.03]} ref={gun2Ref}>
          {/* 砲台のベース部分 - 六角形 */}
          <mesh>
            <circleGeometry args={[0.15, 6]} />
            <meshBasicMaterial color="#37474F" />
          </mesh>
          
          {/* 砲身 - 機械的な形状 */}
          <mesh position={[0.3, 0, 0]}>
            <boxGeometry args={[0.5, 0.12, 0.06]} />
            <meshBasicMaterial color="#263238" />
          </mesh>
          
          {/* 砲身のディテール - 上部 */}
          <mesh position={[0.3, 0.08, 0.04]}>
            <boxGeometry args={[0.48, 0.02, 0.01]} />
            <meshBasicMaterial color="#546E7A" />
          </mesh>
          
          {/* 砲身のディテール - 下部 */}
          <mesh position={[0.3, -0.08, 0.04]}>
            <boxGeometry args={[0.48, 0.02, 0.01]} />
            <meshBasicMaterial color="#546E7A" />
          </mesh>
          
          {/* 砲口の発光部分 */}
          <mesh position={[0.55, 0, 0.04]}>
            <circleGeometry args={[0.05, 6]} />
            <meshBasicMaterial 
              color="#F44336" 
              transparent={true}
              opacity={Math.abs(Math.sin(Date.now() * 0.01 + 1.5)) * 0.5 + 0.5}
            />
          </mesh>
        </group>
        
        {/* ダライアス風のエンジンスラスター - 3基 */}
        <group position={[-0.85, 0, 0.01]}>
          {/* 中央スラスター */}
          <mesh>
            <shapeGeometry args={[new THREE.Shape()
              .moveTo(0, 0) // エンジン接続部
              .lineTo(-0.12, 0.2) // 上部
              .lineTo(-0.2, 0) // 後部
              .lineTo(-0.12, -0.2) // 下部
              .lineTo(0, 0) // エンジン接続部に戻る
            ]} />
            <meshBasicMaterial 
              color="#FF9800" 
              transparent={true}
              opacity={Math.abs(Math.sin(Date.now() * 0.015)) * 0.3 + 0.7}
            />
          </mesh>
          
          {/* 中央スラスター内部 */}
          <mesh position={[-0.1, 0, 0.01]}>
            <shapeGeometry args={[new THREE.Shape()
              .moveTo(0, 0) // エンジン内部
              .lineTo(-0.06, 0.1) // 上部
              .lineTo(-0.1, 0) // 後部
              .lineTo(-0.06, -0.1) // 下部
              .lineTo(0, 0) // エンジン内部に戻る
            ]} />
            <meshBasicMaterial 
              color="#FFEB3B" 
              transparent={true}
              opacity={Math.abs(Math.sin(Date.now() * 0.015)) * 0.2 + 0.8}
            />
          </mesh>
          
          {/* 上部スラスター */}
          <mesh position={[0, 0.3, 0]}>
            <shapeGeometry args={[new THREE.Shape()
              .moveTo(0, 0) // エンジン接続部
              .lineTo(-0.1, 0.1) // 上部
              .lineTo(-0.15, 0) // 後部
              .lineTo(-0.1, -0.1) // 下部
              .lineTo(0, 0) // エンジン接続部に戻る
            ]} />
            <meshBasicMaterial 
              color="#FF9800" 
              transparent={true}
              opacity={Math.abs(Math.sin(Date.now() * 0.01 + 0.5)) * 0.3 + 0.7}
            />
          </mesh>
          
          {/* 下部スラスター */}
          <mesh position={[0, -0.3, 0]}>
            <shapeGeometry args={[new THREE.Shape()
              .moveTo(0, 0) // エンジン接続部
              .lineTo(-0.1, 0.1) // 上部
              .lineTo(-0.15, 0) // 後部
              .lineTo(-0.1, -0.1) // 下部
              .lineTo(0, 0) // エンジン接続部に戻る
            ]} />
            <meshBasicMaterial 
              color="#FF9800" 
              transparent={true}
              opacity={Math.abs(Math.sin(Date.now() * 0.01 + 1.0)) * 0.3 + 0.7}
            />
          </mesh>
        </group>
        
        {/* メカニカルなディテール - 水平ライン */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[1.6, 0.03]} />
          <meshBasicMaterial color="#263238" />
        </mesh>
        
        {/* メカニカルなディテール - R-Type風の小型センサーアレイ */}
        <group>
          {Array.from({ length: 4 }).map((_, i) => (
            <mesh 
              key={i} 
              position={[
                -0.6 + i * 0.3, 
                i % 2 === 0 ? 0.15 : -0.15, 
                0.04
              ]}
            >
              <circleGeometry args={[0.04, 6]} />
              <meshBasicMaterial 
                color="#4FC3F7" 
                transparent={true}
                opacity={Math.abs(Math.sin(Date.now() * 0.01 + i * 0.5)) * 0.5 + 0.5}
              />
            </mesh>
          ))}
        </group>
      </group>
      
      {/* ダメージインジケーター - 低体力時に点滅 */}
      {healthPercent < 0.3 && (
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[2.2, 1.7]} />
          <meshBasicMaterial 
            color="#FFFFFF" 
            transparent={true} 
            opacity={Math.abs(Math.sin(Date.now() * 0.01)) * 0.4} 
          />
        </mesh>
      )}
      
      {/* Health bar */}
      <group position={[0, 1.2, 0.05]}>
        {/* 背景 */}
        <mesh>
          <planeGeometry args={[2, 0.2]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        
        {/* HPバー */}
        <mesh 
          position={[(healthPercent - 1) * 1, 0, 0.01]} 
          scale={[healthPercent, 1, 1]}
        >
          <planeGeometry args={[2, 0.2]} />
          <meshBasicMaterial color={bossColor} />
        </mesh>
      </group>
    </group>
  );
};

export default Boss;
