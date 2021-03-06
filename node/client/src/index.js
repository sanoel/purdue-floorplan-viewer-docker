import React from 'react'
import {render} from 'react-dom'
import {Container} from '@cerebral/react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import controller from './controller'
import App from './components/App'
import spacing from 'material-ui/styles/spacing';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
injectTapEventPlugin();

const muiTheme = getMuiTheme({
  spacing: spacing,
  fontFamily: 'Roboto, sans-serif',
  borderRadius: 2,
  palette: {
    primary1Color: '#c79d50',
    primary2Color: '$FFCA00',
    primary3Color: '#FFE082',
    accent1Color: '#9E9E9E',
    textColor: '#212121',
    secondaryTextColor: '#757575',
    borderColor: '#BDBDBD',
  },
});

render((
  <Container controller={controller}>
  <MuiThemeProvider muiTheme={muiTheme}>
    <App />
  </MuiThemeProvider>
  </Container>
), document.getElementById('root'))
