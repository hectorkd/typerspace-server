import IgameData from './gameData.interface';

export default interface Iuser {
  userName: string;
  color: string;
  isHost: boolean;
  gameData: IgameData;
}
