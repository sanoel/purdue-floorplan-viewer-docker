import React from 'react'
import {connect} from 'cerebral-view-react'
import Dropzone from 'react-dropzone';
import stylesLogin from '../Login/styles.css'
import styles from './styles.css'
import classNames from 'classnames/bind'
let cx = classNames.bind(styles)
import SmoothScroll from 'smoothscroll-polyfill'
// Initialize smoothscroll-polyfill.
let SmoothScrollPolyfill = SmoothScroll.polyfill()

export default connect({
  // For importing/exporting the data for rooms from/to a JSON file.
  importing_rooms: 'app.importing_rooms',
  exporting_rooms: 'app.exporting_rooms',
  dropzone_hint: 'viewer.dropzone_hint',
  app_ready: 'app.ready'
}, {
  exportSmas: 'app.smasDataExportRequested',
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
            <div className={cx('export-room-data-div')}>
              <button 
                className={cx('pure-button', stylesLogin['purdue-button'], 'export-room-data-button')}
                onClick={()=> this.props.exportRoomsJson()}>
                Backup Data
              </button>
            </div>

            <div className={cx('export-smas-data-div')}>
              <button 
                className={cx('pure-button', stylesLogin['purdue-button'], 'export-smas-data-button', {'display-none': this.props.importing_rooms})}
                onClick={()=>this.props.exportSmas()}>
                Export SMAS Data
              </button>
            </div>

            <div className={cx('import-room-data-dropzone-div', {'display-none': !this.props.importing_rooms})}>
              <hr/>
              <Dropzone 
                className={cx('import-room-data-dropzone')}
                multiple={false}
                onDrop={ (filelist, evt)=>this.props.smasFileDropped({filelist, evt}) } >
                <div>{this.props.dropzone_hint}</div>
              </Dropzone>
            </div>

            <div className={cx('import-room-data-div')}>
              <button 
                className= {cx('pure-button', stylesLogin['purdue-button'], 'import-room-data-button', {'display-none': this.props.importing_rooms})}
                onClick={()=>this.props.importRooms()}>
                Import Data
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
          <div className={cx('title')}>Settings</div>
          {dataBackup}
        </div>

      )
    }
  }
)
