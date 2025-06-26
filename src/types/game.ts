
export interface Player {
  id: string;
  name: string;
  role?: 'impostor' | 'crewmate';
  joinedAt: number;
  isAlive?: boolean;
  votedFor?: string | 'skip';
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
  active: boolean;
}

export interface Device {
  id: string;
  name: string;
  location: string;
  tasks: Task[];
  connectedAt: number;
  sabotage?: SabotageEvent;
}

export interface Vote {
  playerId: string;
  targetId: string | 'skip';
  timestamp: number;
}

export interface Meeting {
  id: string;
  type: 'emergency' | 'dead_body';
  reporterId: string;
  reportedPlayerId?: string;
  discussionEndsAt: number;
  votingEndsAt: number;
  votes: Vote[];
  phase: 'discussion' | 'voting' | 'results';
  active: boolean;
}

export interface GameResult {
  winner: 'crewmates' | 'impostors';
  reason: 'tasks_completed' | 'impostors_eliminated' | 'impostors_majority' | 'time_expired';
  endedAt: number;
}

export interface Game {
  id: string;
  gameCode: string; // S-prefixed
  deviceCode: string; // G-prefixed
  hostId: string;
  impostorCount: number;
  players: Player[];
  devices: Device[];
  status: 'waiting' | 'active' | 'meeting' | 'ended';
  createdAt: number;
  startedAt?: number;
  meeting?: Meeting;
  result?: GameResult;
  settings: {
    discussionTime: number; // seconds
    votingTime: number; // seconds
    maxMeetings: number;
  };
}

export type GameStatus = Game['status'];
export type PlayerRole = Player['role'];
