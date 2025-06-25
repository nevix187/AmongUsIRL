
export interface Player {
  id: string;
  name: string;
  role?: 'impostor' | 'crewmate';
  joinedAt: number;
}

export interface Task {
  id: string;
  name: string;
  completed: boolean;
  createdAt: number;
}

export interface SabotageEvent {
  type: string;
  message: string;
  timestamp: number;
  impostorId: string;
}

export interface Device {
  id: string;
  name: string;
  location: string;
  tasks: Task[];
  connectedAt: number;
  sabotage?: SabotageEvent;
}

export interface Game {
  id: string;
  gameCode: string; // S-prefixed
  deviceCode: string; // G-prefixed
  hostId: string;
  impostorCount: number;
  players: Player[];
  devices: Device[];
  status: 'waiting' | 'active' | 'ended';
  createdAt: number;
  startedAt?: number;
}

export type GameStatus = Game['status'];
export type PlayerRole = Player['role'];
