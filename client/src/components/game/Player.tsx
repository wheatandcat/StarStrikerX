import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGradius } from "@/lib/stores/useGradius";
import { PLAYER_SIZE } from "@/lib/constants";

// レトロな2Dスタイルのプレイヤー
const Player = () => {
  const { playerPosition, isPlayerInvulnerable, weaponLevel } = useGradius();
  const playerRef = useRef<THREE.Group>(null);
  const engineRef = useRef<THREE.Mesh>(null);
  
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
      {/* SFC風の宇宙船 - 詳細な2D形状 */}
      <group scale={[PLAYER_SIZE * 1.5, PLAYER_SIZE * 1.5, 1]}>
        {/* メインボディ - 少し複雑な形状 */}
        <mesh>
          <shapeGeometry args={[new THREE.Shape()
            .moveTo(0.5, 0) // 前部先端
            .lineTo(0.3, 0.15) // 上部前方
            .lineTo(-0.4, 0.25) // 上部後方
            .lineTo(-0.6, 0) // 後部
            .lineTo(-0.4, -0.25) // 下部後方
            .lineTo(0.3, -0.15) // 下部前方
            .lineTo(0.5, 0) // 前部先端に戻る
          ]} />
          <meshBasicMaterial color="#3366DD" />
        </mesh>
        
        {/* ボディのディテール - 中央部 */}
        <mesh position={[0, 0, 0.01]}>
          <shapeGeometry args={[new THREE.Shape()
            .moveTo(0.3, 0) // 前部
            .lineTo(0.2, 0.1) // 上部前方
            .lineTo(-0.2, 0.1) // 上部後方
            .lineTo(-0.3, 0) // 後部
            .lineTo(-0.2, -0.1) // 下部後方
            .lineTo(0.2, -0.1) // 下部前方
            .lineTo(0.3, 0) // 前部に戻る
          ]} />
          <meshBasicMaterial color="#4488FF" />
        </mesh>
        
        {/* コックピット部分 */}
        <mesh position={[0.2, 0, 0.02]}>
          <shapeGeometry args={[new THREE.Shape()
            .moveTo(0.15, 0) // 前部
            .lineTo(0.05, 0.08) // 上部前方
            .lineTo(-0.15, 0.08) // 上部後方
            .lineTo(-0.15, -0.08) // 下部後方
            .lineTo(0.05, -0.08) // 下部前方
            .lineTo(0.15, 0) // 前部に戻る
          ]} />
          <meshBasicMaterial color="#99CCFF" />
        </mesh>
        
        {/* ウィングの装甲 - 上 */}
        <mesh position={[0, 0.18, 0.01]}>
          <shapeGeometry args={[new THREE.Shape()
            .moveTo(0.1, 0) // 前部
            .lineTo(-0.3, 0.1) // 上部後方
            .lineTo(-0.4, 0) // 後部
            .lineTo(-0.3, -0.05) // 下部後方
            .lineTo(0.1, 0) // 前部に戻る
          ]} />
          <meshBasicMaterial color="#2255CC" />
        </mesh>
        
        {/* ウィングの装甲 - 下 */}
        <mesh position={[0, -0.18, 0.01]}>
          <shapeGeometry args={[new THREE.Shape()
            .moveTo(0.1, 0) // 前部
            .lineTo(-0.3, -0.1) // 下部後方
            .lineTo(-0.4, 0) // 後部
            .lineTo(-0.3, 0.05) // 上部後方
            .lineTo(0.1, 0) // 前部に戻る
          ]} />
          <meshBasicMaterial color="#2255CC" />
        </mesh>
        
        {/* エンジン排気 - アニメーション付き */}
        <group position={[-0.6, 0, 0]}>
          <mesh ref={engineRef}>
            <shapeGeometry args={[new THREE.Shape()
              .moveTo(0, 0) // 排気口
              .lineTo(-0.3, 0.15) // 上部
              .lineTo(-0.5, 0) // 後部
              .lineTo(-0.3, -0.15) // 下部
              .lineTo(0, 0) // 排気口に戻る
            ]} />
            <meshBasicMaterial 
              color="#FF8800" 
              transparent={true}
              opacity={0.8}
            />
          </mesh>
          
          {/* 内側の明るい排気 */}
          <mesh position={[-0.2, 0, 0.01]}>
            <shapeGeometry args={[new THREE.Shape()
              .moveTo(0, 0) // 排気口
              .lineTo(-0.2, 0.1) // 上部
              .lineTo(-0.3, 0) // 後部
              .lineTo(-0.2, -0.1) // 下部
              .lineTo(0, 0) // 排気口に戻る
            ]} />
            <meshBasicMaterial 
              color="#FFFF00" 
              transparent={true}
              opacity={0.9}
            />
          </mesh>
        </group>
        
        {/* 細部のディテール - アクセントライン */}
        <mesh position={[0.1, 0, 0.03]}>
          <planeGeometry args={[0.5, 0.02]} />
          <meshBasicMaterial color="#99FFFF" />
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
