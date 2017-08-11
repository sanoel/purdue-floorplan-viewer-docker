/*
  This component renders information for a selected room. It
  shows up in the Viewer component when a room is selected.
  It also lists people that have been assigned to the room
  as clickable links to their respective PersonInfo pages.
*/
import React from 'react'
import {connect} from 'cerebral-view-react'
import {Circle} from 'better-react-spinkit'
import Dropzone from 'react-dropzone';
import stylesLogin from '../Login/styles.css'
import AssignedPersonTable from './AssignedPersonTable'
import SharesTable from './ShareTable'
import styles from './styles.css'
import classNames from 'classnames/bind'
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import { Paper, TextField, FontIcon, Divider, RaisedButton, DropDownMenu, MenuItem } from 'material-ui'
let cx = classNames.bind(styles)

let cellStyle = {
  'paddingLeft': '12px',
  'paddingRight': '12px',
}

export default connect({
  room: 'roominfo.room',
  roomTypes: 'roominfo.room_types',
  saving_rooms: 'app.saving_rooms',
  departments: 'personinfo.departments',
  app_ready: 'app.ready',
  room_edits: 'roominfo.room_edits',
}, {
  editButtonClicked: 'roominfo.editButtonClicked',
  doneButtonClicked: 'roominfo.doneButtonClicked',
  cancelButtonClicked: 'roominfo.cancelButtonClicked',
  buildingPageRequested: 'viewer.buildingPageRequested',
  floorplanPageRequested: 'viewer.floorplanPageRequested',
},
  class RoomInfo extends React.Component {

    render() {

/*
            {this.props.editing ? <div className={styles['done-cancel-buttons']}>
              <RaisedButton
                className={styles['done-button']}
                label="Done"
                labelPosition="before"
                onTouchTap={()=>{this.props.doneButtonClicked({room:this.props.room_edits})}}
                icon={<FontIcon className="material-icons">done</FontIcon>}
              />
              <RaisedButton
                className={styles['cancel-button']}
                label="Cancel"
                labelPosition="before"
                onTouchTap={()=>{this.props.cancelButtonClicked({room:this.props.room_edits})}}
                icon={<FontIcon className="material-icons">cancel</FontIcon>}
              /> 
            </div> : <RaisedButton
              className={styles['edit-button']}
              label="Edit"
              labelPosition="before"
              onTouchTap={()=>{this.props.editButtonClicked({})}}
              icon={<FontIcon className="material-icons">edit</FontIcon>}
            />}
*/

      return (
        <div className={this.props.app_ready ? styles['roominfo'] : styles.disabled}>
          <div className={styles.title}>Room Information</div>
          {this.props.room ? <div className={cx('room-info')}>
            <Paper className={this.props.saving_rooms ? styles.disabled : styles['table-container']}>
              <span className={styles['table-title']}>
                Room Information
              </span>
              <Table
                style={{width: 'auto'}}
                className={styles['roominfo-table']}
                fixedHeader={false}
                selectable={false}>
                <TableHeader
                  style={{width:'auto'}}
                  displaySelectAll={false}
                  adjustForCheckbox={false}>
                  <TableRow>
                    <TableHeaderColumn style={cellStyle}>Building</TableHeaderColumn>
                    <TableHeaderColumn style={cellStyle}>Floor</TableHeaderColumn>
                    <TableHeaderColumn style={cellStyle}>Room</TableHeaderColumn>
                    <TableHeaderColumn style={cellStyle}>Total Area (ft<sup>2</sup>)</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody 
                  style={{width:'auto'}}
                  stripedRows={true}
                  displaySelectAll={false}
                  displayRowCheckbox={false}>
                  <TableRow>
                    <TableRowColumn
                      style={cellStyle}
                      onTouchTap={()=>{this.props.buildingPageRequested({building:this.props.room.building})}}>
                      {this.props.room.building}
                    </TableRowColumn>
                    <TableRowColumn
                      style={cellStyle}
                      onTouchTap={()=>{ this.props.floorplanPageRequested({floor:this.props.building+this.props.room.floor})}}>
                      {this.props.room.floor}
                    </TableRowColumn>
                    <TableRowColumn
                      style={cellStyle}>
                      {this.props.room.name}
                    </TableRowColumn>
                    <TableRowColumn
                      style={cellStyle}>
                      {this.props.room.area}
                    </TableRowColumn>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
            <SharesTable />
            <Circle id="loading-indicator"
              className = {cx('loading-indicator', {'display-none':!this.props.saving_rooms})}
              color="#c79d50" size={50}
            />
          </div> : <p>Unknown Room</p>}
        </div>
      )
    }
  }
)
