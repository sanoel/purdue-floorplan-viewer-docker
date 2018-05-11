import React from 'react'
import {connect} from '@cerebral/react'
import styles from './styles.module.css'
import {state, signal } from 'cerebral/tags'
import { RaisedButton } from 'material-ui'

export default connect({
  username: state`login.user.name`,
  password: state`login.user.password`,
  is_validating: state`login.is_validating`,
  permission_granted: state`app.permission_granted`,
  error: state`login.error`,
  loginSubmitted: signal`login.loginSubmitted`,
	loginInputsChanged: signal`login.loginInputsChanged`,
	init: signal`login.init`,
},
	class Login extends React.Component {

		componentWillMount() {
			this.props.init()
		}

    // Update the value of input texts as the user types.
    onLoginInputsChange(event) {
      this.props.loginInputsChanged({
        id: event.target.id,
        value: event.target.value
      })
    }

    // Login confirmation.
    onLoginFormSubmit(event) {
      event.preventDefault()
      this.props.loginSubmitted({username:this.props.username, password: this.props.password})
    }

    render() {
      return (
        <div className={styles.loginForm}>

          <div className={styles.title}>
            <h1>Welcome!</h1>
          </div>

          <div className={styles.content}>
            <form className="pure-form pure-form-aligned"
              onSubmit={event => this.onLoginFormSubmit(event)}>
                <fieldset>
                    {/*
                      Input text boxes: We use one signal, onLoginInputsChange, to update
                      the values on the go.
                    */}
                    <div className="pure-control-group">
                        <label htmlFor="name">Username</label>
                        <input id="name" type="text" placeholder="Username"
                          autoFocus
                          disabled={this.props.is_validating}
                          value={this.props.username}
                          onChange={event => this.onLoginInputsChange(event)}
                          />
                    </div>

                    <div className="pure-control-group">
                        <label htmlFor="password">Password</label>
                        <input id="password" type="password" placeholder="Password"
                          disabled={this.props.is_validating}
                          value={this.props.password}
                          onChange={event => this.onLoginInputsChange(event)}
                          />
                    </div>


										<div className="pure-controls">
											<RaisedButton
												type="submit"
												backgroundColor='#c79d50'
												className={styles['purdue-button']}>Login</RaisedButton>
  
                    </div>
                </fieldset>

                {/*
                  Error text output.
                */}
                {
                  this.props.error ?
                    <div style={{color: 'red'}} className={styles['login-error']}>
                      <p>{this.props.error}</p>
                    </div>
                  :
                    null
                }
            </form>

          </div>

        </div>
      )
    }
  }
)
