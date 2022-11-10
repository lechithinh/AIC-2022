import {
  HIDE_SPINNER,
  SET_RECEIVED_DATA,
  SET_SENT_DATA,
  SHOW_SPINNER,
} from "./constants";

const initStates = {
  dataRcv: {
    csv: "",
    urls: [],
  },
  dataSend: {},
  openBackDrop: 0,
};

function reducer(state, action) {
  const { payload, type } = action;

  switch (type) {
    case SET_RECEIVED_DATA:
      return {
        ...state,
        dataRcv: payload,
      };

    case SET_SENT_DATA:
      return {
        ...state,
        dataSend: payload,
      };

    case SHOW_SPINNER:
      return {
        ...state,
        openBackDrop: 1,
      };

    case HIDE_SPINNER:
      return {
        ...state,
        openBackDrop: 0,
      };

    default:
      throw new Error("Invalid action!");
  }
}

export { initStates };
export default reducer;
