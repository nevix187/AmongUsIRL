
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateGameCode, generateDeviceCode, generatePlayerId } from '@/utils/gameUtils';
import { useToast } from '@/hooks/use-toast';
import { EnhancedGameStorage } from '@/lib/enhancedStorage';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface GameCreationProps {
  onGameCreated: (gameId: string, isAdmin: boolean) => void;
}

const ADMIN_PASSWORD = '1871';

const GameCreation: React.FC<GameCreationProps> = ({ onGameCreated }) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [impostorCount, setImpostorCount] = useState(1);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const handlePasswordSubmit = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({
        title: "Admin Access Granted",
        description: "You can now create a new game"
      });
    } else {
      toast({
        title: "Invalid Password",
        description: "Please enter the correct admin password",
        variant: "destructive"
      });
    }
  };

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
        createdAt: Date.now(),
        settings: {
          discussionTime: 100,
          votingTime: 40,
          maxMeetings: 3
        }
      };

      const gameId = EnhancedGameStorage.createGame(gameData);
      
      toast({
        title: "Game Created!",
        description: `Game Code: ${gameData.gameCode}, Device Code: ${gameData.deviceCode}`
      });
      
      onGameCreated(gameId, true);
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

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Admin Access Required
          </CardTitle>
          <CardDescription>
            Enter the admin password to create a new game
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="admin-password">Admin Password</Label>
            <div className="relative mt-1">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={handlePasswordSubmit} 
            className="w-full"
          >
            Authenticate
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create New Game (Admin)</CardTitle>
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
