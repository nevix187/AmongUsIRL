
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/hooks/useGame';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Circle, MapPin, Zap, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

interface TaskDeviceProps {
  gameId: string;
  deviceId: string;
}

const TaskDevice: React.FC<TaskDeviceProps> = ({ gameId, deviceId }) => {
  const { game, updateDevice } = useGame(gameId);
  const { toast } = useToast();
  const [sabotageEffect, setSabotageEffect] = useState<string | null>(null);

  const device = game?.devices.find(d => d.id === deviceId);

  useEffect(() => {
    if (device?.sabotage?.active) {
      setSabotageEffect(device.sabotage.type);
      
      // Auto-clear sabotage after 30 seconds
      const timer = setTimeout(() => {
        if (device) {
          updateDevice(device.id, {
            sabotage: { ...device.sabotage, active: false }
          });
        }
      }, 30000);

      return () => clearTimeout(timer);
    } else {
      setSabotageEffect(null);
    }
  }, [device?.sabotage, device, updateDevice]);

  if (!device || !game) {
    return <div className="text-center">Device not found</div>;
  }

  const completedTasks = device.tasks.filter(task => task.completed).length;
  const totalTasks = device.tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleCompleteTask = async (taskId: string) => {
    const updatedTasks = device.tasks.map(task =>
      task.id === taskId ? { ...task, completed: true } : task
    );

    await updateDevice(device.id, { tasks: updatedTasks });
    
    toast({
      title: "Task Completed!",
      description: "Great work! Task has been marked as complete.",
    });
  };

  const getSabotageIcon = (type: string) => {
    switch (type) {
      case 'lights': return WifiOff;
      case 'oxygen': return AlertTriangle;
      case 'communications': return Wifi;
      case 'reactor': return Zap;
      default: return AlertTriangle;
    }
  };

  const getSabotageEffect = () => {
    switch (sabotageEffect) {
      case 'lights':
        return 'bg-gray-900 text-yellow-400';
      case 'oxygen':
        return 'bg-red-900 text-red-200 animate-pulse';
      case 'communications':
        return 'bg-blue-900 text-blue-200';
      case 'reactor':
        return 'bg-orange-900 text-orange-200 animate-pulse';
      default:
        return '';
    }
  };

  return (
    <div className={`space-y-6 min-h-screen p-4 transition-all duration-500 ${getSabotageEffect()}`}>
      {/* Sabotage Alert */}
      {sabotageEffect && device.sabotage?.active && (
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              {React.createElement(getSabotageIcon(sabotageEffect), { className: "h-6 w-6" })}
              SABOTAGE DETECTED!
            </CardTitle>
            <CardDescription className="text-red-600">
              {device.sabotage.message}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Device Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {device.name}
          </CardTitle>
          <CardDescription>
            Location: {device.location}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Task Progress</span>
              <span>{completedTasks}/{totalTasks}</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Available Tasks</CardTitle>
          <CardDescription>
            Complete tasks to help your team win
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {device.tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg">
              {task.completed ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${task.completed ? 'line-through text-green-600' : ''}`}>
                  {task.name}
                </p>
                {task.completed && (
                  <Badge variant="secondary" className="mt-1">
                    Completed
                  </Badge>
                )}
              </div>
              {!task.completed && !sabotageEffect && (
                <Button onClick={() => handleCompleteTask(task.id)}>
                  Complete Task
                </Button>
              )}
              {sabotageEffect && !task.completed && (
                <Badge variant="destructive">
                  Blocked by Sabotage
                </Badge>
              )}
            </div>
          ))}
          {device.tasks.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No tasks assigned to this device yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Game Status */}
      <Card>
        <CardHeader>
          <CardTitle>Game Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Game Status</span>
              <Badge variant={game.status === 'active' ? 'default' : 'secondary'}>
                {game.status.toUpperCase()}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Players</span>
              <span>{game.players.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Connected Devices</span>
              <span>{game.devices.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskDevice;
