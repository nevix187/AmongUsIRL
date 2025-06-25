
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateGameCode, generateDeviceCode, generatePlayerId } from '@/utils/gameUtils';
import { useToast } from '@/hooks/use-toast';
import { GameStorage } from '@/lib/gameStorage';

interface GameCreationProps {
  onGameCreated: (gameId: string) => void;
}

const GameCreation: React.FC<GameCreationProps> = ({ onGameCreated }) => {
  const [impostorCount, setImpostorCount] = useState(1);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const createGame = async () => {
    if (impostorCount < 1) {
      toast({
        title: "Invalid Configuration",
        description: "You need at least 1 impostor",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const gameData = {
        gameCode: generateGameCode(),
        deviceCode: generateDeviceCode(),
        hostId: generatePlayerId(),
        impostorCount,
        players: [],
        devices: [],
        status: 'waiting' as const,
        createdAt: Date.now()
      };

      const gameId = GameStorage.createGame(gameData);
      
      toast({
        title: "Game Created!",
        description: `Game Code: ${gameData.gameCode}, Device Code: ${gameData.deviceCode}`
      });
      
      onGameCreated(gameId);
    } catch (error) {
      console.error('Error creating game:', error);
      toast({
        title: "Error",
        description: "Failed to create game. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create New Game</CardTitle>
        <CardDescription>
          Set up a new Among Us IRL game session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="impostor-count">Number of Impostors</Label>
          <Input
            id="impostor-count"
            type="number"
            min="1"
            max="10"
            value={impostorCount}
            onChange={(e) => setImpostorCount(Number(e.target.value))}
            className="mt-1"
          />
        </div>
        
        <Button 
          onClick={createGame} 
          disabled={creating}
          className="w-full"
        >
          {creating ? 'Creating Game...' : 'Create Game'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GameCreation;
