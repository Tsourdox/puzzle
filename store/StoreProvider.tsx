'use client';
import { Size } from '@/utils/sizes';
import { Dispatch, PropsWithChildren, Reducer, createContext, useContext, useReducer } from 'react';

// ----- STATE -----
export type StoreState = {
  size: Size;
  showPuzzlePieceActions: boolean;
};
const initialStoreState: StoreState = {
  size: 's',
  showPuzzlePieceActions: false,
};

// ----- CONTEXTS -----
export const StoreContext = createContext<StoreState>(null as any);
export const StoreDispatchContext = createContext<Dispatch<KnownAction>>(null as any);

// ----- PROVIDER -----
export default function StoreProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(storeReducer, initialStoreState);

  return (
    <StoreContext.Provider value={state}>
      <StoreDispatchContext.Provider value={dispatch}>{children}</StoreDispatchContext.Provider>
    </StoreContext.Provider>
  );
}

// ----- HOOKS -----
export const useStoreState = () => useContext(StoreContext);
export const useStoreDispatch = () => useContext(StoreDispatchContext);

// ----- ACTIONS -----
type SetSizeAction = {
  type: 'SET_SIZE';
  payload: Size;
};
type SetShowPuzzlePieceActionsAction = {
  type: 'SET_PUZZLE_PIECE_ACTIONS';
  payload: boolean;
};

type KnownAction = SetSizeAction | SetShowPuzzlePieceActionsAction;
export type StoreDispatch = ReturnType<typeof useStoreDispatch>;

// ----- REDUCER -----
const storeReducer: Reducer<StoreState, KnownAction> = (state, action) => {
  switch (action.type) {
    case 'SET_SIZE':
      return { ...state, size: action.payload } satisfies StoreState;
    case 'SET_PUZZLE_PIECE_ACTIONS':
      return { ...state, showPuzzlePieceActions: action.payload } satisfies StoreState;
    default:
      return action satisfies never;
  }
};
