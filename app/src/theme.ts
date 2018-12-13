import { createMuiTheme } from '@material-ui/core/styles'
import grey from '@material-ui/core/colors/grey'

const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  },
  palette: {
    primary: grey
  }
})

export default theme
