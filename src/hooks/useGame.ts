
import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, collection, addDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Game, Player, Device } from '@/types/game';
import { assignRoles } from '@/utils/gameUtils';

export const useGame = (gameId: string | null) => {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    const gameRef = doc(db, 'games', gameId);
    
    const unsubscribe = onSnapshot(
      gameRef,
      (doc) => {
        if (doc.exists()) {
          setGame({ id: doc.id, ...doc.data() } as Game);
          setError(null);
        } else {
          setError('Game not found');
          setGame(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching game:', err);
        setError('Failed to load game');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [gameId]);

  const addPlayer = async (player: Omit<Player, 'id'>) => {
    if (!game) return;
    
    const gameRef = doc(db, 'games', game.id);
    const newPlayer = { ...player, id: Math.random().toString(36).substr(2, 9) };
    await updateDoc(gameRef, {
      players: [...game.players, newPlayer]
    });
  };

  const removePlayer = async (playerId: string) => {
    if (!game) return;
    
    const gameRef = doc(db, 'games', game.id);
    await updateDoc(gameRef, {
      players: game.players.filter(p => p.id !== playerId)
    });
  };

  const addDevice = async (device: Omit<Device, 'id'>) => {
    if (!game) return;
    
    const gameRef = doc(db, 'games', game.id);
    const newDevice = { ...device, id: Math.random().toString(36).substr(2, 9) };
    await updateDoc(gameRef, {
      devices: [...game.devices, newDevice]
    });
  };

  const updateDevice = async (deviceId: string, updates: Partial<Device>) => {
    if (!game) return;
    
    const gameRef = doc(db, 'games', game.id);
    const updatedDevices = game.devices.map(device => 
      device.id === deviceId ? { ...device, ...updates } : device
    );
    await updateDoc(gameRef, {
      devices: updatedDevices
    });
  };

  const startGame = async () => {
    if (!game) return;
    
    const gameRef = doc(db, 'games', game.id);
    const playersWithRoles = assignRoles(game.players, game.impostorCount);
    
    await updateDoc(gameRef, {
      players: playersWithRoles,
      status: 'active',
      startedAt: Date.now()
    });
  };

  const resetGame = async () => {
    if (!game) return;
    
    const gameRef = doc(db, 'games', game.id);
    await updateDoc(gameRef, {
      players: [],
      devices: [],
      status: 'waiting',
      startedAt: null
    });
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
