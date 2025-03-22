import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { formatScore } from "@/lib/gameUtils";
import { useGradius } from "@/lib/stores/useGradius";
import { HighScore } from "@/lib/types";

interface LeaderboardModalProps {
  onClose: () => void;
  currentScore: number;
  playerName: string;
}

const LeaderboardModal = ({ onClose, currentScore, playerName }: LeaderboardModalProps) => {
  const [leaderboard, setLeaderboard] = useState<HighScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { updateHighScores } = useGradius();
  
  // Fetch leaderboard data when component mounts
  useEffect(() => {
    fetchLeaderboard();
  }, []);
  
  // Function to fetch leaderboard data
  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/leaderboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data = await response.json();
      setLeaderboard(data);
      updateHighScores(data); // Update global state
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Could not load leaderboard. Please try again later.');
      // 直接データを使用（APIから取得できない場合は初期データ）
      const initialData = [
        { id: 1, name: "ACE", score: 15000, date: "2023-07-15" },
        { id: 2, name: "NOVA", score: 12500, date: "2023-07-14" },
        { id: 3, name: "VIPER", score: 10000, date: "2023-07-13" },
        { id: 4, name: "ECHO", score: 8500, date: "2023-07-12" },
        { id: 5, name: "PHANTOM", score: 7000, date: "2023-07-11" }
      ];
      setLeaderboard(initialData);
      updateHighScores(initialData); // 初期データでグローバルステートも更新
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to submit score
  const submitScore = async () => {
    if (currentScore <= 0 || isSubmitted) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('POST', '/api/leaderboard', {
        name: playerName,
        score: currentScore
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit score');
      }
      
      setIsSubmitted(true);
      
      // Refresh leaderboard after submission
      fetchLeaderboard();
    } catch (err) {
      console.error('Error submitting score:', err);
      // Even if submission fails, mark as submitted to prevent multiple attempts
      setIsSubmitted(true);
      
      // For demo purposes, update the local leaderboard with the new score
      const newEntry = {
        id: Date.now(),
        name: playerName,
        score: currentScore,
        date: new Date().toISOString().split('T')[0]
      };
      
      // Insert the new score in the correct position
      const updatedLeaderboard = [...leaderboard];
      let inserted = false;
      
      for (let i = 0; i < updatedLeaderboard.length; i++) {
        if (currentScore > updatedLeaderboard[i].score) {
          updatedLeaderboard.splice(i, 0, newEntry);
          inserted = true;
          break;
        }
      }
      
      // If not inserted and there's room (less than 10 entries)
      if (!inserted && updatedLeaderboard.length < 10) {
        updatedLeaderboard.push(newEntry);
      }
      
      // Keep only top 10
      setLeaderboard(updatedLeaderboard.slice(0, 10));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Check if current score is high enough to be on the leaderboard
  const isHighScore = currentScore > 0 && (
    leaderboard.length < 10 || 
    currentScore > (leaderboard[leaderboard.length - 1]?.score || 0)
  );
  
  return (
    <div 
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background: "rgba(0, 0, 20, 0.9)",
        backdropFilter: "blur(4px)"
      }}
    >
      <div className="w-full max-w-md mx-4">
        <Card className="border-2 border-yellow-600 bg-gray-900 text-white shadow-lg shadow-yellow-500/20">
          <CardHeader className="text-center pb-2">
            <CardTitle 
              className="text-2xl font-bold mb-2 text-yellow-400"
              style={{ 
                fontFamily: "'Press Start 2P', cursive",
                textShadow: "0 0 10px #ffcc00, 0 0 20px #cc9900",
                fontSize: '20px'
              }}
            >
              TOP PILOTS
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center py-6">Loading leaderboard...</div>
            ) : error ? (
              <div className="text-center text-red-400 py-6">{error}</div>
            ) : (
              <div className="space-y-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-gray-400" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '10px' }}>
                      <th className="pb-2 text-left">RANK</th>
                      <th className="pb-2 text-left">PILOT</th>
                      <th className="pb-2 text-right">SCORE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <tr 
                        key={entry.id} 
                        className={`${
                          playerName === entry.name && currentScore === entry.score 
                            ? 'text-green-400' 
                            : 'text-white'
                        }`}
                        style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '12px' }}
                      >
                        <td className="py-1 text-left">{index + 1}</td>
                        <td className="py-1 text-left">{entry.name}</td>
                        <td className="py-1 text-right">{formatScore(entry.score)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {isHighScore && !isSubmitted && (
                  <div className="text-center py-2">
                    <div 
                      className="text-yellow-300 mb-2"
                      style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '12px' }}
                    >
                      NEW HIGH SCORE!
                    </div>
                    <Button
                      onClick={submitScore}
                      disabled={isSubmitting}
                      className="w-full bg-yellow-700 hover:bg-yellow-600 text-white border border-yellow-500"
                      style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '12px' }}
                    >
                      {isSubmitting ? "SUBMITTING..." : "SUBMIT SCORE"}
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            <Button 
              onClick={onClose}
              className="w-full mt-4 bg-blue-700 hover:bg-blue-600 text-white"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              CLOSE
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaderboardModal;
