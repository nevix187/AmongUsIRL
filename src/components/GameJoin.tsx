
import React, { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface GameJoinProps {
  onGameJoined: (gameId: string, type: 'player' | 'device') => void;
}

const GameJoin: React.FC<GameJoinProps> = ({ onGameJoined }) => {
  const [gameCode, setGameCode] = useState('');
  const [deviceCode, setDeviceCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const findGameByCode = async (code: string, codeType: 'gameCode' | 'deviceCode') => {
    const gamesRef = collection(db, 'games');
    const q = query(gamesRef, where(codeType, '==', code.toUpperCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    return querySnapshot.docs[0].id;
  };

  const handleJoinAsPlayer = async () => {
    if (!gameCode.trim()) return;
    
    setLoading(true);
    try {
      const gameId = await findGameByCode(gameCode.toUpperCase(), 'gameCode');
      
      if (!gameId) {
        toast({
          title: "Game Not Found",
          description: "No game found with this code",
          variant: "destructive"
        });
        return;
      }
      
      onGameJoined(gameId, 'player');
    } catch (error) {
      console.error('Error joining game:', error);
      toast({
        title: "Error",
        description: "Failed to join game. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinAsDevice = async () => {
    if (!deviceCode.trim()) return;
    
    setLoading(true);
    try {
      const gameId = await findGameByCode(deviceCode.toUpperCase(), 'deviceCode');
      
      if (!gameId) {
        toast({
          title: "Game Not Found",
          description: "No game found with this device code",
          variant: "destructive"
        });
        return;
      }
      
      onGameJoined(gameId, 'device');
    } catch (error) {
      console.error('Error joining game:', error);
      toast({
        title: "Error",
        description: "Failed to connect device. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Join Game</CardTitle>
        <CardDescription>
          Enter a code to join as a player or connect a device
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="player">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="player">Player</TabsTrigger>
            <TabsTrigger value="device">Device</TabsTrigger>
          </TabsList>
          
          <TabsContent value="player" className="space-y-4">
            <div>
              <Label htmlFor="game-code">Game Code (S-prefix)</Label>
              <Input
                id="game-code"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
                placeholder="Enter game code (e.g., S1234A)"
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleJoinAsPlayer}
              disabled={!gameCode.trim() || loading}
              className="w-full"
            >
              {loading ? 'Joining...' : 'Join as Player'}
            </Button>
          </TabsContent>
          
          <TabsContent value="device" className="space-y-4">
            <div>
              <Label htmlFor="device-code">Device Code (G-prefix)</Label>
              <Input
                id="device-code"
                value={deviceCode}
                onChange={(e) => setDeviceCode(e.target.value)}
                placeholder="Enter device code (e.g., G5678B)"
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleJoinAsDevice}
              disabled={!deviceCode.trim() || loading}
              className="w-full"
            >
              {loading ? 'Connecting...' : 'Connect Device'}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GameJoin;
