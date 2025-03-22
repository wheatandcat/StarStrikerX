import { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useGradius } from '@/lib/stores/useGradius';
import { WeaponLevel } from '@/lib/types';

const GameUI = () => {
  const { lives, score, weaponLevel, stageNumber } = useGradius();
  const { size } = useThree();
  
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

  // 通常のThree.jsのTextコンポーネントではなく、
  // Htmlコンポーネントを使用してフォント問題を解決
  return (
    <group>
      {/* 共通のスタイルを定義 */}
      {/* Score display */}
      <Html position={[-9.5, 5, 0]} transform center className="game-ui-element">
        <div style={{ 
          fontFamily: 'monospace', /* フォールバック */
          color: 'white', 
          fontSize: '0.6rem',
          whiteSpace: 'nowrap',
          textShadow: '0 0 3px #00aaff, 0 0 3px #00aaff'
        }} className="pixel-font">
          SCORE: {formattedScore}
        </div>
      </Html>
      
      {/* Lives display */}
      <Html position={[8, 5, 0]} transform center className="game-ui-element">
        <div style={{ 
          fontFamily: 'monospace', /* フォールバック */
          color: 'white', 
          fontSize: '0.6rem',
          whiteSpace: 'nowrap',
          textShadow: '0 0 3px #ff0000, 0 0 3px #ff0000'
        }} className="pixel-font">
          LIVES: {lives}
        </div>
      </Html>
      
      {/* Weapon level display */}
      <Html position={[0, 5, 0]} transform center className="game-ui-element">
        <div style={{ 
          fontFamily: 'monospace', /* フォールバック */
          color: 'white', 
          fontSize: '0.55rem',
          whiteSpace: 'nowrap',
          textShadow: '0 0 3px #00ff00, 0 0 3px #00ff00'
        }} className="pixel-font">
          WEAPON: {weaponName}
        </div>
      </Html>
      
      {/* Stage display */}
      <Html position={[-5, 5, 0]} transform center className="game-ui-element">
        <div style={{ 
          fontFamily: 'monospace', /* フォールバック */
          color: 'white', 
          fontSize: '0.55rem',
          whiteSpace: 'nowrap',
          textShadow: '0 0 3px #ffff00, 0 0 3px #ffff00'
        }} className="pixel-font">
          STAGE: {stageNumber}
        </div>
      </Html>
      
      {/* Controls help at bottom */}
      <Html position={[0, -5.3, 0]} transform center className="game-ui-element">
        <div style={{ 
          fontFamily: 'monospace', /* フォールバック */
          color: 'rgba(255, 255, 255, 0.7)', 
          fontSize: '0.5rem',
          whiteSpace: 'nowrap',
          textShadow: '0 0 2px rgba(0, 0, 0, 0.5)'
        }} className="pixel-font text-center">
          ARROWS/WASD: MOVE ・ SPACE: SHOOT ・ ESC/P: PAUSE
        </div>
      </Html>
    </group>
  );
};

export default GameUI;
