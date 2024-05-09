import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.scss'
import { Provider } from "react-redux"
import { applyMiddleware, createStore } from "redux"
import { thunk } from "redux-thunk"
import rootReducer from "./reducers"
// dev tools
// import { logger } from "redux-logger";
import { composeWithDevTools } from "redux-devtools-extension";
import { getUsers } from './actions/users.actions';


const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(thunk))
);

store.dispatch(getUsers())

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

