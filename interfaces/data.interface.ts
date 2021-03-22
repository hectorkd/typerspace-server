export default interface IgameState {
  [roomId: string]: {
    users: {
      socketId: string;
      host: boolean;
    }[];
    paragraph: string;
  };
}
