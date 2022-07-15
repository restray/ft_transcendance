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
  connected: User;
  ready: boolean;
}

export type GameWaiting = 'waiting';
export type GameWaitingStart = 'start';
export type GamePlaying = 'playing';
export type GameEnd = 'end';
type GameStatus = GameWaiting | GameWaitingStart | GamePlaying | GameEnd;

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
    user: User,
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
          connected: user,
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
    this.spectators = [];
  }

  public getGame(): GameInformation {
    return this.game;
  }

  private addUser(user: User): UserType {
    if (this.isUserInMatch(user)) {
      return 'player';
    }
    if (this.game.players.right == null) {
      this.game.players.right = {
        connected: user,
        points: 0,
        position: {
          x: GAME_HEIGHT / 2 - this.pad_height / 2,
        },
        ready: false,
      };
      return 'player';
    }
    this.spectators.push(user.id);
    return 'spectator';
  }

  public userConnect(socket: AuthSocket) {
    socket.join(this.id);
    const side = this.isUserInMatch(socket.user);
    if (!side) {
      const type = this.addUser(socket.user);
      this.game.status = 'start';
      const infos = {
        type,
        side: type == 'player' ? 'right' : null,
        game: this.game,
      };

      this.server.emit('join', infos);

      return infos;
    } else {
      this.game.players[side].ready = false;
      this.game.players[side].connected = socket.user;

      this.server.emit('join', {
        type: 'player',
        side,
        game: this.game,
      });
    }
  }

  /**
   * When an user is disconnected, we pause the game where it played
   * @param socket User
   *
   * @todo Remove game when both users are logouts
   */
  public userDisconnect(socket: AuthSocket) {
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

  public canPlayerJoin(user: User): boolean {
    if (this.isUserInMatch(user)) return true;
    if (this.is_private) return false;
    return !this.game.players.right || !this.game.players.right.connected;
  }

  public isUserInMatch(user: User): PlayerSide | null {
    if (
      this.game.players.left &&
      user.id == this.game.players.left.connected.id
    )
      return 'left';
    if (
      this.game.players.right &&
      user.id == this.game.players.right.connected.id
    )
      return 'right';
    return null;
  }
}
