import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState, useRef } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "./lib/stores/useAudio";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import Level from "./components/game/Level";
import { Controls } from "./lib/types";
import StartScreen from "./components/ui/StartScreen";
import GameOverScreen from "./components/ui/GameOverScreen";
import StageClearScreen from "./components/ui/StageClearScreen";
import LeaderboardModal from "./components/ui/LeaderboardModal";
import { useGradius } from "./lib/stores/useGradius";
// フォント読み込み確認用

// Define control keys for the game
const keyboardMap = [
  { name: Controls.up, keys: ["KeyW", "ArrowUp"] },
  { name: Controls.down, keys: ["KeyS", "ArrowDown"] },
  { name: Controls.left, keys: ["KeyA", "ArrowLeft"] },
  { name: Controls.right, keys: ["KeyD", "ArrowRight"] },
  { name: Controls.shoot, keys: ["Space"] },
  { name: Controls.pause, keys: ["KeyP", "Escape"] },
];

// Main App component
function App() {
  const { 
    gamePhase, 
    score, 
    lives, 
    playerName, 
    setPlayerName,
    startGame, 
    restartGame,
    continueToNextStage,
    showLeaderboard,
    setShowLeaderboard 
  } = useGradius();
  const [bgMusic, setBgMusic] = useState<HTMLAudioElement | null>(null);
  const [bossBgMusic, setBossBgMusic] = useState<HTMLAudioElement | null>(null);
  const { 
    toggleMute, 
    isMuted, 
    setBackgroundMusic, 
    setBossMusic, 
    setHitSound,
    setSuccessSound,
    setWeaponUpgradeSound,
    setShieldSound,
    setPlayerShootSound,
    setEnemyDestroySound,
    switchToNormalMusic 
  } = useAudio();
  const [viewport, setViewport] = useState({
    fov: 60,
    aspectRatio: window.innerWidth / window.innerHeight,
  });

  // フォントロードは完全に削除
  
  // Load and setup audio
  useEffect(() => {
    // 通常BGMのロード
    const music = new Audio("/sounds/background.mp3");
    music.loop = true;
    music.volume = 0.5;
    setBgMusic(music);
    setBackgroundMusic(music);
    
    // ボス戦用BGMのロード
    const bossMusic = new Audio("/sounds/boss.mp3");
    bossMusic.loop = true;
    bossMusic.volume = 0.6;
    setBossBgMusic(bossMusic);
    setBossMusic(bossMusic);
    
    // 効果音のロード
    const hitSound = new Audio("/sounds/hit.mp3");
    hitSound.volume = 0.3;
    setHitSound(hitSound);
    
    const successSound = new Audio("/sounds/success.mp3");
    successSound.volume = 0.5;
    setSuccessSound(successSound);
    
    // 武器アップグレード効果音
    const weaponUpgradeSound = new Audio("/sounds/weapon_upgrade.mp3");
    weaponUpgradeSound.volume = 0.5;
    setWeaponUpgradeSound(weaponUpgradeSound);
    
    // シールド効果音
    const shieldSound = new Audio("/sounds/shield.mp3");
    shieldSound.volume = 0.4;
    setShieldSound(shieldSound);
    
    // プレイヤー射撃効果音
    const playerShootSound = new Audio("/sounds/player_shoot.mp3");
    playerShootSound.volume = 0.2;
    setPlayerShootSound(playerShootSound);
    
    // 敵撃破効果音
    const enemyDestroySound = new Audio("/sounds/enemy_destroy.mp3");
    enemyDestroySound.volume = 0.4;
    setEnemyDestroySound(enemyDestroySound);
    
    // ゲーム開始時に通常BGMを設定
    switchToNormalMusic();
    
    return () => {
      if (music) {
        music.pause();
        music.currentTime = 0;
      }
      if (bossMusic) {
        bossMusic.pause();
        bossMusic.currentTime = 0;
      }
    };
  }, [
    setBackgroundMusic, 
    setBossMusic, 
    setHitSound,
    setSuccessSound,
    setWeaponUpgradeSound,
    setShieldSound,
    setPlayerShootSound,
    setEnemyDestroySound,
    switchToNormalMusic
  ]);
  
  // ゲーム状態に応じたBGM制御
  useEffect(() => {
    const { isMuted, currentMusic } = useAudio.getState();
    
    // ゲーム開始時（メニューからプレイへの移行時）に通常BGMを設定
    if (gamePhase === "playing" && !isMuted) {
      if (currentMusic === null) {
        switchToNormalMusic();
      }
    } 
    // ゲームが一時停止または終了した場合はBGMを停止
    else if (gamePhase !== "playing") {
      const { backgroundMusic, bossMusic } = useAudio.getState();
      
      if (backgroundMusic && !backgroundMusic.paused) {
        backgroundMusic.pause();
      }
      
      if (bossMusic && !bossMusic.paused) {
        bossMusic.pause();
      }
    }
  }, [gamePhase, switchToNormalMusic]);
  
  // Handle window resize to update viewport
  useEffect(() => {
    const handleResize = () => {
      const aspectRatio = window.innerWidth / window.innerHeight;
      
      // Adjust FOV based on aspect ratio - wider screens get lower FOV to show more vertical space
      let newFov = 60; // default FOV
      
      if (aspectRatio < 1) { // portrait mode
        newFov = 90; // increase FOV to show more of the game area
      } else if (aspectRatio > 2) { // very wide screen
        newFov = 50; // lower FOV to prevent horizontal stretching
      } else {
        // Scale FOV inversely with aspect ratio between 1 and 2
        newFov = 70 - (aspectRatio - 1) * 20;
      }
      
      console.log(`Viewport adjusted: ${window.innerWidth}x${window.innerHeight}, AR: ${aspectRatio.toFixed(2)}, FOV: ${newFov.toFixed(1)}`);
      
      setViewport({
        fov: newFov,
        aspectRatio
      });
    };
    
    // Initial calculation
    handleResize();
    
    // Add event listener
    window.addEventListener("resize", handleResize);
    
    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <KeyboardControls map={keyboardMap}>
        <div 
          style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}
        >
          
          <button 
            onClick={toggleMute} 
            className="absolute top-4 right-4 z-50 px-3 py-2 bg-gray-800 text-white rounded-full pixel-font"
            style={{ fontSize: '12px', fontFamily: 'monospace' }}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
          
          {/* Game Canvas */}
          <Canvas
            shadows
            camera={{
              position: [0, 0, 15],
              fov: viewport.fov,
              near: 0.1,
              far: 1000
            }}
            gl={{
              antialias: true,
              alpha: true
            }}
          >
            <color attach="background" args={["#000022"]} />
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[10, 10, 10]}
              intensity={1}
              castShadow
            />
            
            <Suspense fallback={null}>
              {(gamePhase === "playing" || gamePhase === "paused") && <Level viewport={viewport} />}
            </Suspense>
          </Canvas>
          
          {/* UI Overlays */}
          {gamePhase === "menu" && (
            <StartScreen 
              onStart={startGame} 
              playerName={playerName}
              setPlayerName={setPlayerName}
              onLeaderboard={() => setShowLeaderboard(true)} 
            />
          )}
          
          {gamePhase === "gameOver" && (
            <GameOverScreen 
              score={score} 
              onRestart={restartGame} 
              onLeaderboard={() => setShowLeaderboard(true)} 
            />
          )}
          
          {gamePhase === "stageClear" && (
            <StageClearScreen 
              score={score} 
              onContinue={continueToNextStage} 
            />
          )}
          
          {/* ポーズ画面 - App.tsxで直接実装（Three.jsの外に配置） */}
          {gamePhase === "paused" && (
            <div className="absolute inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
              <div className="bg-blue-900 bg-opacity-80 p-8 rounded-xl border-2 border-blue-400 shadow-lg shadow-blue-500/50 max-w-md w-full">
                <h2 className="text-4xl font-bold text-center mb-6 text-blue-300 drop-shadow-[0_0_5px_rgba(59,130,246,0.7)]">PAUSED</h2>
                
                <button 
                  onClick={() => useGradius.getState().togglePause()}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-md mb-4 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  RESUME GAME
                </button>
                
                <p className="text-gray-300 text-center mb-6 text-sm">Press ESC or P to resume</p>
                
                <div className="bg-blue-950 bg-opacity-70 p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white">SCORE:</span>
                    <span className="text-cyan-300 font-bold">{score.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white">LIVES:</span>
                    <span className="text-red-400 font-bold">{lives}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {showLeaderboard && (
            <LeaderboardModal 
              onClose={() => setShowLeaderboard(false)} 
              currentScore={score}
              playerName={playerName}
            />
          )}
        </div>
      </KeyboardControls>
    </QueryClientProvider>
  );
}

export default App;
