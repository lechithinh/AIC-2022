import {
  HIDE_SPINNER,
  SET_RECEIVED_DATA,
  SET_SENT_DATA,
  SHOW_PREVIEWER,
  SHOW_SPINNER,
} from "./constants";

export const setRcvData = (payload) => ({
  type: SET_RECEIVED_DATA,
  payload,
});

export const setSentData = (payload) => ({
  type: SET_SENT_DATA,
  payload,
});

export const showSpinner = () => ({
  type: SHOW_SPINNER,
});

export const hideSpinner = () => ({
  type: HIDE_SPINNER,
});

export const setPreviewer = (payload) => ({
  type: SHOW_PREVIEWER,
  payload,
});
