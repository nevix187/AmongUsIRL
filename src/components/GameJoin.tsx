
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GameStorage } from '@/lib/gameStorage';
import { generatePlayerId } from '@/utils/gameUtils';
import { useToast } from '@/hooks/use-toast';

interface GameJoinProps {
  onGameJoined: (gameId: string, type: 'player' | 'device', playerId?: string) => void;
}

const GameJoin: React.FC<GameJoinProps> = ({ onGameJoined }) => {
  const [gameCode, setGameCode] = useState('');
  const [deviceCode, setDeviceCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [joining, setJoining] = useState(false);
  const { toast } = useToast();

  const joinAsPlayer = async () => {
    if (!gameCode.trim() || !playerName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both game code and your name",
        variant: "destructive"
      });
      return;
    }

    setJoining(true);
    try {
      const gameId = GameStorage.findGameByCode(gameCode.trim(), 'gameCode');
      if (!gameId) {
        toast({
          title: "Game Not Found",
          description: "Invalid game code. Please check and try again.",
          variant: "destructive"
        });
        return;
      }

      const game = GameStorage.getGame(gameId);
      if (!game) {
        toast({
          title: "Game Not Found",
          description: "Game no longer exists",
          variant: "destructive"
        });
        return;
      }

      if (game.status !== 'waiting') {
        toast({
          title: "Game In Progress",
          description: "Cannot join a game that has already started",
          variant: "destructive"
        });
        return;
      }

      if (game.players.some(p => p.name === playerName.trim())) {
        toast({
          title: "Name Taken",
          description: "A player with this name already exists",
          variant: "destructive"
        });
        return;
      }

      const playerId = generatePlayerId();
      const newPlayer = {
        id: playerId,
        name: playerName.trim(),
        joinedAt: Date.now()
      };

      const updatedGame = {
        ...game,
        players: [...game.players, newPlayer]
      };

      GameStorage.saveGame(updatedGame);
      
      toast({
        title: "Joined Game!",
        description: `Welcome to the game, ${playerName.trim()}!`
      });
      
      onGameJoined(gameId, 'player', playerId);
    } catch (error) {
      console.error('Error joining game:', error);
      toast({
        title: "Error",
        description: "Failed to join game. Please try again.",
        variant: "destructive"
      });
    } finally {
      setJoining(false);
    }
  };

  const joinAsDevice = async () => {
    if (!deviceCode.trim()) {
      toast({
        title: "Missing Device Code",
        description: "Please enter the device code",
        variant: "destructive"
      });
      return;
    }

    setJoining(true);
    try {
      const gameId = GameStorage.findGameByCode(deviceCode.trim(), 'deviceCode');
      if (!gameId) {
        toast({
          title: "Invalid Device Code",
          description: "Device code not found. Please check and try again.",
          variant: "destructive"
        });
        return;
      }

      const game = GameStorage.getGame(gameId);
      if (!game) {
        toast({
          title: "Game Not Found",
          description: "Game no longer exists",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Device Connected!",
        description: "You can now configure this device"
      });
      
      onGameJoined(gameId, 'device');
    } catch (error) {
      console.error('Error connecting device:', error);
      toast({
        title: "Error",
        description: "Failed to connect device. Please try again.",
        variant: "destructive"
      });
    } finally {
      setJoining(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Join Game</CardTitle>
        <CardDescription>
          Join as a player or connect a task device
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="player" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="player">Player</TabsTrigger>
            <TabsTrigger value="device">Device</TabsTrigger>
          </TabsList>
          
          <TabsContent value="player" className="space-y-4">
            <div>
              <Label htmlFor="player-name">Your Name</Label>
              <Input
                id="player-name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <Label htmlFor="game-code">Game Code (S-prefix)</Label>
              <Input
                id="game-code"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="e.g., S123ABC"
              />
            </div>
            
            <Button 
              onClick={joinAsPlayer}
              disabled={joining || !gameCode.trim() || !playerName.trim()}
              className="w-full"
            >
              {joining ? 'Joining...' : 'Join as Player'}
            </Button>
          </TabsContent>
          
          <TabsContent value="device" className="space-y-4">
            <div>
              <Label htmlFor="device-code">Device Code (G-prefix)</Label>
              <Input
                id="device-code"
                value={deviceCode}
                onChange={(e) => setDeviceCode(e.target.value.toUpperCase())}
                placeholder="e.g., G456DEF"
              />
            </div>
            
            <Button 
              onClick={joinAsDevice}
              disabled={joining || !deviceCode.trim()}
              className="w-full"
            >
              {joining ? 'Connecting...' : 'Connect Device'}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GameJoin;
