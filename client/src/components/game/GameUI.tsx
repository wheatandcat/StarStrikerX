import { useMemo, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useGradius } from '@/lib/stores/useGradius';
import { WeaponLevel } from '@/lib/types';

// ボスのHP表示用のスタイル
const bossHpStyles = {
  container: {
    position: 'absolute' as 'absolute',
    top: '15%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60%',
    maxWidth: '400px',
    borderRadius: '5px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    border: '2px solid #ff0066',
    padding: '8px',
    boxShadow: '0 0 10px rgba(255, 0, 102, 0.7)',
    fontFamily: 'Arial, sans-serif',
    color: 'white',
    textAlign: 'center' as 'center',
    zIndex: 10
  },
  title: {
    marginBottom: '5px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    textAlign: 'center' as 'center',
    color: '#ff0066',
    textShadow: '0 0 5px rgba(255, 0, 102, 0.7)'
  },
  barContainer: {
    width: '100%',
    height: '15px',
    backgroundColor: '#222222',
    border: '1px solid #444444',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    width: '100%',
    transformOrigin: 'left',
    transition: 'transform 0.2s ease-out'
  },
  barSegments: {
    display: 'flex',
    width: '100%',
    height: '100%'
  },
  barSegment: {
    height: '100%',
    flexGrow: 1,
    borderRight: '1px solid rgba(0, 0, 0, 0.3)'
  },
  barSubSegments: {
    display: 'flex',
    width: '100%',
    height: '3px'
  },
  barSubSegment: {
    height: '100%',
    flexGrow: 1,
    borderRight: '1px solid rgba(255, 255, 255, 0.1)'
  },
  percent: {
    fontSize: '0.7rem',
    marginTop: '2px',
    textAlign: 'right' as 'right',
    fontWeight: 'bold'
  }
};

