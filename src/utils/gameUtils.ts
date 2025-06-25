
export const generateGameCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'S';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateDeviceCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'G';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generatePlayerId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const generateDeviceId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const generateTaskId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const assignRoles = (players: any[], impostorCount: number) => {
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  return shuffled.map((player, index) => ({
    ...player,
    role: index < impostorCount ? 'impostor' : 'crewmate'
  }));
};
