import {set, unset, copy, when } from 'cerebral/operators';

export let logIn = [
  postLogin, {
		success: [
		//session stuff??
			set('state:app.permission_granted', true),
			addAccessToken,
			when('state:app.url'), {
				true: [
					redirectToUrl,
					unset('state:app.url'),
				],
				false: [],
			}
		],
		error: [
			set('state:login.error', 'Invalid username/password combination'),
		],
	}
]

export let checkResponse = [
	set('state:app.permission_granted', true),
]

export let logout = [
	set('state:app.permission_granted', false),
  set('state:login.user', {name: '', password: ''}),
]

export let login = [

]

export let updateLoginInputs = [
  setLoginInputs
]

export let failedAuth = [	
	set('state:app.url', window.location.hash.substr(1)),
	...logout,
]

function redirectToUrl({input, state, services, output}) {
	return services.router.redirect(state.get('app.url'))
}

function postLogin({input, state, services, output}) {
  return services.http.post(`/login?username=${input.username}&password=${input.password}`).then((response) => {
		if (response.result.token) {
			return output.success({token: response.result.token})
		} else {
			console.log('TOKEN NOT RETURNED FROM POSTLOGIN')
		}
  }).catch((err) => {
    console.log(err);
    return output.error({message:err})
  })
}
postLogin.async = true;
postLogin.outputs = ['success', 'error']

function setLoginInputs({input, state}) {
  // Update name / password depending on which input box changes.
  state.set('login.user.'+input.id, input.value)
}

function addAccessToken({input, state, services}) {
	return services.http.updateOptions({
		headers: {
			'access_token': input.token,
		}
	})
}
