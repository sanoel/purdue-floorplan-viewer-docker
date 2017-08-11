import React from 'react'
import {connect} from 'cerebral-view-react'
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import { AutoComplete, IconButton } from 'material-ui';
import FontIcon from 'material-ui/FontIcon';
import classNames from 'classnames/bind'

export default connect({
  editing: 'roominfo.editing',
  persons: 'roominfo.persons',
  persons_edits: 'roominfo.persons_edits',
  newPersonText: 'persontable.new_person.text',
  matches: 'persontable.new_person.matches',
  match: 'persontable.new_person.selected_match',
}, {
  personPageRequested: 'viewer.personPageRequested',
  addPersonButtonClicked: 'persontable.addPersonButtonClicked',
  newPersonTextChanged: 'persontable.newPersonTextChanged',
  removePersonButtonClicked: 'persontable.removePersonButtonClicked',
  personMatchSelected: 'persontable.personMatchSelected',
},
  class PersonTable extends React.Component {

    render() {
      return (
        <Table 
          style={{width: 'auto'}} 
          fixedHeader={false} 
          selectable={false}>
          <TableHeader 
            style={{width:'auto'}}
            displaySelectAll={false}
            adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn>Person Name</TableHeaderColumn>
              {this.props.editing ?
                <TableHeaderColumn>Unassign Person</TableHeaderColumn>
                : null
              }
            </TableRow>
          </TableHeader>
          <TableBody 
            style={{width:'auto'}}
            stripedRows={true}
            displaySelectAll={false}
            displayRowCheckbox={false}>
            {this.props.persons.map((person, index) => (
              <TableRow 
                key={index}
                onTouchTap={()=>{this.props.editing ? null : this.props.personPageRequested({person:person.name})}}>
                <TableRowColumn>
                  {person.name}
                </TableRowColumn>
                {this.props.editing ? <TableRowColumn>
                  <IconButton                                                                                
                    onTouchTap={(evt)=>{evt.stopPropagation(); this.props.removePersonButtonClicked({person, room: this.props.room})}}
                    iconClassName="material-icons">delete
                  </IconButton>
                </TableRowColumn> : null }
              </TableRow>
              ))}
          {this.props.editing ? 
            <TableRow>
              <TableRowColumn>
                <AutoComplete
                  searchText={this.props.newPersonText}
                  hintText={`Assign a new person, e.g. "John Smith"`}
                  dataSource={this.props.matches.map((match) => (match.name))}
                  onNewRequest={(text, idx)=>{this.props.personMatchSelected({idx, text, match:this.props.matches[idx]})}}
                  onUpdateInput={(searchText)=>{this.props.newPersonTextChanged({text:searchText})}}
                />
              </TableRowColumn>
              <TableRowColumn>
                <IconButton                                                                                
                  onTouchTap={()=>{this.props.addPersonButtonClicked({text: this.props.newPersonText, match: this.props.match, room: this.props.room})}}
                  disabled={this.props.newPersonText.length > 0 ? false : true}
                  iconClassName="material-icons">add_circle
                </IconButton>
              </TableRowColumn>
            </TableRow> : null }
          </TableBody>
        </Table>
      )
    }
  }
)
