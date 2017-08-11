import React from 'react'
import {connect} from 'cerebral-view-react'
import styles from './styles.css'
import Header from '../Header'
import Login from '../Login'
import Viewer from '../Viewer'
import Footer from '../Footer'

export default connect({
  permission_granted: 'app.permission_granted'
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
