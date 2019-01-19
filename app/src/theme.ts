import { createMuiTheme } from '@material-ui/core/styles'
import grey from '@material-ui/core/colors/grey'

const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  },
  palette: {
    primary: grey
  },
  custom: {
    bidColor: {
      main: '#990000',
      light: '#f18484',
      dark: '#700000',
      contrastText: '#fff'
    },
    askColor: {
      main: '#009944',
      light: '#00C545',
      dark: '#007037',
      contrastText: '#fff'
    }
  },
  spacing: {
    unit: 4
  }
} as any)

export default theme
