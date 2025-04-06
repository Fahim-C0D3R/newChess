// src/App.tsx
import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import ChessBoard from './components/ChessBoard';
import AnalysisPanel from './components/AnalysisPanel';
import { analyzeGame } from './lib/chessAnalysis';
import './App.css';

function App() {
  const [game, setGame] = useState(new Chess());
  const [analysis, setAnalysis] = useState<any>(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const loadGameFromPgn = (pgn: string) => {
    const newGame = new Chess();
    newGame.loadPgn(pgn);
    setGame(newGame);
    setCurrentMoveIndex(newGame.history().length);
    analyzeGame(newGame);
  };

  const analyzeGame = async (chessGame: Chess) => {
    setIsAnalyzing(true);
    const result = await analyzeGame(chessGame);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="app">
      <h1>Chess Game Analyzer</h1>
      
      <div className="game-container">
        <ChessBoard 
          game={game} 
          currentMoveIndex={currentMoveIndex}
          onMoveChange={setCurrentMoveIndex}
        />
        
        <div className="panel-container">
          <AnalysisPanel 
            analysis={analysis} 
            currentMoveIndex={currentMoveIndex}
            isAnalyzing={isAnalyzing}
          />
          
          <div className="pgn-input">
            <textarea 
              placeholder="Paste PGN here..."
              onChange={(e) => loadGameFromPgn(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
