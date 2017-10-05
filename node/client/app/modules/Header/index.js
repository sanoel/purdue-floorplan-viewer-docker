import { login, logout } from '../Login/chains'

export default module => {

  module.addSignals({
    logoutClicked: logout,
    loginClicked: login,
  })
}
