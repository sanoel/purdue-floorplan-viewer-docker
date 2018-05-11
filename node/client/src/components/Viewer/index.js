import React from 'react'
import {connect} from '@cerebral/react'
import styles from './styles.module.css'
import Sidebar from '../Sidebar'
import CampusMap from '../CampusMap'
import Cards from '../Cards'
import FloorPlans from '../FloorPlans'
import RoomInfo from '../RoomInfo'
import PersonInfo from '../PersonInfo'
import Settings from '../Settings'
import NotFoundPage from '../NotFoundPage'
import LoadingPage from '../LoadingPage'
import {Circle} from 'better-react-spinkit'
import $ from 'jquery'
import SmoothScroll from 'smoothscroll-polyfill'
import { state, signal } from 'cerebral/tags'
SmoothScroll.polyfill()

const pages = {
  campusmap: CampusMap,
  cards: Cards,
  building: Cards,
  floorplan: FloorPlans,
  room: RoomInfo,
  person: PersonInfo,
  settings: Settings,
  notfoundpage: NotFoundPage,
  loadingpage: LoadingPage
}

export default connect({
	viewer: state`viewer.state`,
	ready: state`app.ready`,
	viewerReadyUp: signal`viewer.viewerReadyUp`,
},
  class Viewer extends React.Component {
    constructor(props) {
			props.viewerReadyUp({})
			super(props)
    }

    componentDidUpdate() {
      //TODO: implement differently...css?
      // For supporting smaller screens, we need to scroll to the main content part
      // of the viewer if it's not the initial screen.
      //
      // 768 px ~= 48em = the bound for md grids in purecss.
      if(window.innerWidth < 768) {
        if(this.props.viewer_state.current_page!=='campusmap') {
          let top = $('#viewer_sidebar').height()
          // The scrollIntoView method somehow doesn't work for smooth mode.
          window.scroll({ top: top, left: 0, behavior: 'smooth' })
        } else {
          window.scroll({ top: 0, left: 0, behavior: 'smooth' })
        }
      }
    }

    render() {
      const Page = pages[this.props.viewer.current_page]

      return (
        <div className={styles.viewer}>
          <Sidebar />
          <div className={styles['page-container']}>
            <div className={!this.props.ready ? styles['loading-indicator'] : styles.hidden}>
              <Circle color="#c79d50" size={50}/>
            </div>
            <Page className={this.props.ready ? styles.page : styles.hidden}/>
          </div>
        </div>
      )
    }
  }
)
