import { Controller } from 'cerebral'
import root from './modules/root.js'

const Devtools = (
  process.env.NODE_ENV === 'production' ? null : require('cerebral/devtools').default 
)

export default Controller (root, {

	devtools: Devtools && Devtools({
    host: 'localhost:8585' 
	}),

})
