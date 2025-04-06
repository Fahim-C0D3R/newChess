// src/components/ChessBoard.tsx
import { ChessInstance } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useEffect, useState } from 'react';

interface ChessBoardProps {
  game: ChessInstance;
  currentMoveIndex: number;
  onMoveChange: (index: number) => void;
}

export default function ChessBoard({ game, currentMoveIndex, onMoveChange }: ChessBoardProps) {
  const [fen, setFen] = useState(game.fen());

  useEffect(() => {
    const tempGame = new (Chess as any)();
    const moves = game.history();
    
    for (let i = 0; i < currentMoveIndex && i < moves.length; i++) {
      tempGame.move(moves[i]);
    }
    
    setFen(tempGame.fen());
  }, [game, currentMoveIndex]);

  return (
    <div className="chess-board">
      <Chessboard 
        position={fen}
        boardWidth={500}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
        }}
        customDarkSquareStyle={{ backgroundColor: '#779556' }}
        customLightSquareStyle={{ backgroundColor: '#ebecd0' }}
      />
    </div>
  );
}
