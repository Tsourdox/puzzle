'use client';
import { Dispatch, PropsWithChildren, Reducer, createContext, useContext, useReducer } from 'react';

// ----- STATE -----
export type StoreState = {
  size: string;
};
const initialStoreState: StoreState = {
  size: 'S',
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
  payload: string;
};
type KnownAction = SetSizeAction;

// ----- REDUCER -----
const storeReducer: Reducer<StoreState, KnownAction> = (state, action) => {
  switch (action.type) {
    case 'SET_SIZE': {
      return { ...state, size: action.payload };
    }
  }
};
