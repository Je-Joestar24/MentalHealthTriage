import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/styles/index.css';
import { Provider } from "react-redux";      // 👈 import Provider
import { store } from "./store";            // 👈 import your Redux store
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

import AppRouter from "./router";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppRouter />
      </ThemeProvider>
    </Provider>
  </StrictMode>
);