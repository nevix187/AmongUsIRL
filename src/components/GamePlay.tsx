
import React, { useState, useEffect } from 'react';
import { useGame } from '@/hooks/useGame';
import { useGameEnd } from '@/hooks/useGameEnd';
import { GameStorage } from '@/lib/gameStorage';
import CrewmateView from './CrewmateView';
import ImpostorView from './ImpostorView';
import EmergencyMeeting from './EmergencyMeeting';
import GameEndScreen from './GameEndScreen';
import AdminPanel from './AdminPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skull } from 'lucide-react';

interface GamePlayProps {
  gameId: string;
  playerId: string;
  isHost?: boolean;
}

const GamePlay: React.FC<GamePlayProps> = ({ gameId, playerId, isHost = false }) => {
  const { game, loading } = useGame(gameId);
  const [currentPlayer, setCurrentPlayer] = useState<any>(null);

  // Use the game end detection hook
  useGameEnd(game);

  useEffect(() => {
    if (game) {
      const player = game.players.find(p => p.id === playerId);
      setCurrentPlayer(player);
    }
  }, [game, playerId]);

  const handleNewGame = () => {
    // Navigate back to game creation
    window.location.href = '/';
  };

  if (loading) {
    return <div className="text-center">Loading game...</div>;
  }

  if (!game) {
    return <div className="text-center">Game not found</div>;
  }

  // Show admin panel for host
  if (isHost) {
    if (game.status === 'ended') {
      return <GameEndScreen gameId={gameId} onNewGame={handleNewGame} />;
    }
    return <AdminPanel gameId={gameId} />;
  }

  // Show end screen for ended games
  if (game.status === 'ended') {
    return <GameEndScreen gameId={gameId} onNewGame={handleNewGame} />;
  }

  // Show meeting screen during meetings
  if (game.status === 'meeting' && game.meeting?.active) {
    return <EmergencyMeeting gameId={gameId} playerId={playerId} />;
  }

  if (game.status !== 'active') {
    return <div className="text-center">Game not active</div>;
  }

  if (!currentPlayer) {
    return <div className="text-center">Player not found in game</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Among Us IRL - Game Active</span>
            <Badge variant={currentPlayer.role === 'impostor' ? 'destructive' : 'default'}>
              {currentPlayer.role === 'impostor' ? 'IMPOSTOR' : 'CREWMATE'}
            </Badge>
            {currentPlayer.isAlive === false && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Skull className="h-3 w-3" />
                DEAD
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Welcome, {currentPlayer.name}! Your role: <strong>{currentPlayer.role}</strong>
            {currentPlayer.isAlive === false && <span className="text-red-600 ml-2">(You are dead)</span>}
          </p>
        </CardContent>
      </Card>

      {currentPlayer.role === 'impostor' ? (
        <ImpostorView gameId={gameId} playerId={playerId} />
      ) : (
        <CrewmateView gameId={gameId} playerId={playerId} />
      )}
    </div>
  );
};

export default GamePlay;
