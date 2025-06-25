
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/hooks/useGame';
import { GameStorage } from '@/lib/gameStorage';
import DeadBodyReport from './DeadBodyReport';
import { CheckCircle, Circle, Skull, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CrewmateViewProps {
  gameId: string;
  playerId: string;
}

const CrewmateView: React.FC<CrewmateViewProps> = ({ gameId, playerId }) => {
  const { game } = useGame(gameId);
  const [showDeadBodyReport, setShowDeadBodyReport] = useState(false);
  const { toast } = useToast();

  if (!game) return null;

  // Get all tasks from all devices
  const allTasks = game.devices.flatMap(device => 
    device.tasks.map(task => ({
      ...task,
      deviceName: device.name,
      deviceLocation: device.location
    }))
  );

  const completedTasks = allTasks.filter(task => task.completed);
  const taskProgress = allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;

  const handleDeadBodyReported = () => {
    setShowDeadBodyReport(false);
    toast({
      title: "Dead Body Reported!",
      description: "Emergency meeting has been called.",
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6">
      {/* Task Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Task Progress
          </CardTitle>
          <CardDescription>
            Complete all tasks to win as crewmates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Tasks Completed</span>
              <span>{completedTasks.length}/{allTasks.length}</span>
            </div>
            <Progress value={taskProgress} className="w-full" />
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {allTasks.map((task) => (
              <div key={`${task.deviceName}-${task.id}`} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                {task.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${task.completed ? 'line-through text-green-600' : ''}`}>
                    {task.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {task.deviceName} - {task.deviceLocation}
                  </p>
                </div>
              </div>
            ))}
            {allTasks.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No tasks available yet. Devices need to connect and add tasks.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dead Body Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skull className="h-5 w-5" />
            Emergency Actions
          </CardTitle>
          <CardDescription>
            Report dead bodies or call emergency meetings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={() => setShowDeadBodyReport(true)}
            className="w-full"
          >
            <Skull className="h-4 w-4 mr-2" />
            Report Dead Body
          </Button>
        </CardContent>
      </Card>

      {showDeadBodyReport && (
        <DeadBodyReport
          gameId={gameId}
          onReport={handleDeadBodyReported}
          onCancel={() => setShowDeadBodyReport(false)}
        />
      )}
    </div>
  );
};

export default CrewmateView;
