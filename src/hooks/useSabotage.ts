
import { useEffect, useState } from 'react';
import { Game, SabotageEvent } from '@/types/game';
import { useToast } from '@/hooks/use-toast';

export const useSabotage = (game: Game | null) => {
  const [activeSabotage, setActiveSabotage] = useState<SabotageEvent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!game) return;

    // Check for active sabotage across all devices
    const sabotageDevice = game.devices.find(device => device.sabotage?.active);
    
    if (sabotageDevice?.sabotage) {
      if (!activeSabotage || activeSabotage.timestamp !== sabotageDevice.sabotage.timestamp) {
        setActiveSabotage(sabotageDevice.sabotage);
        
        // Show sabotage notification
        toast({
          title: "SABOTAGE!",
          description: sabotageDevice.sabotage.message,
          variant: "destructive",
          duration: 5000
        });
      }
    } else {
      if (activeSabotage) {
        setActiveSabotage(null);
        toast({
          title: "Sabotage Fixed",
          description: "Systems are back online",
          duration: 3000
        });
      }
    }
  }, [game, activeSabotage, toast]);

  const getSabotageEffects = () => {
    if (!activeSabotage) return {};

    switch (activeSabotage.type) {
      case 'lights':
        return {
          filter: 'brightness(0.3)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        };
      case 'oxygen':
        return {
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          animation: 'pulse 2s infinite'
        };
      case 'communications':
        return {
          filter: 'hue-rotate(180deg)',
          backgroundColor: 'rgba(0, 0, 255, 0.1)'
        };
      case 'reactor':
        return {
          backgroundColor: 'rgba(255, 165, 0, 0.2)',
          animation: 'shake 0.5s infinite'
        };
      default:
        return {};
    }
  };

  return {
    activeSabotage,
    sabotageEffects: getSabotageEffects(),
    isSabotaged: !!activeSabotage
  };
};
