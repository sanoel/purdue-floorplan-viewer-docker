import React from 'react'
import {connect} from '@cerebral/react'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import { Paper } from 'material-ui';
import styles from './styles.module.css'
import {state, signal } from 'cerebral/tags'

let cellStyle = {
  paddingLeft: '12px',
  paddingRight: '12px',
}

export default connect({
  editing: state`personinfo.editing`,
  shares: state`personinfo.shares`,
  newRoomText: state`roomtable.new_room.text`,
  matches: state`roomtable.new_room.matches`,
  match: state`roomtable.new_room.selected_match`,
  roomPageRequested: signal`viewer.roomPageRequested`,
},
  class ShareTable extends React.Component {

    render() {
      return (
        <Paper className={styles['table-container']}>
          <span className={styles['table-title']}>
            Assigned Shares
          </span>
        <Table
          style={{width:'auto'}} 
          fixedHeader={false} 
          selectable={false}>
          <TableHeader
            style={{width:'auto'}}
            displaySelectAll={false}
            adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn style={cellStyle}></TableHeaderColumn>
              <TableHeaderColumn style={cellStyle}>Room</TableHeaderColumn>
              <TableHeaderColumn style={cellStyle}>Type</TableHeaderColumn>
              <TableHeaderColumn style={cellStyle}>Area (ft<sup>2</sup>)</TableHeaderColumn>
              {/*this.props.editing ? <TableHeaderColumn style={cellStyle}>Unassign Room</TableHeaderColumn> : null*/}
            </TableRow>
          </TableHeader>
          <TableBody
            style={{width:'auto'}}
            stripedRows={true}
            displaySelectAll={false}
            displayRowCheckbox={false}>
            {this.props.shares.map((share, index) => (
              <TableRow 
                key={index}
                onTouchTap={()=>{/*this.props.editing ? null : */this.props.roomPageRequested({room:share.building + ' ' +share.room, building:share.building, floor:share.floor})}}>
                <TableRowColumn
                  style={cellStyle}>
                  {index+1}
                </TableRowColumn>
                <TableRowColumn
                  style={cellStyle}>
                  {share.building + ' ' + share.room}
                </TableRowColumn>
                <TableRowColumn
                  style={cellStyle}>
                  {share.type}
                </TableRowColumn>
                <TableRowColumn
                  style={cellStyle}>
                  {share.area}
                </TableRowColumn>
                {/*this.props.editing ? <TableRowColumn style={cellStyle}>
                  <IconButton
                    onTouchTap={(evt)=>{evt.stopPropagation(); this.props.removeRoomButtonClicked({room, person: this.props.person})}}
                    iconClassName="material-icons">delete
                  </IconButton>
                </TableRowColumn> : null*/}
              </TableRow>
            ))}
            <TableRow>
              <TableRowColumn
                style={cellStyle}>
              </TableRowColumn>
              <TableRowColumn
                style={cellStyle}>
              </TableRowColumn>
              <TableRowColumn
                style={cellStyle}>
              </TableRowColumn>
              <TableRowColumn
                style={cellStyle}>
                {this.props.shares.length > 0 ? this.props.shares.map((share) => {
                  return share.area
                }).reduce((acc, value) => {
                  return parseInt(acc, 10) + parseInt(value, 10)
                }) : 0}
              </TableRowColumn>
              {/*this.props.editing ? <TableRowColumn style={cellStyle}></TableRowColumn> : null*/ }
            </TableRow>
            {/*this.props.editing ? <TableRow>
              <TableRowColumn
                style={cellStyle}
                colSpan="5">
                <AutoComplete
                  searchText={this.props.newRoomText}
                  hintText="Assign a new share..."
                  errorText={(this.props.match.name) ? null : 'An existing share must be selected.'}
                  dataSource={this.props.matches.map((match) => (match.name))}
                  onNewRequest={(text, idx)=>{this.props.shareMatchSelected({idx, text, match:this.props.matches[idx]})}}
                  onUpdateInput={(searchText)=>{this.props.newRoomTextChanged({text:searchText})}}
                />
              </TableRowColumn>
              <TableRowColumn
                style={cellStyle}>
                <IconButton                                                                                
                  onTouchTap={()=>{this.props.addRoomButtonClicked({text: this.props.newRoomText, match: this.props.match, person: this.props.person})}}
                  disabled={this.props.match.name ? false : true}
                  iconClassName="material-icons">add_circle
                </IconButton>
              </TableRowColumn>
            </TableRow> : null*/}
          </TableBody>
        </Table>
        </Paper>
      )
    }
  }
)
