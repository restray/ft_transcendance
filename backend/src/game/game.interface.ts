import { User } from '@prisma/client';
import { Server } from 'socket.io';
import { AuthSocket } from 'src/auth/websocket.middleware';
import { v4 as uuidv4 } from 'uuid';

export const GAME_HEIGHT = 960;
export const GAME_WIDTH = 1280;

export interface Position1D {
  x: number;
}

export interface Position2D extends Position1D {
  y: number;
}

export interface Vector {
  vx: number;
  vy: number;
}

export interface Ball {
  position: Position2D;
  vector: Vector;
  speed: number;
}

export type PlayerSideLeft = 'left';
export type PlayerSideRight = 'right';
type PlayerSide = PlayerSideLeft | PlayerSideRight;
export interface Player {
  position: Position1D;
  points: number;
  connected: AuthSocket;
  ready: boolean;
}

export type GameWaiting = 'waiting';
export type GamePlaying = 'playing';
export type GameEnd = 'end';
type GameStatus = GameWaiting | GamePlaying | GameEnd;

// status, scores, time_spent, ball[position, vector, speed], players[2][position]
export interface GameInformation {
  paused: boolean;
  status: GameStatus;
  players: Record<PlayerSide, Player | null>;
  time_spent: Date;
  ball: Ball;
}

export type UserType = 'player' | 'spectator';

type UserID = number;

export class GameRoom {
  spectators: Array<UserID>;
  readonly pad_height = 25;
  readonly id: string;

  private game: GameInformation;
  private server;

  constructor(
    private readonly is_private: boolean,
    server: Server,
    socket: AuthSocket,
  ) {
    this.id = uuidv4();
    this.server = server.to(this.id);
    this.game = {
      ball: {
        position: {
          x: GAME_HEIGHT / 2,
          y: GAME_WIDTH / 2,
        },
        speed: 0,
        vector: {
          vx: 0,
          vy: 0,
        },
      },
      paused: true,
      players: {
        left: {
          connected: socket,
          points: 0,
          ready: false,
          position: {
            x: GAME_HEIGHT / 2 - this.pad_height / 2,
          },
        },
        right: null,
      },
      status: 'waiting',
      time_spent: new Date(),
    };
  }

  getGame(): GameInformation {
    return this.game;
  }

  addUser(socket: AuthSocket): UserType {
    if (this.game.players.right == null) {
      this.game.players.right = {
        connected: socket,
        points: 0,
        position: {
          x: GAME_HEIGHT / 2 - this.pad_height / 2,
        },
        ready: false,
      };
      return 'player';
    }
    this.spectators.push(socket.user.id);
    return 'spectator';
  }

  userConnect(socket: AuthSocket) {
    socket.join(this.id);
    const side = this.isUserInMatch(socket.user);
    if (!side) {
      const type = this.addUser(socket);

      socket.emit('join', {
        type,
        side: type == 'player' ? 'right' : null,
        game: this.game,
      });
    } else {
      this.game.players[side].ready = false;
      this.game.players[side].connected = socket;

      socket.emit('join', {
        type: 'player',
        side,
        game: this.game,
      });
    }
  }

  userDisconnect(socket: AuthSocket) {
    socket.leave(this.id);
    const side = this.isUserInMatch(socket.user);
    if (!side) {
      const index_spec = this.spectators.indexOf(socket.user.id);
      if (index_spec > -1) this.spectators.slice(index_spec, 1);
    } else {
      this.game.players[side].ready = false;
      this.game.paused = true;
      this.server.emit('pause', this.game);
    }
  }

  canPlayerJoin(): boolean {
    if (this.is_private) return false;
    return this.game.players.right.connected == null;
  }

  isUserInMatch(user: User): PlayerSide | null {
    if (user.id == this.game.players.left.connected.user.id) return 'left';
    if (user.id == this.game.players.right.connected.user.id) return 'right';
    return null;
  }
}
