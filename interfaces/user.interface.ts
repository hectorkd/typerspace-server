import IgameData from './gameData.interface';
import IpowerUps from './powerUp.interface';

export default interface Iuser {
  userId: string;
  userName: string;
  color: string;
  isHost: boolean;
  gameData: IgameData;
  userParagraph: string;
  appliedPUs: IpowerUps;
  availablePUs: IpowerUps;
  isReady: boolean;
  rank: number;
  WPMHistory: Array<number>;
  WPMAverage: number;
}
