
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/hooks/useGame';
import { GameStorage } from '@/lib/gameStorage';
import { useToast } from '@/hooks/use-toast';
import { Zap, AlertTriangle, Wifi, WifiOff, Volume2, VolumeX } from 'lucide-react';

interface ImpostorViewProps {
  gameId: string;
  playerId: string;
}

const ImpostorView: React.FC<ImpostorViewProps> = ({ gameId, playerId }) => {
  const { game, updateDevice } = useGame(gameId);
  const { toast } = useToast();

  if (!game) return null;

  const handleSabotage = async (type: string, message: string) => {
    // Add sabotage event to all devices
    const sabotageData = {
      type,
      message,
      timestamp: Date.now(),
      impostorId: playerId,
      active: true
    };

    // Update all devices with sabotage notification
    for (const device of game.devices) {
      await updateDevice(device.id, {
        ...device,
        sabotage: sabotageData
      });
    }

    toast({
      title: "Sabotage Activated!",
      description: message,
      variant: "destructive"
    });
  };

  const sabotageOptions = [
    {
      id: 'lights',
      name: 'Sabotage Lights',
      icon: WifiOff,
      message: 'Lights have been sabotaged! Fix the electrical systems.',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      id: 'oxygen',
      name: 'Sabotage O2',
      icon: AlertTriangle,
      message: 'Oxygen depleting! Fix the life support systems immediately!',
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      id: 'communications',
      name: 'Sabotage Comms',
      icon: Wifi,
      message: 'Communications down! Restore the communication systems.',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'reactor',
      name: 'Sabotage Reactor',
      icon: Zap,
      message: 'REACTOR MELTDOWN! Fix the reactor immediately or everyone dies!',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  const otherImpostors = game.players.filter(p => p.role === 'impostor' && p.id !== playerId);
  const crewmates = game.players.filter(p => p.role === 'crewmate');

  return (
    <div className="space-y-6">
      {/* Fellow Impostors */}
      {otherImpostors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fellow Impostors</CardTitle>
            <CardDescription>
              Work together to eliminate the crewmates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {otherImpostors.map(impostor => (
                <Badge key={impostor.id} variant="destructive">
                  {impostor.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sabotage Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Sabotage Controls
          </CardTitle>
          <CardDescription>
            Cause chaos and confusion among the crewmates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sabotageOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <Button
                key={option.id}
                onClick={() => handleSabotage(option.id, option.message)}
                className={`w-full justify-start ${option.color} text-white`}
                variant="default"
              >
                <IconComponent className="h-4 w-4 mr-2" />
                {option.name}
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* Player Status */}
      <Card>
        <CardHeader>
          <CardTitle>Player Overview</CardTitle>
          <CardDescription>
            Keep track of all players in the game
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                Crewmates ({crewmates.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {crewmates.map(player => (
                  <Badge key={player.id} variant="outline">
                    {player.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                Connected Devices ({game.devices.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {game.devices.map(device => (
                  <Badge key={device.id} variant="secondary">
                    {device.name} ({device.location})
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImpostorView;
