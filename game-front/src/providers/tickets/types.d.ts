
export interface ITicket {
  showRefillModal: boolean,
  openRefillTickets: () => void;
}

export interface TicketProviderProps {
  children: ReactNode;
}
