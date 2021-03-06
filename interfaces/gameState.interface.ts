import Iuser from './user.interface';

export default interface IgameState {
  [roomId: string]: {
    users: {
      [socketId: string]: Iuser;
    };
    gamemode: string;
    rounds: number;
    currRound: number;
    startTime: number;
    paragraph: string | undefined;
    positions: {
      [socketId: string]: {
        currIndex: number;
        color: string;
      };
    };
  };
}
