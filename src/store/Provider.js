import { Backdrop } from "@mui/material";
import React, { createContext, useReducer } from "react";
import reducer, { initStates } from "./reducer";
import CircularProgress from "@mui/material/CircularProgress";
const StoreContext = createContext();

const Provider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initStates);

  return (
    <StoreContext.Provider value={[state, dispatch]}>
      {children}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={state.openBackDrop}
      >
        <CircularProgress color="inherit" disableShrink />
      </Backdrop>
    </StoreContext.Provider>
  );
};

export { StoreContext, Provider };
