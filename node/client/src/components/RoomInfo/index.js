/*
  This component renders information for a selected room. It
  shows up in the Viewer component when a room is selected.
  It also lists people that have been assigned to the room
  as clickable links to their respective PersonInfo pages.
*/
import React from 'react'
import {connect} from '@cerebral/react'
import {Circle} from 'better-react-spinkit'
import SharesTable from './ShareTable'
import InfoTable from './InfoTable'
import PersonTable from './AssignedPersonTable'
import styles from './styles.module.css'

import {state } from 'cerebral/tags'

export default connect({
	saving_rooms: state`app.saving_rooms`,
	room: state`roominfo.room`
},
  class RoomInfo extends React.Component {

    render() {
      return (
				<div>
					{this.props.room ? 
						<div className={styles['roominfo']}>
							<InfoTable />
							<SharesTable />
							<Circle 
								id="loading-indicator"
								className={!this.props.saving_rooms ? styles['display-none']: styles['loading-indicator']}
								color="#c79d50" 
								size={50}
							/>
							<PersonTable />
							{/*<div className={styles['edit-date']}><p >Last edited {moment(this.props.room.edit.date).format('MMMM Do YYYY, h:mm:ss a')}</p></div>*/}
						</div> : <p>Unknown Room</p>}
				</div> 
      )
    }
  }
)
