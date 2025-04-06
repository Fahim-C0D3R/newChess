// src/lib/stockfishWrapper.ts
export class StockfishWrapper {
  private stockfish: Worker;
  private resolveFunctions: Map<string, (value: any) => void> = new Map();
  
  constructor() {
    this.stockfish = new Worker('stockfish.js');
    this.stockfish.onmessage = this.handleMessage.bind(this);
    
    this.postMessage('uci');
    this.postMessage('setoption name Skill Level value 20');
    this.postMessage('setoption name Contempt value 0');
    this.postMessage('setoption name Threads value 4');
  }
  
  private handleMessage(e: MessageEvent) {
    const message = e.data;
    
    if (message.startsWith('bestmove')) {
      const match = message.match(/bestmove (\w+)/);
      if (match && this.resolveFunctions.has('bestmove')) {
        this.resolveFunctions.get('bestmove')!(match[1]);
      }
    }
    
    if (message.startsWith('info depth') && message.includes('score cp')) {
      const cpMatch = message.match(/score cp (-?\d+)/);
      const mateMatch = message.match(/score mate (-?\d+)/);
      
      if (cpMatch && this.resolveFunctions.has('eval')) {
        const cp = parseInt(cpMatch[1]);
        this.resolveFunctions.get('eval')!(cp / 100);
      } else if (mateMatch && this.resolveFunctions.has('eval')) {
        const mate = parseInt(mateMatch[1]);
        this.resolveFunctions.get('eval')!(mate > 0 ? 10 : -10);
      }
    }
  }
  
  private postMessage(command: string): Promise<any> {
    return new Promise((resolve) => {
      const id = Math.random().toString(36).substring(7);
      this.resolveFunctions.set(id, resolve);
      this.stockfish.postMessage(command);
    });
  }
  
  public async getBestMove(fen: string, depth = 18): Promise<string> {
    await this.postMessage(`position fen ${fen}`);
    await this.postMessage(`go depth ${depth}`);
    return this.postMessage('bestmove');
  }
  
  public async getEvaluation(fen: string, depth = 12): Promise<number> {
    await this.postMessage(`position fen ${fen}`);
    await this.postMessage(`go depth ${depth}`);
    return this.postMessage('eval');
  }
  
  public terminate() {
    this.stockfish.terminate();
  }
}
