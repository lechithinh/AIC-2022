import {
  HIDE_SPINNER,
  SET_RECEIVED_DATA,
  SET_SENT_DATA,
  SHOW_PREVIEWER,
  SHOW_SPINNER,
} from "./constants";

const initStates = {
  dataRcv: {
    csv: "",
    urls: [],
  },
  dataSend: {},
  openBackDrop: false,
  previewerConfig: {
    open: false,
    title: "Preview Image",
    src: "./error-image-generic.png",
    videoLink: "",
    folderPath: "",
  },
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
        openBackDrop: true,
      };

    case HIDE_SPINNER:
      return {
        ...state,
        openBackDrop: false,
      };

    case SHOW_PREVIEWER:
      return {
        ...state,
        previewerConfig: payload,
      };

    default:
      throw new Error("Invalid action!");
  }
}

export { initStates };
export default reducer;
