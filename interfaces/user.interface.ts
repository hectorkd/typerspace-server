import IgameData from './gameData.interface';

export default interface Iuser {
  userId: string;
  userName: string;
  color: string;
  isHost: boolean;
  gameData: IgameData;
}
