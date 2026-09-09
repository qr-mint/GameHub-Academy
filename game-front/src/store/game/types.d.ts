type GameState = {
  data: any | null;
};

type GameActions = {
  loadGameData: () => Promise<void>;
  setTickets: (tickets: number) => void;
}

export type GameStore = GameState & GameActions;
