import { createContext, useContext } from 'react';

// Every page is rendered by the server, so moving between them is a plain page load.
// That also tears the puzzle canvas down cleanly between rooms.

export const PathnameContext = createContext('/');

/** The current path, also during the server render */
export const usePathname = () => useContext(PathnameContext);

export const navigate = (path: string) => window.location.assign(path);

export const roomPath = (lang: string, roomCode: string, imageId?: string | number) =>
  `/${lang}/room/${roomCode}` + (imageId === undefined ? '' : `/${imageId}`);
