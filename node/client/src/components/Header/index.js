import React from 'react'
import {connect} from '@cerebral/react'
// For styles, the order of importing matters.
import stylesLogin from '../Login/styles.module.css'
import styles from './styles.module.css'
import { RaisedButton, FontIcon } from 'material-ui';
import {state, signal } from 'cerebral/tags'

export default connect({
  username: state`login.user`,
	token: state`login.token`,
  permission_granted: state`app.permission_granted`,
  settingsPageRequested: signal`app.settingsPageRequested`,
  frontPageRequested: signal`app.frontPageRequested`,
  logoutClicked: signal`header.logoutClicked`,
  loginClicked: signal`header.loginClicked`
},
  class Header extends React.Component {

    render() {
      let buttonsInHeader = (
        <div className={styles['header-buttons-wrapper']}>
          <RaisedButton 
            className={[stylesLogin['purdue-button'], styles['header-button']].join(' ')}
            label='Settings'
            labelPosition='before'
            icon={<FontIcon className="fa fa-cog" />}
            primary={true}
            onTouchTap={() => this.props.settingsPageRequested()}
          />
					{this.props.username ? 
          <RaisedButton 
            className={[stylesLogin['purdue-button'], styles['header-button']].join(' ')}
            label={'Logout'}
            labelPosition='before'
            primary={true}
            icon={<FontIcon className={"fa fa-sign-out"} />}
            onTouchTap={() => this.props.logoutClicked()}
          />
					:
          <RaisedButton 
            className={[stylesLogin['purdue-button'], styles['header-button']].join(' ')}
            label={'Login'}
            labelPosition='before'
            primary={true}
            icon={<FontIcon className={"fa fa-sign-in"} />}
            onTouchTap={() => this.props.loginClicked()}
          />
					}
        </div>
      )

      return (
        <div className={styles.header}>
          {
            this.props.permission_granted?
            buttonsInHeader
            :
            null
          }
           <div className={styles.logoWrapper}>
           <div className={styles.logo}>
              <a href="http://purdue.edu/"><img src="/img/logo_Purdue.png" alt=''/></a>
              <div className={styles.title}
                onClick={()=>{this.props.frontPageRequested()}}
              >
                CoE Floor Plan Viewer</div>
            </div>
          </div>
        </div>
      )
    }
  }
)
