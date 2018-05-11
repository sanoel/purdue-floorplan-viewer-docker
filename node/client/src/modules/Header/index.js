import { Module } from 'cerebral'
import { login, logout } from '../Login/chains'

export default Module({

  signals: {
    logoutClicked: logout,
    loginClicked: login,
  }
})
