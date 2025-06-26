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
      players: playersWithRoles.map(p => ({ ...p, isAlive: true })),
      status: 'active' as const,
      startedAt: Date.now(),
      settings: {
        discussionTime: 100,
        votingTime: 40,
        maxMeetings: 3
      }
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
      startedAt: undefined,
      meeting: undefined,
      result: undefined
    };
    GameStorage.saveGame(updatedGame);
  };

  const endGame = async () => {
    if (!game) return;
    
    const updatedGame = {
      ...game,
      status: 'ended' as const,
      result: {
        winner: 'crewmates' as const,
        reason: 'manual_end' as any,
        endedAt: Date.now()
      }
    };
    GameStorage.saveGame(updatedGame);
  };

  const callEmergencyMeeting = async (reporterId: string, type: 'emergency' | 'dead_body', reportedPlayerId?: string) => {
    if (!game) return;

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
    GameStorage.saveGame(updatedGame);
  };

  const submitVote = async (meetingId: string, targetId: string) => {
    if (!game?.meeting || game.meeting.id !== meetingId) return;

    const vote = {
      playerId: game.meeting.reporterId, // This should be the current player
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
    resetGame,
    endGame,
    callEmergencyMeeting,
    submitVote
  };
};
