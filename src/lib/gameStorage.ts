
import { Game, Player, Device } from '@/types/game';

const GAMES_KEY = 'among_us_irl_games';
const CURRENT_GAME_KEY = 'among_us_irl_current_game';

export class GameStorage {
  private static listeners: Array<(games: Record<string, Game>) => void> = [];

  static getAllGames(): Record<string, Game> {
    const stored = localStorage.getItem(GAMES_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  static getGame(gameId: string): Game | null {
    const games = this.getAllGames();
    return games[gameId] || null;
  }

  static saveGame(game: Game): void {
    const games = this.getAllGames();
    games[game.id] = game;
    localStorage.setItem(GAMES_KEY, JSON.stringify(games));
    this.notifyListeners(games);
  }

  static deleteGame(gameId: string): void {
    const games = this.getAllGames();
    delete games[gameId];
    localStorage.setItem(GAMES_KEY, JSON.stringify(games));
    this.notifyListeners(games);
  }

  static findGameByCode(code: string, codeType: 'gameCode' | 'deviceCode'): string | null {
    const games = this.getAllGames();
    for (const [gameId, game] of Object.entries(games)) {
      if (game[codeType] === code.toUpperCase()) {
        return gameId;
      }
    }
    return null;
  }

  static createGame(gameData: Omit<Game, 'id'>): string {
    const gameId = Math.random().toString(36).substr(2, 9);
    const game: Game = { ...gameData, id: gameId };
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
    this.listeners.forEach(listener => listener(games));
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
}

// Listen for storage changes from other tabs
window.addEventListener('storage', (e) => {
  if (e.key === GAMES_KEY) {
    const games = e.newValue ? JSON.parse(e.newValue) : {};
    GameStorage['notifyListeners'](games);
  }
});
