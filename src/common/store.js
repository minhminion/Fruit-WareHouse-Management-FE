import { createStore, compose, applyMiddleware } from "redux";
import storage from "redux-persist/lib/storage";
import { getCookie } from "./utils/cookie";
import { persistCombineReducers, persistStore } from "redux-persist";
import thunk from "redux-thunk";
import uiReducer from "./redux/reducers/uiReducer";
import { rootReducer } from "../modules";
import session from "./redux/reducers/session";

const config = {
  key: "shopping",
  storage,
  blacklist: ["user", "sessions", "member"],
};
const createMiddlewares = (thunk) => {
  const middlewares = [];

  if (thunk) {
    middlewares.push(thunk);
  }

  return applyMiddleware.apply({}, middlewares);
};

function mapCookieToStorage() {
  let initialState;
  try {
    const user = JSON.parse(getCookie("user"));
    initialState = {
      user: {
        user: user,
        exp: getCookie("exp"),
        token: getCookie("token"),
        refreshToken: getCookie("refreshToken"),
        isSigned: user && true,
      },
    };
  } catch (err) {
    console.log("======== Bao Minh: mapCookieToStorage -> err", err);
    initialState = undefined;
  }
  return initialState;
}

const createReducers = (reducers) => {
  return persistCombineReducers(config, {
    ui: uiReducer,
    sessions: session,
    ...rootReducer,
  });
};
const composeEnhancers =
  process.env.NODE_ENV !== "production"
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
    : compose;

const buildStore = (reducers) => {
  const initialState = mapCookieToStorage();
  console.log("======== Bao Minh: buildStore -> initialState", initialState);
  const store = createStore(
    createReducers(reducers),
    initialState,
    composeEnhancers(createMiddlewares(thunk))
  );

  const persistor = persistStore(store);
  if (module.hot) {
    module.hot.accept(() => {
      store.replaceReducer(createReducers(reducers));
    });
  }

  store.reducers = createReducers(reducers);
  return { persistor, store };
};

export default buildStore();
