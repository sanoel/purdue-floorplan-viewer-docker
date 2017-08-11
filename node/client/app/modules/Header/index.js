import logout from '../Login/chains/logout'

export default module => {

  module.addSignals({
    logoutClicked: logout
  })

}
