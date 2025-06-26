import { useState, useEffect } from 'react';
import { Game, Player, Device } from '@/types/game';
import { assignRoles } from '@/utils/gameUtils';
import { EnhancedGameStorage } from '@/lib/enhancedStorage';

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
      try {
        const gameData = EnhancedGameStorage.getGame(gameId);
        if (gameData) {
          setGame(gameData);
          setError(null);
        } else {
          setError('Game not found');
          setGame(null);
        }
      } catch (err) {
        setError('Failed to load game');
        setGame(null);
      }
      setLoading(false);
    };

    loadGame();

    // Listen for changes
    const unsubscribe = EnhancedGameStorage.addListener((games) => {
      try {
        const gameData = games[gameId];
        if (gameData) {
          setGame(gameData);
          setError(null);
        } else {
          setError('Game not found');
          setGame(null);
        }
      } catch (err) {
        setError('Failed to update game');
      }
    });

    return unsubscribe;
  }, [gameId]);

  const addPlayer = async (player: Omit<Player, 'id'>) => {
    if (!game) return;
    
    try {
      const newPlayer = { ...player, id: Math.random().toString(36).substr(2, 9) };
      const updatedGame = {
        ...game,
        players: [...game.players, newPlayer]
      };
      EnhancedGameStorage.saveGame(updatedGame);
    } catch (error) {
      console.error('Error adding player:', error);
      throw error;
    }
  };

  const removePlayer = async (playerId: string) => {
    if (!game) return;
    
    try {
      const updatedGame = {
        ...game,
        players: game.players.filter(p => p.id !== playerId)
      };
      EnhancedGameStorage.saveGame(updatedGame);
    } catch (error) {
      console.error('Error removing player:', error);
      throw error;
    }
  };

  const addDevice = async (device: Omit<Device, 'id'>) => {
    if (!game) return;
    
    try {
      const newDevice = { ...device, id: Math.random().toString(36).substr(2, 9) };
      const updatedGame = {
        ...game,
        devices: [...game.devices, newDevice]
      };
      EnhancedGameStorage.saveGame(updatedGame);
    } catch (error) {
      console.error('Error adding device:', error);
      throw error;
    }
  };

  const updateDevice = async (deviceId: string, updates: Partial<Device>) => {
    if (!game) return;
    
    try {
      const updatedDevices = game.devices.map(device => 
        device.id === deviceId ? { ...device, ...updates } : device
      );
      const updatedGame = {
        ...game,
        devices: updatedDevices
      };
      EnhancedGameStorage.saveGame(updatedGame);
    } catch (error) {
      console.error('Error updating device:', error);
      throw error;
    }
  };

  const startGame = async () => {
    if (!game) return;
    
    try {
      const playersWithRoles = assignRoles(game.players, game.impostorCount);
      const updatedGame = {
        ...game,
        players: playersWithRoles.map(p => ({ ...p, isAlive: true })),
        status: 'active' as const,
        startedAt: Date.now()
      };
      EnhancedGameStorage.saveGame(updatedGame);
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  };

  const resetGame = async () => {
    if (!game) return;
    
    try {
      const updatedGame = {
        ...game,
        players: [],
        devices: [],
        status: 'waiting' as const,
        startedAt: undefined,
        meeting: undefined,
        result: undefined
      };
      EnhancedGameStorage.saveGame(updatedGame);
    } catch (error) {
      console.error('Error resetting game:', error);
      throw error;
    }
  };

  const endGame = async () => {
    if (!game) return;
    
    try {
      const updatedGame = {
        ...game,
        status: 'ended' as const,
        result: {
          winner: 'crewmates' as const,
          reason: 'manual_end' as any,
          endedAt: Date.now()
        }
      };
      EnhancedGameStorage.saveGame(updatedGame);
    } catch (error) {
      console.error('Error ending game:', error);
      throw error;
    }
  };

  const callEmergencyMeeting = async (reporterId: string, type: 'emergency' | 'dead_body', reportedPlayerId?: string) => {
    if (!game) return;

    try {
      const meetingId = Math.random().toString(36).substr(2, 9);
      const now = Date.now();
      
      const meeting = {
        id: meetingId,
        type,
        reporterId,
        reportedPlayerId,
        discussionEndsAt: now + (game.settings?.discussionTime || 100) * 1000,
        votingEndsAt: now + (game.settings?.discussionTime || 100) * 1000 + (game.settings?.votingTime || 40) * 1000,
        votes: [],
        phase: 'discussion' as const,
        active: true
      };

      const updatedGame = {
        ...game,
        status: 'meeting' as const,
        meeting
      };
      EnhancedGameStorage.saveGame(updatedGame);
    } catch (error) {
      console.error('Error calling emergency meeting:', error);
      throw error;
    }
  };

  const submitVote = async (meetingId: string, targetId: string) => {
    if (!game?.meeting || game.meeting.id !== meetingId) return;

    try {
      const vote = {
        playerId: game.meeting.reporterId,
        targetId,
        timestamp: Date.now()
      };

      const updatedVotes = [...game.meeting.votes, vote];
      const updatedMeeting = {
        ...game.meeting,
        votes: updatedVotes
      };

      const updatedGame = {
        ...game,
        meeting: updatedMeeting
      };
      EnhancedGameStorage.saveGame(updatedGame);
    } catch (error) {
      console.error('Error submitting vote:', error);
      throw error;
    }
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
    resetGame,
    endGame,
    callEmergencyMeeting,
    submitVote
  };
};
