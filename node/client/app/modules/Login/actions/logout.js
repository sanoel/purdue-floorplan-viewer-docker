import {saveLoginState} from '../../Login/actions/validateLogin'

function logout({state}) {
  state.set('app.permission_granted', false)
  saveLoginState(false, undefined)
}

export default logout
