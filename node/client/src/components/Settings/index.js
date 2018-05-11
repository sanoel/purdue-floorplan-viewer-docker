import React from 'react'
import {connect} from '@cerebral/react'
import Dropzone from 'react-dropzone';
import stylesLogin from '../Login/styles.module.css'
import styles from './styles.module.css'
import { CircularProgress } from 'material-ui'
import SmoothScroll from 'smoothscroll-polyfill'
import {state, signal } from 'cerebral/tags'
// Initialize smoothscroll-polyfill.
SmoothScroll.polyfill()

export default connect({
  // For importing/exporting the data for rooms from/to a JSON file.
  importing_rooms: state`app.importing_rooms`,
  exporting_rooms: state`app.exporting_rooms`,
  dropzone_hint: state`viewer.dropzone_hint`,
  app_ready: state`app.ready`,
  loading: state`app.generating_smas_report`,
  error: state`settings.error`,
  importRooms: signal`app.roomsDataImportationRequested`,
  exportRoomsJson: signal`app.roomsDataExportationRequested`,
  cancelImport: signal`app.roomsDataImportationAborted`,
  recievedRoomFile : signal`app.roomsDataFileReceived`,
  smasFileDropped: signal`settings.smasFileDropped`,
},
  class Settings extends React.Component {

    componentDidUpdate() {
      // Scroll down to the drop zone if it's there.
      if(this.props.importing_rooms) {
				//        window.scroll({ top: screen.height, left: 0, behavior: 'smooth' })
      }
    }
// ()=>this.props.importRooms()}
    render() {
      let dataBackup = (
        <div>
          <div className={styles['subtitle']}>
            <br/>
              <p>Data Backup</p>
            <br/>
          </div>
          <div className={styles['content']}>

            <div className={[styles['import-room-data-dropzone-div'], {'display-none': !this.props.importing_rooms}].join(' ')}>
              <hr/>
              <Dropzone 
                className={styles['import-room-data-dropzone']}
                multiple={true}
		accept='text/csv'
                onDrop={ (accepted, rejected)=>this.props.smasFileDropped({accepted, rejected}) } >
                <div>{this.props.error ? this.props.error : this.props.dropzone_hint}</div>
              </Dropzone>
            </div>

            <div className={styles['import-room-data-div']}>
              <button 
                className= {['pure-button', stylesLogin['purdue-button'], styles['import-room-data-button'], {'display-none': this.props.importing_rooms}].join(' ')}
                onClick={()=> this.props.smasFileDropped({})} >
                Generate SMAS Report 
              </button>
              <button 
                className= {['pure-button', stylesLogin['purdue-button'], styles['cancel-import-room-data-button'], {'display-none': !this.props.importing_rooms}].join(' ')}
                onClick={()=>this.props.cancelImport()}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )

      return (

        <div className = {[styles['wrapper'], {'disabled':!this.props.app_ready}].join(' ')}>
          {this.props.loading ? <div className={styles['loading-modal']}>
            <CircularProgress />
           </div> : null }
          <div className={styles['title']}>Settings</div>
          {dataBackup}
        </div>

      )
    }
  }
)
