
import { useState, useEffect } from 'react';
import { Game, Player, Device } from '@/types/game';
import { assignRoles } from '@/utils/gameUtils';
import { GameStorage } from '@/lib/gameStorage';

export const useGame = (gameId: string | null) => {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    // Initial load
    const loadGame = () => {
      const gameData = GameStorage.getGame(gameId);
      if (gameData) {
        setGame(gameData);
        setError(null);
      } else {
        setError('Game not found');
        setGame(null);
      }
      setLoading(false);
    };

    loadGame();

    // Listen for changes
    const unsubscribe = GameStorage.addListener((games) => {
      const gameData = games[gameId];
      if (gameData) {
        setGame(gameData);
        setError(null);
      } else {
        setError('Game not found');
        setGame(null);
      }
    });

    return unsubscribe;
  }, [gameId]);

  const addPlayer = async (player: Omit<Player, 'id'>) => {
    if (!game) return;
    
    const newPlayer = { ...player, id: Math.random().toString(36).substr(2, 9) };
    const updatedGame = {
      ...game,
      players: [...game.players, newPlayer]
    };
    GameStorage.saveGame(updatedGame);
  };

  const removePlayer = async (playerId: string) => {
    if (!game) return;
    
    const updatedGame = {
      ...game,
      players: game.players.filter(p => p.id !== playerId)
    };
    GameStorage.saveGame(updatedGame);
  };

  const addDevice = async (device: Omit<Device, 'id'>) => {
    if (!game) return;
    
    const newDevice = { ...device, id: Math.random().toString(36).substr(2, 9) };
    const updatedGame = {
      ...game,
      devices: [...game.devices, newDevice]
    };
    GameStorage.saveGame(updatedGame);
  };

  const updateDevice = async (deviceId: string, updates: Partial<Device>) => {
    if (!game) return;
    
    const updatedDevices = game.devices.map(device => 
      device.id === deviceId ? { ...device, ...updates } : device
    );
    const updatedGame = {
      ...game,
      devices: updatedDevices
    };
    GameStorage.saveGame(updatedGame);
  };

  const startGame = async () => {
    if (!game) return;
    
    const playersWithRoles = assignRoles(game.players, game.impostorCount);
    const updatedGame = {
      ...game,
      players: playersWithRoles,
      status: 'active' as const,
      startedAt: Date.now()
    };
    GameStorage.saveGame(updatedGame);
  };

  const resetGame = async () => {
    if (!game) return;
    
    const updatedGame = {
      ...game,
      players: [],
      devices: [],
      status: 'waiting' as const,
      startedAt: undefined
    };
    GameStorage.saveGame(updatedGame);
  };

  return {
    game,
    loading,
    error,
    addPlayer,
    removePlayer,
    addDevice,
    updateDevice,
    startGame,
    resetGame
  };
};
