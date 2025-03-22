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
  const { toggleMute, isMuted, setBackgroundMusic } = useAudio();
  const [viewport, setViewport] = useState({
    fov: 60,
    aspectRatio: window.innerWidth / window.innerHeight,
  });

  // フォント読み込み状態の確認
  const fontsLoadedRef = useRef(false);
  
  // フォント読み込み確認 - より詳細なデバッグ情報を含む
  useEffect(() => {
    const checkFontsLoaded = async () => {
      try {
        if ('fonts' in document) {
          // フォントロード処理
          const fontPromises = [
            (document as any).fonts.load('1em "Press Start 2P"'),
            (document as any).fonts.load('1em "VT323"')
          ];
          
          // フォント読み込み状態のログ出力
          if ((document as any).fonts.check('1em "Press Start 2P"')) {
            console.log('Press Start 2P already loaded');
          }
          
          if ((document as any).fonts.check('1em "VT323"')) {
            console.log('VT323 already loaded');
          }
          
          await Promise.all(fontPromises);
          console.log('App component: Fonts loaded successfully!');
          
          // 利用可能なフォントリスト
          const availableFonts: string[] = [];
          (document as any).fonts.forEach((font: any) => {
            availableFonts.push(`${font.family} - ${font.status}`);
          });
          
          // 重複を削除
          const uniqueFonts: string[] = [];
          const seenFonts = new Map<string, boolean>();
          
          for (const font of availableFonts) {
            if (!seenFonts.has(font)) {
              seenFonts.set(font, true);
              uniqueFonts.push(font);
            }
          }
          
          console.log('Available fonts:', uniqueFonts);
          fontsLoadedRef.current = true;
        }
      } catch (err) {
        console.error('Error loading fonts in App component:', err);
      }
    };
    
    checkFontsLoaded();
  }, []);
  
  // Load and setup audio
  useEffect(() => {
    const music = new Audio("/sounds/background.mp3");
    music.loop = true;
    music.volume = 0.5;
    setBgMusic(music);
    setBackgroundMusic(music);
    
    const hitSound = new Audio("/sounds/hit.mp3");
    hitSound.volume = 0.3;
    
    const successSound = new Audio("/sounds/success.mp3");
    successSound.volume = 0.5;
    
    return () => {
      if (music) {
        music.pause();
        music.currentTime = 0;
      }
    };
  }, [setBackgroundMusic]);
  
  // Play background music when game starts
  useEffect(() => {
    if (bgMusic && gamePhase === "playing" && !isMuted) {
      bgMusic.play().catch(error => {
        console.log("Background music play prevented:", error);
      });
    } else if (bgMusic && gamePhase !== "playing") {
      bgMusic.pause();
    }
  }, [bgMusic, gamePhase, isMuted]);
  
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
          className={fontsLoadedRef.current ? 'fonts-loaded' : 'fonts-loading'}
        >
          {/* フォント読み込み状態表示（開発時のみ）*/}
          <div className="absolute top-4 left-4 z-50 text-xs opacity-50">
            {fontsLoadedRef.current ? 
              <span style={{ color: '#00ff00' }}>Fonts Ready</span> : 
              <span style={{ color: '#ffff00' }}>Loading Fonts...</span>
            }
          </div>
          
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
              {gamePhase === "playing" && <Level viewport={viewport} />}
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
