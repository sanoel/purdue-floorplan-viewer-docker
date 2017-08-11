import React from 'react'
import {connect} from 'cerebral-view-react'

import styles from './styles.css'
import classNames from 'classnames/bind'

let cx = classNames.bind(styles)

export default connect({
},
  class RoomInfo extends React.Component {

    render() {
      return (

        <div className = {styles.wrapper}>

          <div className={styles.title}>
            <br/>
            <hr/>
            <h1>Page Not Found</h1>
            <hr/>
          </div>

          <div className={styles.message}>
		        <p>We're sorry you were not able to find the page you were looking for.</p>
            <p><a href="/">Go back to the front page?</a></p>
          </div>

        </div>

      )
    }
  }
)
