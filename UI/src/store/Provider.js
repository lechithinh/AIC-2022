
import React, { createContext, useReducer } from "react";
import reducer, { initStates } from "./reducer";
const StoreContext = createContext();

const Provider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initStates);

  return (
    <StoreContext.Provider value={[state, dispatch]}>
      {children}
      
    </StoreContext.Provider>
  );
};

export { StoreContext, Provider };
