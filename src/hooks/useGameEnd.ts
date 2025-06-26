
import { useEffect } from 'react';
import { Game } from '@/types/game';
import { GameStorage } from '@/lib/gameStorage';

export const useGameEnd = (game: Game | null) => {
  useEffect(() => {
    if (!game || game.status !== 'active') return;

    const checkWinConditions = () => {
      const alivePlayers = game.players.filter(p => p.isAlive !== false);
      const aliveImpostors = alivePlayers.filter(p => p.role === 'impostor');
      const aliveCrewmates = alivePlayers.filter(p => p.role === 'crewmate');

      // Impostors win if they equal or outnumber crewmates
      if (aliveImpostors.length >= aliveCrewmates.length && aliveImpostors.length > 0) {
        endGame('impostors', 'impostors_majority');
        return;
      }

      // Crewmates win if all impostors are eliminated
      if (aliveImpostors.length === 0) {
        endGame('crewmates', 'impostors_eliminated');
        return;
      }

      // Crewmates win if all tasks are completed
      const allTasks = game.devices.flatMap(device => device.tasks);
      const completedTasks = allTasks.filter(task => task.completed);
      if (allTasks.length > 0 && completedTasks.length === allTasks.length) {
        endGame('crewmates', 'tasks_completed');
        return;
      }
    };

    const endGame = (winner: 'crewmates' | 'impostors', reason: string) => {
      const updatedGame = {
        ...game,
        status: 'ended' as const,
        result: {
          winner,
          reason: reason as any,
          endedAt: Date.now()
        }
      };
      GameStorage.saveGame(updatedGame);
    };

    // Check win conditions periodically
    const interval = setInterval(checkWinConditions, 1000);
    checkWinConditions(); // Check immediately

    return () => clearInterval(interval);
  }, [game]);
};
