import React from 'react'
import {connect} from '@cerebral/react'
import styles from './attribute-dialog.css'
import { Checkbox, Dialog, FlatButton} from 'material-ui'
import {state, signal } from 'cerebral/tags'

export default connect({
  attributes: state`roominfo.attribute_dialog.attributes`,
  all_attributes: state`roominfo.attribute_dialog.all_attributes`,
  open: state`roominfo.attribute_dialog.open`,
  attributeChanged: signal`roominfo.attributeChanged`,
  cancelDialogClicked: signal`roominfo.attributeDialogCancelled`,
  submitDialogClicked: signal`roominfo.attributeDialogSubmitted`,
},

class AttributeDialog extends React.Component {

  render() {

    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={()=>{this.props.cancelDialogClicked({})}}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onTouchTap={()=>this.props.submitDialogClicked({})}
      />
    ];

    return (
      <Dialog
        title={'Edit room attributes'}
        actions={actions}
        modal={false}
        open={this.props.open}
        className={styles['share-dialog']}
        onRequestClose={this.handleRequestClose}>
        <div className={styles['checkbox-container']}>
          {this.props.all_attributes.map((attribute, i) => (
            <Checkbox
              key={'attribute-checkbox-'+i}
              onCheck={() => { this.props.attributeChanged({attribute})}}
              checked={this.props.attributes[attribute]}
              label={attribute}
            />
          ))}
        </div>
      </Dialog>
    )
  }
})
