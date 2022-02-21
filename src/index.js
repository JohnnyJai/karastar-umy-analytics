import React from 'react';
import ReactDOM from 'react-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import App from './App';

const darkTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

// Burning - https://bscscan.com/token/0x0522ecfe37ab2bdb5d60a99e08d1e8379bd35c00?a=0x0b5ebf9bab9b796e9408a8222efa4fbab625313f#tokenAnalytics
// Minting - https://bscscan.com/token/0x0522ecfe37ab2bdb5d60a99e08d1e8379bd35c00?a=0x7788d9db565828fd99cfdc32414958587d09ae15#tokenAnalytics
// curl 'https://api.karastar.com/member/info' --data-raw 'timestamp=1642000944&uid=1482157&sign=6ba6f8c8c649df6c4b21ffcd0576f5be&_t=1642000944' --compressed

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
