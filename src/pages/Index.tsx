
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import GameCreation from '@/components/GameCreation';
import GameJoin from '@/components/GameJoin';
import PlayerLobby from '@/components/PlayerLobby';
import DeviceManager from '@/components/DeviceManager';
import GamePlay from '@/components/GamePlay';
import AdminPanel from '@/components/AdminPanel';
import { EnhancedGameStorage } from '@/lib/enhancedStorage';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

type ViewMode = 'home' | 'create' | 'join' | 'lobby' | 'device' | 'gameplay' | 'admin';

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if there's an active game on mount
  useEffect(() => {
    const storedGameId = EnhancedGameStorage.getCurrentGameId();
    const storedPlayerId = localStorage.getItem('current_player_id');
    const storedIsAdmin = localStorage.getItem('is_admin') === 'true';
    
    if (storedGameId) {
      const game = EnhancedGameStorage.getGame(storedGameId);
      if (game) {
        setCurrentGameId(storedGameId);
        setIsAdmin(storedIsAdmin);
        
        if (storedIsAdmin) {
          setViewMode('admin');
        } else if (storedPlayerId) {
          setCurrentPlayerId(storedPlayerId);
          if (game.status === 'active') {
            setViewMode('gameplay');
          } else {
            setViewMode('lobby');
          }
        }
      }
    }
  }, []);

  // Listen for game status changes to transition to gameplay
  useEffect(() => {
    if (!currentGameId) return;

    const unsubscribe = EnhancedGameStorage.addListener((games) => {
      const game = games[currentGameId];
      if (game && game.status === 'active' && viewMode === 'lobby') {
        setViewMode('gameplay');
      }
    });

    return unsubscribe;
  }, [currentGameId, viewMode]);

  const handleGameCreated = (gameId: string, isAdminUser: boolean) => {
    setCurrentGameId(gameId);
    setIsAdmin(isAdminUser);
    setViewMode(isAdminUser ? 'admin' : 'lobby');
    EnhancedGameStorage.setCurrentGameId(gameId);
    localStorage.setItem('is_admin', isAdminUser.toString());
  };

  const handleGameJoined = (gameId: string, type: 'player' | 'device', playerId?: string) => {
    setCurrentGameId(gameId);
    setIsAdmin(false);
    
    if (type === 'player' && playerId) {
      setCurrentPlayerId(playerId);
      localStorage.setItem('current_player_id', playerId);
    }
    
    setViewMode(type === 'player' ? 'lobby' : 'device');
    EnhancedGameStorage.setCurrentGameId(gameId);
    localStorage.setItem('is_admin', 'false');
  };

  const goHome = () => {
    setViewMode('home');
    setCurrentGameId(null);
    setCurrentPlayerId(null);
    setIsAdmin(false);
    EnhancedGameStorage.setCurrentGameId(null);
    localStorage.removeItem('current_player_id');
    localStorage.removeItem('is_admin');
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
              className="w-full text-lg py-6 flex items-center gap-2"
              size="lg"
            >
              <Shield className="h-5 w-5" />
              Create New Game (Admin Only)
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
                <p><strong>Admin Password:</strong> Required to create games</p>
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

  if (viewMode === 'admin' && currentGameId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-purple-600 to-blue-600 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={goHome} className="mb-4">
              ← Back to Home
            </Button>
            <Badge variant="default" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              ADMIN
            </Badge>
          </div>
          <AdminPanel gameId={currentGameId} />
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
          <PlayerLobby gameId={currentGameId} isHost={false} />
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
