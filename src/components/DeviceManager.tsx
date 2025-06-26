
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/hooks/useGame';
import { useSabotage } from '@/hooks/useSabotage';
import { generateDeviceId, generateTaskId } from '@/utils/gameUtils';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';
import { Task } from '@/types/game';

interface DeviceManagerProps {
  gameId: string;
}

const DeviceManager: React.FC<DeviceManagerProps> = ({ gameId }) => {
  const { game, loading, addDevice, updateDevice } = useGame(gameId);
  const { activeSabotage, sabotageEffects, isSabotaged } = useSabotage(game);
  const [deviceName, setDeviceName] = useState('');
  const [deviceLocation, setDeviceLocation] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConnectDevice = async () => {
    if (!deviceName.trim() || !deviceLocation.trim() || !game) return;

    const newDevice = {
      name: deviceName.trim(),
      location: deviceLocation.trim(),
      tasks: [],
      connectedAt: Date.now()
    };

    await addDevice(newDevice);
    
    // Find the newly created device
    const updatedGame = await new Promise(resolve => {
      const unsubscribe = game ? (() => {
        const latestGame = game;
        const newDeviceInGame = latestGame.devices.find(d => 
          d.name === newDevice.name && d.location === newDevice.location
        );
        if (newDeviceInGame) {
          setCurrentDeviceId(newDeviceInGame.id);
          resolve(latestGame);
        }
      }) : () => {};
      
      setTimeout(() => {
        const latestDevices = game?.devices || [];
        const matchingDevice = latestDevices[latestDevices.length - 1];
        if (matchingDevice) {
          setCurrentDeviceId(matchingDevice.id);
        }
      }, 100);
      
      return unsubscribe;
    });

    setIsConnected(true);
    setDeviceName('');
    setDeviceLocation('');

    toast({
      title: "Device Connected!",
      description: `${newDevice.name} is now connected at ${newDevice.location}`
    });
  };

  const currentDevice = game?.devices.find(d => d.id === currentDeviceId);

  const handleAddTask = async () => {
    if (!newTaskName.trim() || !currentDevice) return;

    const newTask: Task = {
      id: generateTaskId(),
      name: newTaskName.trim(),
      completed: false,
      createdAt: Date.now()
    };

    await updateDevice(currentDevice.id, {
      tasks: [...currentDevice.tasks, newTask]
    });

    setNewTaskName('');
    
    toast({
      title: "Task Added",
      description: `"${newTask.name}" has been added to ${currentDevice.name}`
    });
  };

  const handleToggleTask = async (taskId: string) => {
    if (!currentDevice || isSabotaged) return;

    const updatedTasks = currentDevice.tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    await updateDevice(currentDevice.id, {
      tasks: updatedTasks
    });

    const task = currentDevice.tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      toast({
        title: "Task Completed!",
        description: `"${task.name}" has been completed!`
      });
    }
  };

  const handleRemoveTask = async (taskId: string) => {
    if (!currentDevice) return;

    const updatedTasks = currentDevice.tasks.filter(task => task.id !== taskId);
    
    await updateDevice(currentDevice.id, {
      tasks: updatedTasks
    });

    toast({
      title: "Task Removed",
      description: "Task has been deleted"
    });
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!game) {
    return <div className="text-center">Game not found</div>;
  }

  const completedTasks = currentDevice?.tasks.filter(t => t.completed).length || 0;
  const totalTasks = currentDevice?.tasks.length || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-6" style={sabotageEffects}>
      {/* Sabotage Alert */}
      {isSabotaged && activeSabotage && (
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              SABOTAGE ACTIVE!
            </CardTitle>
            <CardDescription className="text-red-600">
              {activeSabotage.message}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Device Manager
          </CardTitle>
          <CardDescription>
            Connect and manage task devices for the game
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="device-name">Device Name</Label>
                <Input
                  id="device-name"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="e.g., Main Terminal"
                />
              </div>
              
              <div>
                <Label htmlFor="device-location">Location</Label>
                <Input
                  id="device-location"
                  value={deviceLocation}
                  onChange={(e) => setDeviceLocation(e.target.value)}
                  placeholder="e.g., Engineering Room"
                />
              </div>

              <Button 
                onClick={handleConnectDevice}
                disabled={!deviceName.trim() || !deviceLocation.trim()}
                className="w-full"
              >
                Connect Device
              </Button>
            </div>
          ) : currentDevice ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-green-800">{currentDevice.name}</h3>
                  <Badge variant="secondary">{currentDevice.location}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Task Progress</span>
                    <span>{completedTasks}/{totalTasks}</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  Tasks ({totalTasks})
                  {isSabotaged && (
                    <Badge variant="destructive" className="text-xs">
                      BLOCKED
                    </Badge>
                  )}
                </h4>
                
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="Add a new task"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                    disabled={isSabotaged}
                  />
                  <Button 
                    onClick={handleAddTask} 
                    disabled={!newTaskName.trim() || isSabotaged}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {currentDevice.tasks.map((task) => (
                    <div key={task.id} className={`flex items-center gap-2 p-2 border rounded ${task.completed ? 'bg-green-50' : ''}`}>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleToggleTask(task.id)}
                          disabled={isSabotaged}
                        />
                        {task.completed && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </div>
                      <span className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.name}
                      </span>
                      {task.completed && (
                        <Badge variant="secondary" className="text-xs">
                          Completed
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTask(task.id)}
                        className="ml-auto"
                        disabled={isSabotaged}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Global Game Status */}
      {game && (
        <Card>
          <CardHeader>
            <CardTitle>Game Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant={game.status === 'active' ? 'default' : 'secondary'}>
                  {game.status.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Players:</span>
                <span>{game.players.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Devices:</span>
                <span>{game.devices.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Tasks:</span>
                <span>{game.devices.reduce((acc, device) => acc + device.tasks.length, 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeviceManager;
