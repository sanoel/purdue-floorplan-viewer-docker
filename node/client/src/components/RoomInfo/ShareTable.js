/*
  This component renders information for a selected room. It
  shows up in the Viewer component when a room is selected.
  It lists all shares on each room in a table. It also lists 
  people that have been assigned to the room as clickable 
  links to their respective PersonInfo pages.
  
*/
import React from 'react'
import {connect} from '@cerebral/react'
import styles from './styles.module.css'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import { Chip, IconButton, Paper, } from 'material-ui'
import ShareDialog from '../ShareDialog'
import {state, signal } from 'cerebral/tags'

let cellStyle = {
  paddingLeft: '12px',
  paddingRight: '12px',
}
let edittedCellStyle = {
  paddingLeft: '12px',
	paddingRight: '12px',
	backgroundColor: '#f00'
}
export default connect({
  room: state`roominfo.room`,
  shares: state`roominfo.room.shares`,
  dialogShareKey: state`roominfo.share_dialog.share`,
  departments: state`personinfo.departments`,
  newShare: state`roominfo.room_edits.new_share`,
  roomTypes: state`roominfo.room_types`,
  dialogOpen: state`roominfo.share_dialog.open`,
  roomTypeChanged: signal`roominfo.roomTypeChanged`,
  departmentUsingChanged: signal`roominfo.departmentUsingChanged`,
  departmentAssignedChanged: signal`roominfo.departmentAssignedChanged`,
  percentChanged: signal`roominfo.percentChanged`,
  stationsChanged: signal`roominfo.stationsChanged`,
  noteChanged: signal`roominfo.noteChanged`,
  addShareButtonClicked: signal`roominfo.addShareButtonClicked`,
  shareEditButtonClicked: signal`roominfo.shareEditButtonClicked`,
  personClicked: signal`viewer.personPageRequested`,
},
  class SharesTable extends React.Component {

    render() {
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
            displayRowCheckbox={false}>
            {Object.keys(this.props.shares).map((key, i) => (
            <TableRow key={'sharetable-'+i}> 
              <TableRowColumn style={this.props.shares[key].edit ? edittedCellStyle : cellStyle}>{this.props.shares[key].type}</TableRowColumn>}
              <TableRowColumn style={this.props.shares[key].edit ? edittedCellStyle : cellStyle }>{this.props.shares[key].percent}</TableRowColumn>
              <TableRowColumn style={this.props.shares[key].edit ? edittedCellStyle : cellStyle }>{this.props.shares[key].assigned}</TableRowColumn>
              <TableRowColumn style={this.props.shares[key].edit ? edittedCellStyle : cellStyle}>{this.props.shares[key].using}</TableRowColumn>
              <TableRowColumn style={this.props.shares[key].edit ? edittedCellStyle : cellStyle}>{this.props.shares[key].area}</TableRowColumn>
              <TableRowColumn style={this.props.shares[key].edit ? edittedCellStyle : cellStyle}>{this.props.shares[key].stations}</TableRowColumn>
              <TableRowColumn style={this.props.shares[key].edit ? edittedCellStyle : cellStyle}>{Object.keys(this.props.shares[key].persons).map((person, p) => (
								<Chip
									labelColor='blue'
									style={{margin: '2px', cursor:'pointer', textDecoration:'underline'}}
                  onTouchTap={()=>{this.props.personClicked({person:this.props.shares[key].persons[person].name})}}
                  key={'person_chip_'+p}>
                  {this.props.shares[key].persons[person].name}
                </Chip> ))}
              </TableRowColumn>
              <TableRowColumn style={this.props.shares[key].edit ? edittedCellStyle : cellStyle}>{this.props.shares[key].note}</TableRowColumn>
              <TableRowColumn style={this.props.shares[key].edit ? edittedCellStyle : cellStyle}>
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
