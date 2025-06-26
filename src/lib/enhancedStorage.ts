
import { Game, Player, Device } from '@/types/game';

const GAMES_KEY = 'among_us_irl_games_v2';
const CURRENT_GAME_KEY = 'among_us_irl_current_game_v2';
const BACKUP_KEY = 'among_us_irl_backup';

export class EnhancedGameStorage {
  private static listeners: Array<(games: Record<string, Game>) => void> = [];
  private static backupInterval: NodeJS.Timeout | null = null;

  static initialize() {
    // Create periodic backups
    this.backupInterval = setInterval(() => {
      this.createBackup();
    }, 30000); // Backup every 30 seconds

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      this.createBackup();
    });
  }

  static getAllGames(): Record<string, Game> {
    try {
      const stored = localStorage.getItem(GAMES_KEY);
      const games = stored ? JSON.parse(stored) : {};
      
      // Validate game structure
      Object.keys(games).forEach(gameId => {
        if (!this.validateGame(games[gameId])) {
          console.warn(`Invalid game structure detected for ${gameId}, removing...`);
          delete games[gameId];
        }
      });
      
      return games;
    } catch (error) {
      console.error('Error loading games:', error);
      return this.restoreFromBackup();
    }
  }

  static getGame(gameId: string): Game | null {
    const games = this.getAllGames();
    return games[gameId] || null;
  }

  static saveGame(game: Game): void {
    try {
      if (!this.validateGame(game)) {
        throw new Error('Invalid game structure');
      }

      const games = this.getAllGames();
      // Update the createdAt timestamp to track last modification
      const updatedGame = { ...game, createdAt: Date.now() };
      games[game.id] = updatedGame;
      
      localStorage.setItem(GAMES_KEY, JSON.stringify(games));
      this.notifyListeners(games);
      
      // Auto-cleanup old games (older than 24 hours)
      this.cleanupOldGames(games);
    } catch (error) {
      console.error('Error saving game:', error);
      throw error;
    }
  }

  static deleteGame(gameId: string): void {
    const games = this.getAllGames();
    delete games[gameId];
    localStorage.setItem(GAMES_KEY, JSON.stringify(games));
    this.notifyListeners(games);
  }

  static findGameByCode(code: string, codeType: 'gameCode' | 'deviceCode'): string | null {
    const games = this.getAllGames();
    const upperCode = code.toUpperCase();
    
    for (const [gameId, game] of Object.entries(games)) {
      if (game[codeType] === upperCode) {
        return gameId;
      }
    }
    return null;
  }

  static createGame(gameData: Omit<Game, 'id'>): string {
    const gameId = Math.random().toString(36).substr(2, 9);
    const game: Game = { 
      ...gameData, 
      id: gameId
    };
    this.saveGame(game);
    return gameId;
  }

  static addListener(listener: (games: Record<string, Game>) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners(games: Record<string, Game>): void {
    this.listeners.forEach(listener => {
      try {
        listener(games);
      } catch (error) {
        console.error('Error in game storage listener:', error);
      }
    });
  }

  static setCurrentGameId(gameId: string | null): void {
    if (gameId) {
      localStorage.setItem(CURRENT_GAME_KEY, gameId);
    } else {
      localStorage.removeItem(CURRENT_GAME_KEY);
    }
  }

  static getCurrentGameId(): string | null {
    return localStorage.getItem(CURRENT_GAME_KEY);
  }

  private static validateGame(game: any): game is Game {
    return game &&
           typeof game.id === 'string' &&
           typeof game.gameCode === 'string' &&
           typeof game.deviceCode === 'string' &&
           Array.isArray(game.players) &&
           Array.isArray(game.devices) &&
           typeof game.status === 'string' &&
           typeof game.createdAt === 'number';
  }

  private static createBackup(): void {
    try {
      const games = this.getAllGames();
      const backup = {
        games,
        timestamp: Date.now(),
        version: '2.0'
      };
      localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  }

  private static restoreFromBackup(): Record<string, Game> {
    try {
      const backup = localStorage.getItem(BACKUP_KEY);
      if (backup) {
        const parsed = JSON.parse(backup);
        if (parsed.games) {
          console.log('Restored games from backup');
          return parsed.games;
        }
      }
    } catch (error) {
      console.error('Error restoring from backup:', error);
    }
    return {};
  }

  private static cleanupOldGames(games: Record<string, Game>): void {
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    let cleaned = false;

    Object.keys(games).forEach(gameId => {
      const game = games[gameId];
      const lastActivity = game.createdAt;
      
      if (lastActivity < twentyFourHoursAgo && game.status === 'ended') {
        delete games[gameId];
        cleaned = true;
      }
    });

    if (cleaned) {
      localStorage.setItem(GAMES_KEY, JSON.stringify(games));
      console.log('Cleaned up old games');
    }
  }

  static cleanup(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
  }
}

// Initialize enhanced storage
EnhancedGameStorage.initialize();

// Listen for storage changes from other tabs
window.addEventListener('storage', (e) => {
  if (e.key === GAMES_KEY) {
    const games = e.newValue ? JSON.parse(e.newValue) : {};
    EnhancedGameStorage['notifyListeners'](games);
  }
});
