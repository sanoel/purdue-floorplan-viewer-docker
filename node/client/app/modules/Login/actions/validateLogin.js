function validateLogin({input, state}) {

  // TODO: Change hard-coded user info with something better.
  let validUserInfo = {'test': '123'}

  // Three possibilities:
  //    - Correct username & password pair.
  //    - Already logged in.
  //    - Not logged in and wrong login info.
  if(state.get('login.user.password') === validUserInfo[state.get('login.user.name')]) {
    // Grant the permission.
    state.set('app.permission_granted', true)
    saveLoginState(true, state.get('login.user.name'))
    state.set('login.error', '')

  } else if (loadLoginState().temp===LOGGED_IN) {
    // Retrieve user information.
    state.set('app.permission_granted', true)
    state.set('login.user.name', loadLoginState().user)
    state.set('login.error', '')

  } else {
    // Decline the login attempt.
    state.set('app.permission_granted', false)
    saveLoginState(false, undefined)
    if(state.get('login.user.name')) {
      state.set('login.error', 'Invalid username / password')
    }
  }

  // And always clear the password stored.
  state.set('login.user.password', '')
}

export default validateLogin

/*
  Helps for storing / Retrieving login information to / from the local storage.
 */
export function storageAvailable(type) {
	try {
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e) {
		return false;
	}
}

// TODO: Use real authentication procedures instead of saving states locally.
const LOGGED_IN = '8435200a-5368-11e6-beb8-9e71128cae77'
const LOGGED_OUT = '9fdbc746-5368-11e6-beb8-9e71128cae77'

export function saveLoginState(state, username) {
  if(storageAvailable('localStorage')) {
    let value = state? LOGGED_IN:LOGGED_OUT
    localStorage.setItem('temp', value)
    localStorage.setItem('user', username)
  }
}

export function loadLoginState() {
  if(storageAvailable('localStorage')) {
    return {
      temp: localStorage.getItem('temp'),
      user: localStorage.getItem('user')
    }
  } else {
    return undefined
  }
}
