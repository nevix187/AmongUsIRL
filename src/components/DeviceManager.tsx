
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useGame } from '@/hooks/useGame';
import { generateDeviceId, generateTaskId } from '@/utils/gameUtils';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, MapPin } from 'lucide-react';
import { Task } from '@/types/game';

interface DeviceManagerProps {
  gameId: string;
}

const DeviceManager: React.FC<DeviceManagerProps> = ({ gameId }) => {
  const { game, loading, addDevice, updateDevice } = useGame(gameId);
  const [deviceName, setDeviceName] = useState('');
  const [deviceLocation, setDeviceLocation] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConnectDevice = async () => {
    if (!deviceName.trim() || !deviceLocation.trim() || !game) return;

    const deviceId = generateDeviceId();
    await addDevice({
      name: deviceName.trim(),
      location: deviceLocation.trim(),
      tasks: [],
      connectedAt: Date.now()
    });

    setCurrentDeviceId(deviceId);
    setIsConnected(true);
    setDeviceName('');
    setDeviceLocation('');

    toast({
      title: "Device Connected!",
      description: `${deviceName.trim()} is now connected`
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
      description: `"${newTask.name}" has been added`
    });
  };

  const handleToggleTask = async (taskId: string) => {
    if (!currentDevice) return;

    const updatedTasks = currentDevice.tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    await updateDevice(currentDevice.id, {
      tasks: updatedTasks
    });
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

  return (
    <div className="space-y-6">
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
                <h3 className="font-semibold text-green-800">{currentDevice.name}</h3>
                <p className="text-green-600">{currentDevice.location}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Tasks ({currentDevice.tasks.length})</h4>
                
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="Add a new task"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                  />
                  <Button onClick={handleAddTask} disabled={!newTaskName.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {currentDevice.tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2 p-2 border rounded">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleToggleTask(task.id)}
                      />
                      <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                        {task.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTask(task.id)}
                        className="ml-auto"
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
    </div>
  );
};

export default DeviceManager;
