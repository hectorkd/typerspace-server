import Iuser from './user.interface';

export default interface IgameState {
  [roomId: string]: {
    users: {
      [socketId: string]: Iuser;
    };
    startTime: number;
    paragraph: string;
  };
}
