
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/hooks/useGame';
import { useToast } from '@/hooks/use-toast';
import { Users, Clock, Vote, SkipForward } from 'lucide-react';

interface EmergencyMeetingProps {
  gameId: string;
  playerId: string;
}

const EmergencyMeeting: React.FC<EmergencyMeetingProps> = ({ gameId, playerId }) => {
  const { game, submitVote } = useGame(gameId);
  const [selectedVote, setSelectedVote] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (!game?.meeting) return;

    const updateTimer = () => {
      const now = Date.now();
      let remaining = 0;

      if (game.meeting.phase === 'discussion') {
        remaining = Math.max(0, game.meeting.discussionEndsAt - now);
      } else if (game.meeting.phase === 'voting') {
        remaining = Math.max(0, game.meeting.votingEndsAt - now);
      }

      setTimeLeft(Math.ceil(remaining / 1000));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [game?.meeting]);

  if (!game?.meeting || !game.meeting.active) return null;

  const currentPlayer = game.players.find(p => p.id === playerId);
  const alivePlayers = game.players.filter(p => p.isAlive !== false);
  const hasVoted = game.meeting.votes.some(vote => vote.playerId === playerId);

  const handleSubmitVote = async () => {
    if (!selectedVote || hasVoted) return;

    await submitVote(game.meeting!.id, selectedVote);
    toast({
      title: "Vote Submitted",
      description: selectedVote === 'skip' ? "You voted to skip" : `You voted for ${game.players.find(p => p.id === selectedVote)?.name}`
    });
  };

  const getPhaseProgress = () => {
    if (game.meeting.phase === 'discussion') {
      const total = (game.meeting.discussionEndsAt - (game.meeting.discussionEndsAt - game.settings.discussionTime * 1000)) / 1000;
      const elapsed = total - timeLeft;
      return (elapsed / total) * 100;
    } else if (game.meeting.phase === 'voting') {
      const total = game.settings.votingTime;
      const elapsed = total - timeLeft;
      return (elapsed / total) * 100;
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <Users className="h-5 w-5" />
            Emergency Meeting
          </CardTitle>
          <CardDescription className="text-red-600">
            {game.meeting.type === 'dead_body' 
              ? `Dead body reported by ${game.players.find(p => p.id === game.meeting!.reporterId)?.name}`
              : `Emergency meeting called by ${game.players.find(p => p.id === game.meeting!.reporterId)?.name}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                {game.meeting.phase === 'discussion' ? 'Discussion' : 'Voting'}: {timeLeft}s
              </span>
            </div>
            <Badge variant={game.meeting.phase === 'discussion' ? 'default' : 'destructive'}>
              {game.meeting.phase.toUpperCase()}
            </Badge>
          </div>
          
          <Progress value={getPhaseProgress()} className="w-full" />

          {game.meeting.phase === 'discussion' && (
            <div className="text-center p-4 bg-yellow-50 rounded">
              <p className="text-sm text-yellow-800">
                Discuss who you think the impostor is. Voting will begin soon!
              </p>
            </div>
          )}

          {game.meeting.phase === 'voting' && !hasVoted && currentPlayer?.isAlive !== false && (
            <div className="space-y-4">
              <h3 className="font-semibold">Cast Your Vote</h3>
              <RadioGroup value={selectedVote} onValueChange={setSelectedVote}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="skip" id="skip" />
                    <Label htmlFor="skip" className="flex items-center gap-2 cursor-pointer">
                      <SkipForward className="h-4 w-4" />
                      Skip Vote
                    </Label>
                  </div>
                  {alivePlayers.filter(p => p.id !== playerId).map((player) => (
                    <div key={player.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={player.id} id={player.id} />
                      <Label htmlFor={player.id} className="flex-1 cursor-pointer">
                        {player.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <Button
                onClick={handleSubmitVote}
                disabled={!selectedVote}
                className="w-full"
                variant="destructive"
              >
                <Vote className="h-4 w-4 mr-2" />
                Submit Vote
              </Button>
            </div>
          )}

          {hasVoted && (
            <div className="text-center p-4 bg-green-50 rounded">
              <p className="text-sm text-green-800">
                You have voted! Waiting for other players...
              </p>
            </div>
          )}

          {currentPlayer?.isAlive === false && (
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                You are dead and cannot vote.
              </p>
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Votes cast: {game.meeting.votes.length} / {alivePlayers.length}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyMeeting;
