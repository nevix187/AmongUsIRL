
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useGame } from '@/hooks/useGame';
import { Skull, X } from 'lucide-react';

interface DeadBodyReportProps {
  gameId: string;
  onReport: (reportedPlayerId: string) => void;
  onCancel: () => void;
}

const DeadBodyReport: React.FC<DeadBodyReportProps> = ({ gameId, onReport, onCancel }) => {
  const { game } = useGame(gameId);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  if (!game) return null;

  const handleReport = () => {
    if (selectedPlayerId) {
      onReport(selectedPlayerId);
    }
  };

  // Get all players for reporting
  const allPlayers = game.players;

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <Skull className="h-5 w-5" />
          Report Dead Body
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCancel}
            className="ml-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription className="text-red-600">
          Select which player you found dead to call an emergency meeting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
          {allPlayers.map((player) => (
            <div key={player.id} className="flex items-center space-x-2">
              <RadioGroupItem value={player.id} id={player.id} />
              <Label htmlFor={player.id} className="flex-1 cursor-pointer">
                {player.name}
                {player.role && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({player.role})
                  </span>
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex gap-2 pt-4">
          <Button
            variant="destructive"
            onClick={handleReport}
            disabled={!selectedPlayerId}
            className="flex-1"
          >
            <Skull className="h-4 w-4 mr-2" />
            Report Dead Body
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeadBodyReport;
