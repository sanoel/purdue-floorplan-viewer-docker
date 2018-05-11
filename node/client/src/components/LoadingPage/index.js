import React from 'react'
import {connect} from '@cerebral/react'

import styles from './styles.module.css'
import {Circle} from 'better-react-spinkit'


export default connect({
},
  class LoadingPage extends React.Component {

    render() {
      return (

        <Circle className = {styles['loading-indicator']}
          color="#c79d50" size={50}
        />

      )
    }
  }
)
