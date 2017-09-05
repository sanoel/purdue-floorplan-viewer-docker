/*
  This component renders information for a selected room. It
  shows up in the Viewer component when a room is selected.
  It also lists people that have been assigned to the room
  as clickable links to their respective PersonInfo pages.
*/
import React from 'react'
import {connect} from 'cerebral-view-react'
import styles from './styles.css'
import classNames from 'classnames/bind'
import { IconButton, Checkbox, Dialog, Popover, Paper, TextField, FontIcon, Divider, RaisedButton, DropDownMenu, MenuItem, FlatButton} from 'material-ui'
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'

let cellStyle = {
  paddingLeft: '12px',
  paddingRight: '12px',
}

export default connect(props => ({
  smas: `roominfo.room.smas`,
  open: 'originalsharesdialog.open',
  departments: 'personinfo.departments',
  roomTypes: 'roominfo.room_types',
}), {
  closeDialogClicked: 'originalsharesdialog.closeDialogClicked',
},

class OriginalSharesDialog extends React.Component {

  render() {
    let departmentMenuItems =this.props.departments.map((dept, i) => (
      <MenuItem key={'department-item-'+i} value={i} primaryText={dept} />
    ))
    let roomTypeMenuItems =this.props.roomTypes.map((type, i) => (
      <MenuItem key={'roomtype-item-'+i} value={i} primaryText={type} />
    ))

    const actions = [
      <FlatButton
        label="Close"
        primary={true}
        onTouchTap={()=>{this.props.closeDialogClicked({})}}
      />,
    ];

    return (
      <Dialog
        open={this.props.open}
        actions={actions}
        modal={false}
        className={styles['original-shares-dialog']}
        title={'Original SMAS Shares'}>
        <Table
          className={styles['shares-table']}
          style={{width:'auto'}}
          fixedHeader={false}>
          <TableHeader style={{width:'auto'}}
            displaySelectAll={false}
            adjustForCheckbox={false}
            enableSelectAll={false}>
            <TableRow>
              <TableHeaderColumn style={cellStyle}>Bldg</TableHeaderColumn>
              <TableHeaderColumn style={cellStyle}>Room</TableHeaderColumn>
              <TableHeaderColumn style={cellStyle}>Share Number</TableHeaderColumn>
              <TableHeaderColumn style={cellStyle}>Share (%)</TableHeaderColumn>
              <TableHeaderColumn style={cellStyle}>Area (ft<sup>2</sup>)</TableHeaderColumn>
              <TableHeaderColumn style={cellStyle}>Department Using</TableHeaderColumn>
              <TableHeaderColumn style={cellStyle}>Department Assigned</TableHeaderColumn>
              <TableHeaderColumn style={cellStyle}>Stations</TableHeaderColumn>
              <TableHeaderColumn style={cellStyle}>Room Type</TableHeaderColumn>
              <TableHeaderColumn style={cellStyle}>Description</TableHeaderColumn>
              <TableHeaderColumn style={cellStyle}>Internal Note</TableHeaderColumn>
            </TableRow> 
          </TableHeader>
          <TableBody 
            style={{width:'auto'}}
            displayRowCheckbox={false}
            stripedRows={true}>
            {Object.keys(this.props.smas).map((key, i) => (
            <TableRow key={'sharetable-'+i}> 
              <TableRowColumn style={cellStyle}>{this.props.smas[key].building}</TableRowColumn>}
              <TableRowColumn style={cellStyle}>{this.props.smas[key].room}</TableRowColumn>}
              <TableRowColumn style={cellStyle}>{this.props.smas[key].share}</TableRowColumn>}
              <TableRowColumn style={cellStyle}>{this.props.smas[key].percent}</TableRowColumn>}
              <TableRowColumn style={cellStyle}>{this.props.smas[key].area}</TableRowColumn>
              <TableRowColumn style={cellStyle}>{this.props.smas[key].using}</TableRowColumn>
              <TableRowColumn style={cellStyle}>{this.props.smas[key].assigned}</TableRowColumn>
              <TableRowColumn style={cellStyle}>{this.props.smas[key].stations}</TableRowColumn>
              <TableRowColumn style={cellStyle}>{this.props.smas[key].type}</TableRowColumn>}
              <TableRowColumn style={cellStyle}>{this.props.smas[key].description}</TableRowColumn>
              <TableRowColumn style={cellStyle}>{this.props.smas[key].note}</TableRowColumn>
            </TableRow>))}
          </TableBody>
        </Table>
      </Dialog>
    )
  }
})