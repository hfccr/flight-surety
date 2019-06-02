/**
 * @author hfccr
 * */
import React from 'react';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme } from '@material-ui/core/styles';
import Header from './Header.jsx';
import Flights from './Flights.jsx';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#ffeb3b'
    }
  }
});

class App extends React.Component {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Header />
        <Flights />
      </MuiThemeProvider>
    );
  }
}

export default App;