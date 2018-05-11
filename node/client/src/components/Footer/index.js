import React from 'react'
import {connect} from '@cerebral/react'

import styles from './styles.module.css'

export default connect({
},
  class Footer extends React.Component {

    render() {
      return (
        <div className={['pure-g', styles['wrapper'], styles['footer']].join(' ')}>
          <p className={['pure-u-1', 'pure-u-sm-4-4', styles['content']].join(' ')}>
            @ 2017 Purdue University | For College of Engineering Space Committee only. | Contact sanoel@purdue.edu for support.
          </p>
        </div>
      )
    }
  }
)
