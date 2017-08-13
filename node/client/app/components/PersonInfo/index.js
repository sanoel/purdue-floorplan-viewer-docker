/*
  This component renders information for a selected person. It
  shows up in the Viewer component when a person is selected.
  Subordinate and supervisor persons are also listed as clickable
  links to those persons' respective PersonInfo pages.
  It also lists rooms that the person has been assigned to as
  clickable links to their respective RoomInfo pages.
*/
import React from 'react'
import {connect} from 'cerebral-view-react'
import stylesLogin from '../Login/styles.css'
import styles from './styles.css'
import classNames from 'classnames/bind'
import ShareTable from './ShareTable'
import PersonTable from '../PersonTable'
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import { Paper, TextField, FontIcon, RaisedButton, DropDownMenu, MenuItem } from 'material-ui'
let cx = classNames.bind(styles)

export default connect({
  editing: 'personinfo.editing',
  person: 'personinfo.person',
  shares: 'personinfo.shares',
  departments: 'personinfo.departments',
  statuses: 'personinfo.statuses',
  person_edits: 'personinfo.person_edits'
}, {
  roomsOnFloorplansPageRequested: 'viewer.roomsOnFloorplansPageRequested',
  roomPageRequested: 'viewer.roomsPageRequested',
  statusChanged: 'personinfo.statusChanged',
  departmentChanged: 'personinfo.departmentChanged',
  editButtonClicked: 'personinfo.editButtonClicked',
  doneButtonClicked: 'personinfo.doneButtonClicked',
},
  class PersonInfo extends React.Component {

    render() {
      let personInfoTitle = this.props.person ?
        <p>Name: {this.props.person.name}</p>
        : <p>Unknown Person</p>;

      return (
        <div className = {styles.personinfo}>
          <div className={styles.title}>Person Information</div>
          <div className={cx('person-info')}>
            {/*this.props.editing ? <RaisedButton
              className={styles['edit-button']}
              label="Done"
              labelPosition="before"
              onTouchTap={()=>{this.props.doneButtonClicked({})}}
              icon={<FontIcon className="material-icons">done</FontIcon>}
            /> : <RaisedButton
              className={styles['edit-button']}
              label="Edit"
              labelPosition="before"
              onTouchTap={()=>{this.props.editButtonClicked({})}}
              icon={<FontIcon className="material-icons">edit</FontIcon>}
            />*/}
            <Paper className={styles['table-container']}>
              <span className={styles['table-title']}>
                Person Information
              </span>
              <Table
                className={styles['info-table']}
                style={{width: 'auto'}} 
                fixedHeader={false} 
                selectable={false}>
                <TableHeader 
                  displaySelectAll={false}
                  adjustForCheckbox={false}
                  style={{width:'auto'}}>
                  <TableRow>
                    <TableHeaderColumn>Name</TableHeaderColumn>
                    <TableHeaderColumn>Status</TableHeaderColumn>
                    <TableHeaderColumn>Dept</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody 
                  style={{width:'auto'}}
                  stripedRows={true}
                  displaySelectAll={false}
                  displayRowCheckbox={false}>
                  <TableRow>
                    <TableRowColumn
                      onTouchTap={()=>{this.props.editing ? null : this.props.buildingPageRequested({building:this.props.room.building})}}>
                     {this.props.person.name}
                    </TableRowColumn>
                    <TableRowColumn>
                      {this.props.editing ? <DropDownMenu 
                        value={this.props.statuses.findIndex(x => x === this.props.person.status)} 
                        onChange={(evt, i, value)=>{this.props.statusChanged({status:this.props.statuses[value]})}}>
                        {this.props.statuses.map((status, i) => (
                          <MenuItem key={'status-item-'+i} value={i} primaryText={status} />
                        ))}
                      </DropDownMenu> : this.props.person.status}
                    </TableRowColumn>
                    <TableRowColumn>
                      {this.props.editing ? <DropDownMenu 
                        value={this.props.departments.findIndex(x => x === this.props.person.department)} 
                        onChange={(evt, i, value)=>{this.props.departmentChanged({department:this.props.departments[value]})}}>
                        {this.props.departments.map((dept, i) => (
                          <MenuItem key={'department-item-'+i} value={i} primaryText={dept} />
                        ))}
                      </DropDownMenu> : this.props.person.department}
                    </TableRowColumn>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
            {(this.props.editing || this.props.shares.length > 0) ? 
            <ShareTable 
              className={styles['person-room-table']}
            /> : null }
          </div>
        </div>
      )
    }
  }
)
