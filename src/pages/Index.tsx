
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import GameCreation from '@/components/GameCreation';
import GameJoin from '@/components/GameJoin';
import PlayerLobby from '@/components/PlayerLobby';
import DeviceManager from '@/components/DeviceManager';

type ViewMode = 'home' | 'create' | 'join' | 'lobby' | 'device';

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);

  const handleGameCreated = (gameId: string) => {
    setCurrentGameId(gameId);
    setIsHost(true);
    setViewMode('lobby');
  };

  const handleGameJoined = (gameId: string, type: 'player' | 'device') => {
    setCurrentGameId(gameId);
    setIsHost(false);
    setViewMode(type === 'player' ? 'lobby' : 'device');
  };

  const goHome = () => {
    setViewMode('home');
    setCurrentGameId(null);
    setIsHost(false);
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
                  Note: You'll need Firebase configuration to use this app
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

  return null;
};

export default Index;
