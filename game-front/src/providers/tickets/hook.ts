import { useContext } from 'react';
import { TicketContext } from './provider';

export const useTicket = () => useContext(TicketContext);
