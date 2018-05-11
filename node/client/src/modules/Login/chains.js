import {set, unset, when } from 'cerebral/operators';
import { state, props } from 'cerebral/tags';
import md5 from 'md5'

let completeLogin = [
	set(state`app.permission_granted`, true),
	set(state`login.token`, props`token`),
	set(state`login.user`, {name: '', password: ''}),
	addAccessToken,
	when(state`app.url`), {
		true: [
			redirectToUrl,
			unset(state`app.url`),
		],
		false: [],
	}
]

export let init = [
	checkCacheToken, {
		success: completeLogin,
		error: []
	}
]

export let logIn = [
  postLogin, {
		success: completeLogin,
		error: [
			set(state`login.error`, 'Invalid username/password combination'),
		],
	}
]

export let checkResponse = [
	set(state`app.permission_granted`, true),
]

export let logout = [
	set(state`app.permission_granted`, false),
	unset(state`login.token`),
  set(state`login.user`, {name: '', password: ''}),
]

export let login = [

]

export let updateLoginInputs = [
  setLoginInputs
]

export let failedAuth = [	
	set(state`app.url`, window.location.hash.substr(1)),
	...logout,
]

function checkCacheToken({props, state, path}) {
	let token = state.get(`login.token`)
	if (token) return path.success({token})
	return path.error({})
}

function redirectToUrl({props, state, http, path}) {
	return http.router.redirect(state.get('app.url'))
}

function postLogin({props, state, http, path}) {
  return http.post(`/login?username=${props.username}&password=${md5(props.password)}`).then((response) => {
		if (response.result.token) {
			return path.success({token: response.result.token})
		} else {
			console.log('TOKEN NOT RETURNED FROM POSTLOGIN')
		}
  }).catch((err) => {
    console.log(err);
    return path.error({message:err})
  })
}
postLogin.async = true;
postLogin.paths = ['success', 'error']

function setLoginInputs({props, state}) {
  // Update name / password depending on which props box changes.
  state.set('login.user.'+props.id, props.value)
}

export function addAccessToken({props, state, http}) {
	return http.updateOptions({
		headers: {
			'access_token': props.token,
		}
	})
}
