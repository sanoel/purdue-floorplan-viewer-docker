import React from 'react'
import {connect} from 'cerebral-view-react'
// For styles, the order of importing matters.
import stylesLogin from '../Login/styles.css'
import styles from './styles.css'
import { RaisedButton, FontIcon } from 'material-ui';

export default connect({
  username: 'login.user.name',
  permission_granted: 'app.permission_granted'
}, {
  settingsPageRequested: 'app.settingsPageRequested',
  frontPageRequested: 'app.frontPageRequested',
  logoutClicked: 'header.logoutClicked'
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
          <RaisedButton 
            className={[stylesLogin['purdue-button'], styles['header-button']].join(' ')}
            label='Logout'
            labelPosition='before'
            primary={true}
            icon={<FontIcon className="fa fa-sign-out" />}
            onTouchTap={(evt) => this.props.logoutClicked(evt)}
          />
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
              <a href="http://purdue.edu/"><img src="/img/logo_Purdue.png" /></a>
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
