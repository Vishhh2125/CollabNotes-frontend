import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import  {BrowserRouter}  from 'react-router-dom';
import {Provider} from "react-redux";
import store from './store/store.js';
import { setLogoutHandler } from './api/api.js';
import { logoutAndReset } from './features/sessionActions.js';

// Inject logout handler into api layer to avoid circular imports
setLogoutHandler(() => store.dispatch(logoutAndReset()));
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </StrictMode>,
)
