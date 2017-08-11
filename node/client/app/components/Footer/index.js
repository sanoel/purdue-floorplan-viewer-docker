import React from 'react'
import {connect} from 'cerebral-view-react'

import styles from './styles.css'
import classNames from 'classnames/bind'

let cx = classNames.bind(styles)

export default connect({
},
  class Footer extends React.Component {

    render() {
      return (
        <div className={cx('pure-g', 'wrapper', 'footer')}>
          <p className={cx('pure-u-1', 'pure-u-sm-4-4', 'content')}>
            @ 2016 Purdue University | For demonstration only.
          </p>
        </div>
      )
    }
  }
)
