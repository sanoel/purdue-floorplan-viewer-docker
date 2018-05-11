import React from 'react'
import {connect} from '@cerebral/react'
import styles from './styles.module.css'
import Header from '../Header'
import Login from '../Login'
import Viewer from '../Viewer'
import Footer from '../Footer'
import {state} from 'cerebral/tags'

export default connect({
  permission_granted: state`app.permission_granted`,
},
  class App extends React.Component {

    render() {

      return (
        <div className={styles.app}>
          <Header />
          {
            this.props.permission_granted ?
              <Viewer />
            :
              <Login />
          }
          <Footer />
        </div>
      )
    }
  }
)
