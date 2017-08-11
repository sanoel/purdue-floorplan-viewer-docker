import React from 'react'
import {connect} from 'cerebral-view-react'

import styles from './styles.css'
import classNames from 'classnames/bind'
import {Circle} from 'better-react-spinkit'

let cx = classNames.bind(styles)

export default connect({
},
  class LoadingPage extends React.Component {

    render() {
      return (

        <Circle className = {cx('loading-indicator')}
          color="#c79d50" size={50}
        />

      )
    }
  }
)
