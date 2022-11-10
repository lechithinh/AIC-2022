import { useContext } from "react";
import { StoreContext } from "./Provider";

export const useStore = () => {
  const [state, dispatch] = useContext(StoreContext);

  return [state, dispatch];
};
