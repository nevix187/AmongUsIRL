
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import GameCreation from '@/components/GameCreation';
import GameJoin from '@/components/GameJoin';
import PlayerLobby from '@/components/PlayerLobby';
import DeviceManager from '@/components/DeviceManager';
import GamePlay from '@/components/GamePlay';
import { GameStorage } from '@/lib/gameStorage';

type ViewMode = 'home' | 'create' | 'join' | 'lobby' | 'device' | 'gameplay';

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);

  // Check if there's an active game on mount
  useEffect(() => {
    const storedGameId = GameStorage.getCurrentGameId();
    const storedPlayerId = localStorage.getItem('current_player_id');
    
    if (storedGameId && storedPlayerId) {
      const game = GameStorage.getGame(storedGameId);
      if (game) {
        setCurrentGameId(storedGameId);
        setCurrentPlayerId(storedPlayerId);
        
        if (game.status === 'active') {
          setViewMode('gameplay');
        } else {
          setViewMode('lobby');
        }
      }
    }
  }, []);

  // Listen for game status changes to transition to gameplay
  useEffect(() => {
    if (!currentGameId) return;

    const unsubscribe = GameStorage.addListener((games) => {
      const game = games[currentGameId];
      if (game && game.status === 'active' && viewMode === 'lobby') {
        setViewMode('gameplay');
      }
    });

    return unsubscribe;
  }, [currentGameId, viewMode]);

  const handleGameCreated = (gameId: string) => {
    setCurrentGameId(gameId);
    setIsHost(true);
    setViewMode('lobby');
    GameStorage.setCurrentGameId(gameId);
  };

  const handleGameJoined = (gameId: string, type: 'player' | 'device', playerId?: string) => {
    setCurrentGameId(gameId);
    setIsHost(false);
    
    if (type === 'player' && playerId) {
      setCurrentPlayerId(playerId);
      localStorage.setItem('current_player_id', playerId);
    }
    
    setViewMode(type === 'player' ? 'lobby' : 'device');
    GameStorage.setCurrentGameId(gameId);
  };

  const goHome = () => {
    setViewMode('home');
    setCurrentGameId(null);
    setCurrentPlayerId(null);
    setIsHost(false);
    GameStorage.setCurrentGameId(null);
    localStorage.removeItem('current_player_id');
  };

  if (viewMode === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-purple-600 to-blue-600 flex items-center justify-center p-4">
        <div className="space-y-6 w-full max-w-md">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Among Us IRL</CardTitle>
              <CardDescription className="text-lg">
                Digital backbone for real-world Among Us games
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-3">
            <Button 
              onClick={() => setViewMode('create')}
              className="w-full text-lg py-6"
              size="lg"
            >
              Create New Game
            </Button>
            
            <Button 
              onClick={() => setViewMode('join')}
              variant="outline"
              className="w-full text-lg py-6"
              size="lg"
            >
              Join Existing Game
            </Button>
          </div>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="text-sm space-y-2">
                <p><strong>Game Codes (S-prefix):</strong> For players to join</p>
                <p><strong>Device Codes (G-prefix):</strong> For task stations</p>
                <p className="text-muted-foreground">
                  Works entirely offline with localStorage
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (viewMode === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-purple-600 to-blue-600 flex items-center justify-center p-4">
        <div className="space-y-4 w-full max-w-md">
          <Button variant="outline" onClick={goHome} className="mb-4">
            ← Back to Home
          </Button>
          <GameCreation onGameCreated={handleGameCreated} />
        </div>
      </div>
    );
  }

  if (viewMode === 'join') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-purple-600 to-blue-600 flex items-center justify-center p-4">
        <div className="space-y-4 w-full max-w-md">
          <Button variant="outline" onClick={goHome} className="mb-4">
            ← Back to Home
          </Button>
          <GameJoin onGameJoined={handleGameJoined} />
        </div>
      </div>
    );
  }

  if (viewMode === 'lobby' && currentGameId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-purple-600 to-blue-600 p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <Button variant="outline" onClick={goHome} className="mb-4">
            ← Back to Home
          </Button>
          <PlayerLobby gameId={currentGameId} isHost={isHost} />
        </div>
      </div>
    );
  }

  if (viewMode === 'device' && currentGameId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-purple-600 to-blue-600 p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <Button variant="outline" onClick={goHome} className="mb-4">
            ← Back to Home
          </Button>
          <DeviceManager gameId={currentGameId} />
        </div>
      </div>
    );
  }

  if (viewMode === 'gameplay' && currentGameId && currentPlayerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-purple-600 to-blue-600 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <Button variant="outline" onClick={goHome} className="mb-4">
            ← End Game & Go Home
          </Button>
          <GamePlay gameId={currentGameId} playerId={currentPlayerId} />
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
