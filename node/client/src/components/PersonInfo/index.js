/*
  This component renders information for a selected person. It
  shows up in the Viewer component when a person is selected.
  Subordinate and supervisor persons are also listed as clickable
  links to those persons' respective PersonInfo pages.
  It also lists rooms that the person has been assigned to as
  clickable links to their respective RoomInfo pages.
*/
import React from 'react'
import {connect} from '@cerebral/react'
//import stylesLogin from '../Login/styles.module.css'
import styles from './styles.module.css'
import ShareTable from './ShareTable'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import { Paper, DropDownMenu, MenuItem } from 'material-ui'
import {state, signal } from 'cerebral/tags'

export default connect({
  editing: state`personinfo.editing`,
  person: state`personinfo.person`,
  shares: state`personinfo.shares`,
  departments: state`personinfo.departments`,
  statuses: state`personinfo.statuses`,
  person_edits: state`personinfo.person_edits`,
  statusChanged: signal`personinfo.statusChanged`,
  departmentChanged: signal`personinfo.departmentChanged`,
  editButtonClicked: signal`personinfo.editButtonClicked`,
  doneButtonClicked: signal`personinfo.doneButtonClicked`,
},
  class PersonInfo extends React.Component {

    render() {

      return (
        <div className = {styles.personinfo}>
          <div className={styles.title}>Person Information</div>
          <div className={styles['person-info']}>
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
                      onTouchTap={()=>{this.props.editing ? console.log(): this.props.buildingPageRequested({building:this.props.room.building})}}>
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
