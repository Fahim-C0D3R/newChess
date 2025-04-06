// src/components/AnalysisPanel.tsx
import { useEffect, useState } from 'react';
import EvaluationBar from './EvaluationBar';
import MoveList from './MoveList';

interface AnalysisPanelProps {
  analysis: any;
  currentMoveIndex: number;
  isAnalyzing: boolean;
}

export default function AnalysisPanel({ analysis, currentMoveIndex, isAnalyzing }: AnalysisPanelProps) {
  const [currentMoveAnalysis, setCurrentMoveAnalysis] = useState<any>(null);

  useEffect(() => {
    if (analysis && currentMoveIndex >= 0 && currentMoveIndex < analysis.moves.length) {
      setCurrentMoveAnalysis(analysis.moves[currentMoveIndex]);
    }
  }, [analysis, currentMoveIndex]);

  if (isAnalyzing) {
    return (
      <div className="analysis-panel">
        <h2>Analyzing game...</h2>
        <p>This may take a few moments depending on game length.</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="analysis-panel">
        <h2>Game Analysis</h2>
        <p>Enter a PGN to analyze your game.</p>
      </div>
    );
  }

  return (
    <div className="analysis-panel">
      <h2>Game Analysis</h2>
      
      <div className="current-move-analysis">
        {currentMoveAnalysis && (
          <>
            <EvaluationBar 
              evaluation={currentMoveAnalysis.evaluation}
              bestMove={currentMoveAnalysis.bestMove}
            />
            <div className="move-classification">
              <span className={`classification ${currentMoveAnalysis.classification}`}>
                {currentMoveAnalysis.classification}
              </span>
            </div>
          </>
        )}
      </div>
      
      <MoveList 
        moves={analysis.moves} 
        currentMoveIndex={currentMoveIndex}
      />
    </div>
  );
}