const GameUI = () => {
  const { 
    lives, 
    score, 
    weaponLevel, 
    stageNumber, 
    bossActive, 
    bossHealth,
  } = useGradius();
  
  const { size } = useThree();
  const [bossHealthPercent, setBossHealthPercent] = useState(100);
  // ボスHPの点滅アニメーション
  const [bossHpFlashing, setBossHpFlashing] = useState(false);
  const [lastBossHealth, setLastBossHealth] = useState(bossHealth);
  
  // Format score with commas
  const formattedScore = useMemo(() => {
    return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, [score]);
  
  // Get weapon name based on level
  const weaponName = useMemo(() => {
    switch (weaponLevel) {
      case WeaponLevel.Single:
        return "Single Shot";
      case WeaponLevel.Double:
        return "Double Shot";
      case WeaponLevel.Triple:
        return "Triple Shot";
      case WeaponLevel.Ultimate:
        return "Ultimate";
      default:
        return "Single Shot";
    }
  }, [weaponLevel]);
  
  // ボスのHPバーの色を計算
  const bossHpColor = useMemo(() => {
    if (bossHealthPercent > 66) {
      return '#00ff00'; // 緑: 高HP
    } else if (bossHealthPercent > 33) {
      return '#ffff00'; // 黄: 中HP
    } else {
      return '#ff0000'; // 赤: 低HP
    }
  }, [bossHealthPercent]);
  
  // ボスのHPパーセントを計算
  useEffect(() => {
    if (bossActive) {
      // ボスの最大HPを仮定（定数から取得すべき）
      const maxBossHealth = 120;
      const percent = Math.max(0, Math.min(100, (bossHealth / maxBossHealth) * 100));
      setBossHealthPercent(percent);
      
      // ダメージを受けた時に点滅エフェクト
      if (bossHealth < lastBossHealth) {
        setBossHpFlashing(true);
        setTimeout(() => setBossHpFlashing(false), 200);
      }
      
      setLastBossHealth(bossHealth);
    }
  }, [bossHealth, bossActive]);
  
  // ダメージ時にHP表示をアニメーション
  const [animValue, setAnimValue] = useState(0);
  
  useFrame(({ clock }) => {
    if (bossHpFlashing) {
      setAnimValue(Math.abs(Math.sin(clock.getElapsedTime() * 20)));
    } else {
      setAnimValue(0);
    }
  });
  
  // バーセグメント生成
  const renderSegments = (count: number) => {
    return Array.from({ length: count }).map((_, i) => (
      <div 
        key={i} 
        style={{
          ...bossHpStyles.barSegment,
          borderRight: i === count - 1 ? 'none' : '1px solid rgba(0, 0, 0, 0.3)'
        }} 
      />
    ));
  };
  
  // サブセグメント生成
  const renderSubSegments = (count: number) => {
    return Array.from({ length: count }).map((_, i) => (
      <div 
        key={i} 
        style={{
          ...bossHpStyles.barSubSegment,
          borderRight: i === count - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
        }} 
      />
    ));
  };

  // 通常のThree.jsのTextコンポーネントではなく、
  // Htmlコンポーネントを使用してフォント問題を解決
  return (
    <group>
      {/* Score display */}
      <Html position={[-9.5, 5, 0]} transform center className="game-ui-element">
        <div style={{ 
          fontFamily: 'Arial, sans-serif', /* システムフォントを使用 */
          color: 'white', 
          fontSize: '0.6rem',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          textShadow: '0 0 3px #00aaff, 0 0 3px #00aaff'
        }}>
          SCORE: {formattedScore}
        </div>
      </Html>
      
      {/* Lives display */}
      <Html position={[8, 5, 0]} transform center className="game-ui-element">
        <div style={{ 
          fontFamily: 'Arial, sans-serif', /* システムフォントを使用 */
          color: 'white', 
          fontSize: '0.6rem',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          textShadow: '0 0 3px #ff0000, 0 0 3px #ff0000'
        }}>
          LIVES: {lives}
        </div>
      </Html>
      
      {/* Weapon level display */}
      <Html position={[0, 5, 0]} transform center className="game-ui-element">
        <div style={{ 
          fontFamily: 'Arial, sans-serif', /* システムフォントを使用 */
          color: 'white', 
          fontSize: '0.55rem',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          textShadow: '0 0 3px #00ff00, 0 0 3px #00ff00'
        }}>
          WEAPON: {weaponName}
        </div>
      </Html>
      
      {/* Stage display */}
      <Html position={[-5, 5, 0]} transform center className="game-ui-element">
        <div style={{ 
          fontFamily: 'Arial, sans-serif', /* システムフォントを使用 */
          color: 'white', 
          fontSize: '0.55rem',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          textShadow: '0 0 3px #ffff00, 0 0 3px #ffff00'
        }}>
          STAGE: {stageNumber}
        </div>
      </Html>
      
      {/* Boss HP bar - フルスクリーン用HTML */}
      <Html fullscreen>
        {bossActive && (
          <div style={bossHpStyles.container}>
            <div style={bossHpStyles.title}>
              BOSS
            </div>
            <div style={bossHpStyles.barContainer}>
              <div style={bossHpStyles.barSegments}>
                {renderSegments(10)}
              </div>
              <div 
                style={{
                  ...bossHpStyles.barFill,
                  backgroundColor: bossHpColor,
                  boxShadow: `0 0 10px ${bossHpColor}`,
                  borderRadius: '2px',
                  filter: bossHpFlashing ? `brightness(${1.5 + animValue})` : 'none',
                  transform: `scaleX(${bossHealthPercent / 100})`,
                  position: 'relative',
                  top: '-100%'
                }}
              >
                <div style={bossHpStyles.barSubSegments}>
                  {renderSubSegments(20)}
                </div>
              </div>
            </div>
            <div style={bossHpStyles.percent}>
              {Math.round(bossHealthPercent)}%
            </div>
          </div>
        )}
      </Html>
      
      {/* Controls help at bottom */}
      <Html position={[0, -5.3, 0]} transform center className="game-ui-element">
        <div style={{ 
          fontFamily: 'Arial, sans-serif', /* システムフォントを使用 */
          color: 'rgba(255, 255, 255, 0.7)', 
          fontSize: '0.5rem',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          textShadow: '0 0 2px rgba(0, 0, 0, 0.5)'
        }} className="text-center">
          ARROWS/WASD: MOVE ・ SPACE: SHOOT ・ ESC/P: PAUSE
        </div>
      </Html>
    </group>
  );
};

export default GameUI;
