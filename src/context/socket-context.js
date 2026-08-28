import { createContext, useContext } from 'react';

/** Context object and consumer hook for the realtime connection. */
export const SocketContext = createContext(null);

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used inside a SocketProvider');
  return context;
}
