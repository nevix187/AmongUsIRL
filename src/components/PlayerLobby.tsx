
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/hooks/useGame';
import { generatePlayerId } from '@/utils/gameUtils';
import { useToast } from '@/hooks/use-toast';
import { User, Users, Play, RotateCcw } from 'lucide-react';

interface PlayerLobbyProps {
  gameId: string;
  isHost?: boolean;
}

const PlayerLobby: React.FC<PlayerLobbyProps> = ({ gameId, isHost = false }) => {
  const { game, loading, addPlayer, removePlayer, startGame, resetGame } = useGame(gameId);
  const [playerName, setPlayerName] = useState('');
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleJoinGame = async () => {
    if (!playerName.trim() || !game) return;

    if (game.players.some(p => p.name === playerName.trim())) {
      toast({
        title: "Name Taken",
        description: "A player with this name already exists",
        variant: "destructive"
      });
      return;
    }

    const playerId = generatePlayerId();
    await addPlayer({
      name: playerName.trim(),
      joinedAt: Date.now()
    });
    
    setCurrentPlayerId(playerId);
    setPlayerName('');
    
    toast({
      title: "Joined Game!",
      description: `Welcome, ${playerName.trim()}!`
    });
  };

  const handleLeaveGame = async () => {
    if (!currentPlayerId) return;
    
    await removePlayer(currentPlayerId);
    setCurrentPlayerId(null);
    
    toast({
      title: "Left Game",
      description: "You have left the game"
    });
  };

  const handleStartGame = async () => {
    if (!game || game.players.length < 2) {
      toast({
        title: "Not Enough Players",
        description: "You need at least 2 players to start",
        variant: "destructive"
      });
      return;
    }

    await startGame();
    toast({
      title: "Game Started!",
      description: "Roles have been assigned. The game begins now!"
    });
  };

  const handleResetGame = async () => {
    await resetGame();
    setCurrentPlayerId(null);
    toast({
      title: "Game Reset",
      description: "The game has been reset"
    });
  };

  if (loading) {
    return <div className="text-center">Loading game...</div>;
  }

  if (!game) {
    return <div className="text-center">Game not found</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Game Lobby
          </CardTitle>
          <CardDescription>
            Game Code: <Badge variant="outline" className="ml-2">{game.gameCode}</Badge>
            {isHost && (
              <>
                <br />
                Device Code: <Badge variant="secondary" className="ml-2">{game.deviceCode}</Badge>
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!currentPlayerId ? (
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="player-name">Your Name</Label>
                <Input
                  id="player-name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
                />
              </div>
              <Button onClick={handleJoinGame} disabled={!playerName.trim()}>
                Join Game
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={handleLeaveGame}>
              Leave Game
            </Button>
          )}

          <div>
            <h3 className="font-semibold mb-2">Players ({game.players.length})</h3>
            <div className="space-y-2">
              {game.players.map((player) => (
                <div key={player.id} className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{player.name}</span>
                  {player.role && (
                    <Badge variant={player.role === 'impostor' ? 'destructive' : 'default'}>
                      {player.role}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isHost && (
            <div className="pt-4 border-t space-y-2">
              <Button 
                onClick={handleStartGame} 
                disabled={game.players.length < 2}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Game
              </Button>
              <Button 
                variant="outline" 
                onClick={handleResetGame}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Game
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerLobby;
