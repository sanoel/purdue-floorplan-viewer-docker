import React from 'react'
import {connect} from 'cerebral-view-react'
import Dropzone from 'react-dropzone';
import stylesLogin from '../Login/styles.css'
import styles from './styles.css'
import classNames from 'classnames/bind'
import { CircularProgress } from 'material-ui'
let cx = classNames.bind(styles)
import SmoothScroll from 'smoothscroll-polyfill'
// Initialize smoothscroll-polyfill.
let SmoothScrollPolyfill = SmoothScroll.polyfill()

export default connect({
  // For importing/exporting the data for rooms from/to a JSON file.
  importing_rooms: 'app.importing_rooms',
  exporting_rooms: 'app.exporting_rooms',
  dropzone_hint: 'viewer.dropzone_hint',
  app_ready: 'app.ready',
  loading: 'app.generating_smas_report',
  error: 'settings.error',
}, {
  importRooms: 'app.roomsDataImportationRequested',
  exportRoomsJson: 'app.roomsDataExportationRequested',
  cancelImport: 'app.roomsDataImportationAborted',
  recievedRoomFile : 'app.roomsDataFileReceived',
  smasFileDropped: 'app.smasFileDropped',
},
  class Settings extends React.Component {

    componentDidUpdate() {
      // Scroll down to the drop zone if it's there.
      if(this.props.importing_rooms) {
        window.scroll({ top: screen.height, left: 0, behavior: 'smooth' })
      }
    }

    render() {
      let dataBackup = (
        <div>
          <div className={cx('subtitle')}>
            <br/>
              <p>Data Backup</p>
            <br/>
          </div>
          <div className={cx('content')}>

            <div className={cx('import-room-data-dropzone-div', {'display-none': !this.props.importing_rooms})}>
              <hr/>
              <Dropzone 
                className={cx('import-room-data-dropzone')}
                multiple={true}
		accept='text/csv'
                onDrop={ (accepted, rejected)=>this.props.smasFileDropped({accepted, rejected}) } >
                <div>{this.props.error ? this.props.error : this.props.dropzone_hint}</div>
              </Dropzone>
            </div>

            <div className={cx('import-room-data-div')}>
              <button 
                className= {cx('pure-button', stylesLogin['purdue-button'], 'import-room-data-button', {'display-none': this.props.importing_rooms})}
                onClick={()=>this.props.importRooms()}>
                Generate SMAS Report 
              </button>
              <button 
                className= {cx('pure-button', stylesLogin['purdue-button'], 'cancel-import-room-data-button', {'display-none': !this.props.importing_rooms})}
                onClick={()=>this.props.cancelImport()}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )

      return (

        <div className = {cx('wrapper', {'disabled':!this.props.app_ready})}>
          {this.props.loading ? <div className={cx('loading-modal')}>
            <CircularProgress />
           </div> : null }
          <div className={cx('title')}>Settings</div>
          {dataBackup}
        </div>

      )
    }
  }
)
