
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/hooks/useGame';
import { useToast } from '@/hooks/use-toast';
import { Settings, RotateCcw, Users, CheckCircle, AlertTriangle, Play, Square, Shield, UserMinus } from 'lucide-react';

interface AdminPanelProps {
  gameId: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ gameId }) => {
  const { game, startGame, resetGame, endGame, removePlayer } = useGame(gameId);
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

  const canStartGame = game.players.length >= 3 && game.players.length >= game.impostorCount + 1;

  const handleStartGame = async () => {
    if (!canStartGame) {
      toast({
        title: "Cannot Start Game",
        description: `Need at least ${game.impostorCount + 1} players to start`,
        variant: "destructive"
      });
      return;
    }

    await startGame();
    toast({
      title: "Game Started!",
      description: "All players have been assigned roles"
    });
  };

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

  const handleRemovePlayer = async (playerId: string) => {
    await removePlayer(playerId);
    toast({
      title: "Player Removed",
      description: "Player has been removed from the game"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Control Panel
          </CardTitle>
          <CardDescription>
            Complete game management and oversight
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

          <div className="flex gap-2 flex-wrap">
            {game.status === 'waiting' && (
              <Button 
                onClick={handleStartGame}
                disabled={!canStartGame}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Start Game
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleResetGame}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Game
            </Button>
            
            {game.status === 'active' && (
              <Button 
                variant="destructive" 
                onClick={handleEndGame}
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                End Game
              </Button>
            )}
          </div>

          {!canStartGame && game.status === 'waiting' && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                Need at least {game.impostorCount + 1} players to start the game
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Player Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Player Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {game.players.length === 0 ? (
              <p className="text-muted-foreground">No players have joined yet</p>
            ) : (
              game.players.map(player => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{player.name}</span>
                    {game.status === 'active' && (
                      <>
                        <Badge variant={player.role === 'impostor' ? 'destructive' : 'default'}>
                          {player.role}
                        </Badge>
                        {player.isAlive === false && (
                          <Badge variant="outline">DEAD</Badge>
                        )}
                      </>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePlayer(player.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))
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
                <CheckCircle className="h-5 w-5" />
                Live Game Status
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

              {/* Win Conditions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded">
                  <p className="text-sm font-medium text-blue-700">Crewmates</p>
                  <p className="text-lg font-bold text-blue-800">{aliveCrewmates.length}</p>
                  <p className="text-xs text-blue-600">Tasks: {taskProgress.toFixed(0)}%</p>
                </div>
                <div className="p-3 bg-red-50 rounded">
                  <p className="text-sm font-medium text-red-700">Impostors</p>
                  <p className="text-lg font-bold text-red-800">{aliveImpostors.length}</p>
                  <p className="text-xs text-red-600">vs {aliveCrewmates.length} crew</p>
                </div>
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
