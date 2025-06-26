
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/hooks/useGame';
import { useToast } from '@/hooks/use-toast';
import { Settings, RotateCcw, Users, CheckCircle, AlertTriangle, Play, Square } from 'lucide-react';

interface AdminPanelProps {
  gameId: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ gameId }) => {
  const { game, resetGame, endGame } = useGame(gameId);
  const { toast } = useToast();

  if (!game) return null;

  const alivePlayers = game.players.filter(p => p.isAlive !== false);
  const deadPlayers = game.players.filter(p => p.isAlive === false);
  const aliveImpostors = alivePlayers.filter(p => p.role === 'impostor');
  const aliveCrewmates = alivePlayers.filter(p => p.role === 'crewmate');

  const allTasks = game.devices.flatMap(device => device.tasks);
  const completedTasks = allTasks.filter(task => task.completed);
  const taskProgress = allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;

  const activeSabotages = game.devices.filter(device => device.sabotage?.active);

  const handleResetGame = async () => {
    await resetGame();
    toast({
      title: "Game Reset",
      description: "The game has been reset to lobby state"
    });
  };

  const handleEndGame = async () => {
    await endGame();
    toast({
      title: "Game Ended",
      description: "The game has been manually ended"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Panel
          </CardTitle>
          <CardDescription>
            Game management and live overview
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Game Code</p>
              <Badge variant="outline" className="text-lg">{game.gameCode}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Device Code</p>
              <Badge variant="secondary" className="text-lg">{game.deviceCode}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">Status</p>
              <Badge variant={game.status === 'active' ? 'default' : 'secondary'}>
                {game.status.toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Impostors</p>
              <p className="text-lg font-bold">{game.impostorCount}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Players</p>
              <p className="text-lg font-bold">{game.players.length}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleResetGame}
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Game
            </Button>
            {game.status === 'active' && (
              <Button 
                variant="destructive" 
                onClick={handleEndGame}
                className="flex-1"
              >
                <Square className="h-4 w-4 mr-2" />
                End Game
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {game.status === 'active' && (
        <>
          {/* Live Game Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Live Game Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Task Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Task Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {completedTasks.length}/{allTasks.length}
                  </span>
                </div>
                <Progress value={taskProgress} className="w-full" />
              </div>

              {/* Player Status */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm text-green-600 mb-2">
                    Alive Players ({alivePlayers.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {alivePlayers.map(player => (
                      <Badge 
                        key={player.id} 
                        variant={player.role === 'impostor' ? 'destructive' : 'default'}
                      >
                        {player.name} ({player.role})
                      </Badge>
                    ))}
                  </div>
                </div>

                {deadPlayers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-red-600 mb-2">
                      Dead Players ({deadPlayers.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {deadPlayers.map(player => (
                        <Badge key={player.id} variant="outline" className="opacity-50">
                          {player.name} ({player.role})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Active Sabotages */}
              {activeSabotages.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-orange-600 mb-2">
                    Active Sabotages ({activeSabotages.length})
                  </h4>
                  <div className="space-y-2">
                    {activeSabotages.map(device => (
                      <div key={device.id} className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="text-sm">
                          {device.sabotage?.type} at {device.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Connected Devices */}
              <div>
                <h4 className="font-medium text-sm text-blue-600 mb-2">
                  Connected Devices ({game.devices.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {game.devices.map(device => (
                    <Badge key={device.id} variant="secondary">
                      {device.name} - {device.location}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminPanel;
