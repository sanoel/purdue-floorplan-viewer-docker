import {set, when} from 'cerebral/operators'
import {redirect} from '@cerebral/router/operators'
import {state} from 'cerebral/tags'
import { addAccessToken } from '../Login/chains'

function authenticate (continueSequence) {

	return [
    when(state`login.token`), {
      'true': [addAccessToken, ...continueSequence],
      'false': redirect('/')
    }
  ]
}

export default authenticate
