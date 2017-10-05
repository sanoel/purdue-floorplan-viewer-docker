import React from 'react'
import {connect} from 'cerebral-view-react'

import styles from './styles.css'
import classNames from 'classnames/bind'

let cx = classNames.bind(styles)

export default connect({
  // The account information typed in by the user.
  username: 'login.user.name',
  password: 'login.user.password',

  // For locking the input boxes while validating the information.
  is_validating: 'login.is_validating',
  // Results
  permission_granted: 'app.permission_granted',
  error: 'login.error'
}, {
  loginSubmitted: `login.loginSubmitted`,
	loginInputsChanged: `login.loginInputsChanged`,
},
  class Login extends React.Component {

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
                        <button type="submit" className={cx('pure-button', 'purdue-button')}>Login</button>
                    </div>
                </fieldset>

                {/*
                  Error text output.
                */}
                {
                  this.props.error ?
                    <div style={{color: 'red'}} className={cx('login-error')}>
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
