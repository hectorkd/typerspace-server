import IgameData from './gameData.interface';

export default interface Iuser {
  userId: string;
  userName: string;
  color: string;
  isHost: boolean;
  gameData: IgameData;
  userParagraph: string;
  appliedPUs: { id: string; powerUp: string }[];
  availablePUs: { id: string; powerUp: string }[];
  isReady: boolean;
  rank: number;
  WPMHistory: Array<number>;
  WPMAverage: number;
}
