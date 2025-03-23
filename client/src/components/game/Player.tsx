import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useGradius } from "@/lib/stores/useGradius";
import { useAudio } from "@/lib/stores/useAudio";
import { Controls } from "@/lib/types";
import { PLAYER_SIZE, PLAYER_SHOOT_COOLDOWN } from "@/lib/constants";

// レトロな2Dスタイルのプレイヤー
const Player = () => {
  const { 
    playerPosition, 
    isPlayerInvulnerable, 
    weaponLevel,
    gamePhase,
    shootBullet
  } = useGradius();
  const { playPlayerShoot } = useAudio();
  const playerRef = useRef<THREE.Group>(null);
  const engineRef = useRef<THREE.Mesh>(null);
  const lastShootTime = useRef<number>(0);
  
  // Get the shoot button state from keyboard controls
  const shootPressed = useKeyboardControls<Controls>(state => state.shoot);
  
  // Handle shooting with sound effect
  useEffect(() => {
    if (!shootPressed || gamePhase !== "playing") return;
    
    const currentTime = Date.now();
    // Check cooldown to prevent too frequent shots
    if (currentTime - lastShootTime.current > PLAYER_SHOOT_COOLDOWN) {
      // Play shooting sound
      playPlayerShoot();
      
      // Shoot bullet (implemented in useGradius store)
      shootBullet();
      
      // Update last shoot time
      lastShootTime.current = currentTime;
    }
  }, [shootPressed, gamePhase, shootBullet, playPlayerShoot]);
  
  // Note: ポーズ機能の制御はLevel.tsxで行うため、
  // この部分は削除しました (重複操作を防ぐため)
  
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
    
    // エンジン排気アニメーション
    if (engineRef.current) {
      // エンジン炎のサイズを脈動させる
      const pulseSize = 0.8 + Math.sin(state.clock.getElapsedTime() * 15) * 0.2;
      engineRef.current.scale.x = pulseSize;
      
      // エンジン色も変化させる
      const engineMaterial = engineRef.current.material as THREE.MeshBasicMaterial;
      engineMaterial.color.setHSL(
        0.05 + Math.sin(state.clock.getElapsedTime() * 10) * 0.05, // わずかに色相変化
        0.8, // 高い彩度
        0.6  // 明るさ
      );
    }
    
    // 船体の微妙な傾き
    playerRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 2) * 0.05;
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
      rotation={[0, 0, 0]}
    >
      {/* R-Type/グラディウス風の宇宙船 - 機械的でクリーンなデザイン */}
      <group scale={[PLAYER_SIZE * 1.5, PLAYER_SIZE * 1.5, 1]}>
        {/* メインボディ - 幾何学的な形状 */}
        <mesh>
          <shapeGeometry args={[new THREE.Shape()
            .moveTo(0.6, 0) // 前部先端
            .lineTo(0.4, 0.2) // 上部前方
            .lineTo(0.0, 0.25) // 上部中央
            .lineTo(-0.5, 0.2) // 上部後方
            .lineTo(-0.6, 0) // 後部
            .lineTo(-0.5, -0.2) // 下部後方
            .lineTo(0.0, -0.25) // 下部中央
            .lineTo(0.4, -0.2) // 下部前方
            .lineTo(0.6, 0) // 前部先端に戻る
          ]} />
          <meshBasicMaterial color="#B1C9E8" />
        </mesh>

        {/* 外装のメカニカルラインパターン */}
        <mesh position={[0, 0, 0.01]}>
          <shapeGeometry args={[new THREE.Shape()
            .moveTo(0.3, 0) // 前部
            .lineTo(0.2, 0.15) // 上部前方
            .lineTo(-0.4, 0.15) // 上部後方
            .lineTo(-0.45, 0) // 後部
            .lineTo(-0.4, -0.15) // 下部後方
            .lineTo(0.2, -0.15) // 下部前方
            .lineTo(0.3, 0) // 前部に戻る
          ]} />
          <meshBasicMaterial color="#2A4B8F" />
        </mesh>
        
        {/* コックピット部分 - グラディウス風の先端デザイン */}
        <mesh position={[0.3, 0, 0.02]}>
          <shapeGeometry args={[new THREE.Shape()
            .moveTo(0.3, 0) // 先端
            .lineTo(0.0, 0.1) // 上部
            .lineTo(-0.2, 0.1) // 上部後方
            .lineTo(-0.2, -0.1) // 下部後方
            .lineTo(0.0, -0.1) // 下部
            .lineTo(0.3, 0) // 先端に戻る
          ]} />
          <meshBasicMaterial color="#5F89D3" />
        </mesh>
        
        {/* R-Type風のウィング - 上 - 直線的な形状 */}
        <mesh position={[-0.1, 0.3, 0.01]}>
          <shapeGeometry args={[new THREE.Shape()
            .moveTo(0.4, 0) // 前部
            .lineTo(0.3, 0.1) // 上部前方
            .lineTo(-0.2, 0.1) // 上部後方
            .lineTo(-0.4, 0) // 後部
            .lineTo(-0.2, -0.05) // 下部
            .lineTo(0.4, 0) // 前部に戻る
          ]} />
          <meshBasicMaterial color="#3A67B0" />
        </mesh>
        
        {/* R-Type風のウィング - 下 - 直線的な形状 */}
        <mesh position={[-0.1, -0.3, 0.01]}>
          <shapeGeometry args={[new THREE.Shape()
            .moveTo(0.4, 0) // 前部
            .lineTo(0.3, -0.1) // 下部前方
            .lineTo(-0.2, -0.1) // 下部後方
            .lineTo(-0.4, 0) // 後部
            .lineTo(-0.2, 0.05) // 上部
            .lineTo(0.4, 0) // 前部に戻る
          ]} />
          <meshBasicMaterial color="#3A67B0" />
        </mesh>

        {/* ウィングのアクセント - 上 */}
        <mesh position={[-0.1, 0.35, 0.02]}>
          <planeGeometry args={[0.6, 0.03]} />
          <meshBasicMaterial color="#1A3875" />
        </mesh>

        {/* ウィングのアクセント - 下 */}
        <mesh position={[-0.1, -0.35, 0.02]}>
          <planeGeometry args={[0.6, 0.03]} />
          <meshBasicMaterial color="#1A3875" />
        </mesh>
        
        {/* ダライアス風のエンジン排気 - より広く、光る */}
        <group position={[-0.6, 0, 0.01]}>
          {/* 主排気 */}
          <mesh ref={engineRef}>
            <shapeGeometry args={[new THREE.Shape()
              .moveTo(0, 0) // 排気口
              .lineTo(-0.2, 0.2) // 上部
              .lineTo(-0.4, 0) // 後部
              .lineTo(-0.2, -0.2) // 下部
              .lineTo(0, 0) // 排気口に戻る
            ]} />
            <meshBasicMaterial 
              color="#FF6000" 
              transparent={true}
              opacity={0.8}
            />
          </mesh>
          
          {/* 内側の光る部分 */}
          <mesh position={[-0.15, 0, 0.01]}>
            <shapeGeometry args={[new THREE.Shape()
              .moveTo(0, 0) // 排気口
              .lineTo(-0.15, 0.15) // 上部
              .lineTo(-0.25, 0) // 後部
              .lineTo(-0.15, -0.15) // 下部
              .lineTo(0, 0) // 排気口に戻る
            ]} />
            <meshBasicMaterial 
              color="#FFFF00" 
              transparent={true}
              opacity={0.9}
            />
          </mesh>

          {/* 副排気 - 上 */}
          <mesh position={[0, 0.15, 0]}>
            <planeGeometry args={[0.1, 0.05]} />
            <meshBasicMaterial 
              color="#FF8000" 
              transparent={true}
              opacity={0.7}
            />
          </mesh>

          {/* 副排気 - 下 */}
          <mesh position={[0, -0.15, 0]}>
            <planeGeometry args={[0.1, 0.05]} />
            <meshBasicMaterial 
              color="#FF8000" 
              transparent={true}
              opacity={0.7}
            />
          </mesh>
        </group>
        
        {/* アクスレイ風の前方グロー効果 */}
        <mesh position={[0.6, 0, 0.01]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial 
            color="#00FFFF" 
            transparent={true}
            opacity={0.8}
          />
        </mesh>

        {/* メカニカルディテール - 機体中央の線 */}
        <mesh position={[0, 0, 0.03]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.8, 0.02]} />
          <meshBasicMaterial color="#1A3875" />
        </mesh>

        {/* メカニカルディテール - 機体側面装甲 */}
        <mesh position={[-0.1, 0.18, 0.03]}>
          <planeGeometry args={[0.5, 0.02]} />
          <meshBasicMaterial color="#5F89D3" />
        </mesh>

        <mesh position={[-0.1, -0.18, 0.03]}>
          <planeGeometry args={[0.5, 0.02]} />
          <meshBasicMaterial color="#5F89D3" />
        </mesh>
      </group>
      
      {/* 武器レベルインジケーター - レトロスタイル */}
      <group position={[0, 0.6, 0.01]}>
        {/* 基本の枠 */}
        <mesh>
          <planeGeometry args={[0.6, 0.15]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        
        {/* 武器レベル表示 - 現在のレベルに応じて拡大 */}
        <mesh position={[0, 0, 0.01]} scale={[(weaponLevel + 1) / 4, 1, 1]}>
          <planeGeometry args={[0.55, 0.1]} />
          <meshBasicMaterial color={weaponLevelColor} />
        </mesh>
      </group>
      
      {/* 無敵時のシールドエフェクト - 単純な円で表現 */}
      {isPlayerInvulnerable && (
        <mesh>
          <circleGeometry args={[PLAYER_SIZE * 1.2, 16]} />
          <meshBasicMaterial 
            color="#4488ff"
            transparent={true}
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  );
};

export default Player;
