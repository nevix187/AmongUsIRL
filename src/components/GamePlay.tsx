
import React, { useState, useEffect } from 'react';
import { useGame } from '@/hooks/useGame';
import { GameStorage } from '@/lib/gameStorage';
import CrewmateView from './CrewmateView';
import ImpostorView from './ImpostorView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skull } from 'lucide-react';

interface GamePlayProps {
  gameId: string;
  playerId: string;
}

const GamePlay: React.FC<GamePlayProps> = ({ gameId, playerId }) => {
  const { game, loading } = useGame(gameId);
  const [currentPlayer, setCurrentPlayer] = useState<any>(null);

  useEffect(() => {
    if (game) {
      const player = game.players.find(p => p.id === playerId);
      setCurrentPlayer(player);
    }
  }, [game, playerId]);

  if (loading) {
    return <div className="text-center">Loading game...</div>;
  }

  if (!game || game.status !== 'active') {
    return <div className="text-center">Game not found or not active</div>;
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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Welcome, {currentPlayer.name}! Your role: <strong>{currentPlayer.role}</strong>
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
