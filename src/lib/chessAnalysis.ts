// src/lib/chessAnalysis.ts
import { Chess } from 'chess.js';
import { StockfishWrapper } from './stockfishWrapper';

export async function analyzeGame(chessGame: Chess) {
  const stockfish = new StockfishWrapper();
  const moves = chessGame.history();
  const analysis = {
    moves: [] as any[],
    whiteAccuracy: 0,
    blackAccuracy: 0,
    averageAccuracy: 0,
    blunderCount: 0,
    mistakeCount: 0,
    inaccuracyCount: 0,
    opening: 'Unknown'
  };

  const tempGame = new Chess();
  
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const fenBefore = tempGame.fen();
    const isWhiteTurn = tempGame.turn() === 'w';
    
    // Get evaluation before move
    const beforeEval = await stockfish.getEvaluation(fenBefore);
    
    // Get best move and its evaluation
    const bestMove = await stockfish.getBestMove(fenBefore);
    tempGame.move(bestMove);
    const bestMoveEval = await stockfish.getEvaluation(tempGame.fen());
    tempGame.undo();
    
    // Make the actual move
    tempGame.move(move);
    const fenAfter = tempGame.fen();
    const afterEval = await stockfish.getEvaluation(fenAfter);
    
    // Calculate accuracy and classify move
    const accuracy = calculateMoveAccuracy(beforeEval, afterEval, bestMoveEval);
    const classification = classifyMove(beforeEval, afterEval, bestMoveEval, isWhiteTurn);
    
    // Update statistics
    if (isWhiteTurn) analysis.whiteAccuracy += accuracy;
    else analysis.blackAccuracy += accuracy;
    
    if (classification === 'blunder') analysis.blunderCount++;
    if (classification === 'mistake') analysis.mistakeCount++;
    if (classification === 'inaccuracy') analysis.inaccuracyCount++;
    
    analysis.moves.push({
      moveNumber: i + 1,
      move,
      fen: fenAfter,
      evaluation: afterEval,
      bestMove,
      bestMoveEval,
      classification,
      accuracy
    });
  }
  
  stockfish.terminate();
  
  analysis.whiteAccuracy = analysis.whiteAccuracy / Math.ceil(moves.length / 2);
  analysis.blackAccuracy = analysis.blackAccuracy / Math.floor(moves.length / 2);
  analysis.averageAccuracy = (analysis.whiteAccuracy + analysis.blackAccuracy) / 2;
  analysis.opening = detectOpening(chessGame.history());
  
  return analysis;
}

function calculateMoveAccuracy(beforeEval: number, afterEval: number, bestMoveEval: number): number {
  const maxPossible = Math.abs(beforeEval - bestMoveEval);
  const actual = Math.abs(beforeEval - afterEval);
  
  if (maxPossible < 0.1) return 100;
  
  const ratio = actual / maxPossible;
  return Math.max(0, 100 - (ratio * 100));
}

function classifyMove(
  beforeEval: number,
  afterEval: number,
  bestMoveEval: number,
  isPlayerTurn: boolean
): string {
  const centipawnLoss = Math.abs(bestMoveEval - afterEval) * 100;
  
  if (centipawnLoss > 300) return 'blunder';
  if (centipawnLoss > 150) return 'mistake';
  if (centipawnLoss > 50) return 'inaccuracy';
  if (!isPlayerTurn) return 'good';
  if (centipawnLoss < 10 && Math.abs(afterEval - beforeEval) > 1.5) return 'brilliant';
  if (centipawnLoss < 20) return 'great';
  return 'good';
}

function detectOpening(moves: string[]): string {
  if (moves.length < 3) return 'Starting Position';
  
  const firstMoves = moves.slice(0, 3).join(' ');
  
  if (firstMoves.includes('e4 e5 Nf3 Nc6 Bb5')) return 'Ruy Lopez';
  if (firstMoves.includes('e4 c5')) return 'Sicilian Defense';
  if (firstMoves.includes('d4 d5')) return "Queen's Gambit";
  if (firstMoves.includes('e4 e5 Nf3 Nf6')) return "Petrov's Defense";
  
  return 'Unknown Opening';
}
