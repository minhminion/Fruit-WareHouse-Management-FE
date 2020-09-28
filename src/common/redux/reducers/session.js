import { handleActions } from "redux-actions";
import { clearAll } from "../actions/uiActions";
import * as actions from "../actions/session";

const updateFetching = (fetching, payload, upDown) => {
  const { config } = payload;
  const key = config.key || config.url;
  if (upDown < 0 && fetching[key] + upDown === 0) {
    delete fetching[key];
  } else {
    fetching[key] = (fetching[key] || 0) + upDown;
  }
  return fetching;
};

const defaultState = {
  fetching: {},
  loadingCount: 0,
  isLoading: false,
  messages: {},
  sessionLoading: false,
};

const handlers = {
  [clearAll]: (state, action) => ({ ...defaultState }),
  [actions.fetchStart]: (state, action) => ({
    ...state,
    ...{ fetching: updateFetching(state.fetching, action.payload, 1) },
  }),
  [actions.fetchSuccess]: (state, action) => ({
    ...state,
    ...{ fetching: updateFetching(state.fetching, action.payload, -1) },
  }),
  [actions.fetchEnd]: (state, action) => ({
    ...state,
    ...{ fetching: updateFetching(state.fetching, action.payload, -1) },
  }),
  [actions.fetchFailure]: (state, action) => ({
    ...state,
    ...{ fetching: updateFetching(state.fetching, action.payload, -1) },
  }),
  [actions.loadStart]: (state, action) => {
    return {
      ...state,
      ...{
        loadingCount: state.loadingCount + 1,
        isLoading: true,
      },
    };
  },
  [actions.loadEnd]: (state, action) => ({
    ...state,
    ...{
      loadingCount: state.loadingCount - 1,
      isLoading: state.loadingCount > 1,
    },
  }),
  [actions.setSessionLoading]: (state, action) => {
    return {
      ...state,
      sessionLoading: action.payload,
    };
  },
};

export default handleActions(handlers, defaultState);
