
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/hooks/useGame';
import { Trophy, Users, CheckCircle, X } from 'lucide-react';

interface GameEndScreenProps {
  gameId: string;
  onNewGame: () => void;
}

const GameEndScreen: React.FC<GameEndScreenProps> = ({ gameId, onNewGame }) => {
  const { game } = useGame(gameId);

  if (!game || !game.result) return null;

  const allTasks = game.devices.flatMap(device => device.tasks);
  const completedTasks = allTasks.filter(task => task.completed);
  const taskProgress = allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;

  const crewmates = game.players.filter(p => p.role === 'crewmate');
  const impostors = game.players.filter(p => p.role === 'impostor');

  const getResultMessage = () => {
    switch (game.result!.reason) {
      case 'tasks_completed':
        return 'All tasks were completed!';
      case 'impostors_eliminated':
        return 'All impostors were eliminated!';
      case 'impostors_majority':
        return 'Impostors reached majority!';
      case 'time_expired':
        return 'Time ran out!';
      default:
        return 'Game ended';
    }
  };

  return (
    <div className="space-y-6">
      <Card className={`border-2 ${game.result.winner === 'crewmates' ? 'border-blue-500 bg-blue-50' : 'border-red-500 bg-red-50'}`}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Trophy className="h-6 w-6" />
            {game.result.winner === 'crewmates' ? 'CREWMATES WIN!' : 'IMPOSTORS WIN!'}
          </CardTitle>
          <CardDescription className="text-lg">
            {getResultMessage()}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Task Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Final Task Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tasks Completed</span>
              <span>{completedTasks.length}/{allTasks.length}</span>
            </div>
            <Progress value={taskProgress} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Player Roles Reveal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Player Roles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-blue-600 mb-2">
              Crewmates ({crewmates.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {crewmates.map(player => (
                <Badge 
                  key={player.id} 
                  variant="default"
                  className="flex items-center gap-1"
                >
                  {player.name}
                  {player.isAlive === false && <X className="h-3 w-3" />}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-red-600 mb-2">
              Impostors ({impostors.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {impostors.map(player => (
                <Badge 
                  key={player.id} 
                  variant="destructive"
                  className="flex items-center gap-1"
                >
                  {player.name}
                  {player.isAlive === false && <X className="h-3 w-3" />}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Summary */}
      {game.meeting && (
        <Card>
          <CardHeader>
            <CardTitle>Final Meeting Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Meeting Type:</strong> {game.meeting.type === 'dead_body' ? 'Dead Body Report' : 'Emergency Meeting'}
              </p>
              <p className="text-sm">
                <strong>Total Votes:</strong> {game.meeting.votes.length}
              </p>
              {/* Add vote breakdown if needed */}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <Button onClick={onNewGame} size="lg">
          Start New Game
        </Button>
      </div>
    </div>
  );
};

export default GameEndScreen;
