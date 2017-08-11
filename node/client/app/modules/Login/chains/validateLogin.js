import {set} from 'cerebral/operators'
import validateLogin from '../actions/validateLogin'

export default [
  
  // Disable the input boxes until the validation is done.
  set('state:login.is_validating', true),

  validateLogin,

  // The validation is done. Enable the input boxes.
  set('state:login.is_validating', false)

]
