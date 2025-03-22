import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// フォントをプリロードするラッパーコンポーネント
const FontLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  useEffect(() => {
    // フォントをプリロード
    const preloadFonts = async () => {
      try {
        if ('fonts' in document) {
          // Promise.allを使って両方のフォントを並行してロード
          await Promise.all([
            (document as any).fonts.load('1em "Press Start 2P"'),
            (document as any).fonts.load('1em "VT323"')
          ]);
          console.log('Fonts loaded successfully');
          setFontsLoaded(true);
        } else {
          // フォールバック: FontFaceObserverが使えない場合は1秒後に表示
          setTimeout(() => {
            console.log('Fonts loaded via timeout');
            setFontsLoaded(true);
          }, 1000);
        }
      } catch (err) {
        console.error('Error loading fonts:', err);
        // エラー時も表示するため
        setFontsLoaded(true);
      }
    };
    
    preloadFonts();
  }, []);
  
  // フォントロード中にもコンテンツを表示するがスタイルで視認性を調整
  return (
    <div className={fontsLoaded ? 'fonts-loaded' : 'fonts-loading'}>
      {children}
    </div>
  );
};

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FontLoader>
      <App />
    </FontLoader>
  </React.StrictMode>
);
