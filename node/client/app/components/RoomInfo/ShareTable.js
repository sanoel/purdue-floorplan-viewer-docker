/*
  This component renders information for a selected room. It
  shows up in the Viewer component when a room is selected.
  It lists all shares on each room in a table. It also lists 
  people that have been assigned to the room as clickable 
  links to their respective PersonInfo pages.
  
*/
import React from 'react'
import {connect} from 'cerebral-view-react'
import styles from './styles.css'
import classNames from 'classnames/bind'
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import { Chip, IconButton, TextField, FontIcon, RaisedButton, DropDownMenu, MenuItem, Paper, Popover, Checkbox } from 'material-ui'
import ShareDialog from './ShareDialog'

let cellStyle = {
  paddingLeft: '12px',
  paddingRight: '12px',
}

let roomOptions = ['208 V', '220 V', '480 V', 'Single Phase', 'Three Phase']

export default connect({
  room: 'roominfo.room',
  shares: 'roominfo.room.shares',
  dialogShareKey: 'roominfo.share_dialog.share',
  departments: 'personinfo.departments',
  newShare: 'roominfo.room_edits.new_share',
  roomTypes: 'roominfo.room_types',
  dialogOpen: 'roominfo.share_dialog.open',
}, {
  roomTypeChanged: 'roominfo.roomTypeChanged',
  departmentUsingChanged: 'roominfo.departmentUsingChanged',
  departmentAssignedChanged: 'roominfo.departmentAssignedChanged',
  percentChanged: 'roominfo.percentChanged',
  stationsChanged: 'roominfo.stationsChanged',
  noteChanged: 'roominfo.noteChanged',
  addShareButtonClicked: 'roominfo.addShareButtonClicked',
  removeShareButtonClicked: 'roominfo.removeShareButtonClicked',
  roomOptionChanged: 'roominfo.roomOptionChanged',
  shareEditButtonClicked: 'roominfo.shareEditButtonClicked',
  personClicked: 'viewer.personPageRequested',
},
  class SharesTable extends React.Component {

    render() {
      let departmentMenuItems =this.props.departments.map((dept, i) => (
        <MenuItem key={'department-item-'+i} value={i} primaryText={dept} />
      ))
      let roomTypeMenuItems =this.props.roomTypes.map((type, i) => (
        <MenuItem key={'roomtype-item-'+i} value={i} primaryText={type} />
      ))
      return (
        <Paper className={styles['table-container']}>
          <span className={styles['table-title']}>
            SMAS Shares
          </span>
          {this.props.dialogOpen ? <ShareDialog shareKey={this.props.dialogShareKey}/> : null}
        <Table
          className={styles['shares-table']}
          style={{width:'auto'}}
          fixedHeader={false}
          selectable={false}>
          <TableHeader style={{width:'auto'}}
            displaySelectAll={false}
            adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn style={cellStyle}>Room Type</TableHeaderColumn>
              <TableHeaderColumn style={cellStyle}>Share (%)</TableHeaderColumn>
              <TableHeaderColumn style={cellStyle}>Department Assigned</TableHeaderColumn>
              <TableHeaderColumn style={cellStyle}>Department Using</TableHeaderColumn>
              <TableHeaderColumn style={cellStyle}>Area (ft<sup>2</sup>)</TableHeaderColumn>
              <TableHeaderColumn style={cellStyle}>Stations</TableHeaderColumn>
              <TableHeaderColumn style={cellStyle}>Description</TableHeaderColumn>
              <TableHeaderColumn style={cellStyle}>Internal Note</TableHeaderColumn>
              <TableHeaderColumn style={cellStyle}>Edit Share</TableHeaderColumn>
            </TableRow> 
          </TableHeader>
          <TableBody 
            style={{width:'auto'}}
            stripedRows={true}
            displaySelectAll={false}
            displayRowCheckbox={false}>
            {Object.keys(this.props.shares).map((key, i) => (
            <TableRow key={'sharetable-'+i}> 
              <TableRowColumn style={cellStyle, this.props.shares[key].edit ? {backgroundColor: '#f00' } : null}>{this.props.shares[key].type}</TableRowColumn>}
              <TableRowColumn style={cellStyle, this.props.shares[key].edit ? {backgroundColor: '#f00' } : null}>{this.props.shares[key].percent}</TableRowColumn>
              <TableRowColumn style={cellStyle, this.props.shares[key].edit ? {backgroundColor: '#f00' } : null}>{this.props.shares[key].assigned}</TableRowColumn>
              <TableRowColumn style={cellStyle, this.props.shares[key].edit ? {backgroundColor: '#f00' } : null}>{this.props.shares[key].using}</TableRowColumn>
              <TableRowColumn style={cellStyle, this.props.shares[key].edit ? {backgroundColor: '#f00' } : null}>{this.props.shares[key].area}</TableRowColumn>
              <TableRowColumn style={cellStyle, this.props.shares[key].edit ? {backgroundColor: '#f00' } : null}>{this.props.shares[key].stations}</TableRowColumn>
              <TableRowColumn style={cellStyle, this.props.shares[key].edit ? {backgroundColor: '#f00' } : null}>{Object.keys(this.props.shares[key].persons).map((person, p) => (
                <Chip
                  onTouchTap={()=>{this.props.personClicked({person:this.props.shares[key].persons[person].name})}}
                  key={'person_chip_'+p}>
                  {this.props.shares[key].persons[person].name}
                </Chip> ))}
              </TableRowColumn>
              <TableRowColumn style={cellStyle, this.props.shares[key].edit ? {backgroundColor: '#f00' } : null}>{this.props.shares[key].note}</TableRowColumn>
              <TableRowColumn style={cellStyle, this.props.shares[key].edit ? {backgroundColor: '#f00' } : null}>
                <IconButton                                                                                
                  onTouchTap={()=>{this.props.shareEditButtonClicked({share: this.props.shares[key]})}}
                  disabled={false}
                  iconClassName="material-icons">edit
                </IconButton>
              </TableRowColumn>
            </TableRow>))}
            <TableRow key={'sharetable-'+this.props.shares.length}> 
              <TableRowColumn style={cellStyle}>
                Add a share...
                <IconButton                                                                                
                  onTouchTap={()=>{this.props.addShareButtonClicked({})}}
                  disabled={false}
                  iconClassName="material-icons"> add_circle
                </IconButton>
              </TableRowColumn>
            </TableRow>
          </TableBody>
        </Table>
        </Paper>
      )
    }
  }
)
