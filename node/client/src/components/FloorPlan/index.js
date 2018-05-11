import React from 'react'
import {connect} from '@cerebral/react'
import styles from './styles.module.css'
import $ from 'jquery'
import {getSubDocument} from '../CampusMap/index'
import {mobileEventsHandler} from '../CampusMap/index'
import {state, props, signal } from 'cerebral/tags'

let floorplans = {};
let floorplanSvg = {};

export default connect({
	rooms: state`filters.result.floorplans.${props`floor`}.rooms` || {},
	floorplanPageRequested: signal`viewer.floorplanPageRequested`,
},

  class FloorPlan extends React.Component {
    constructor(props) {
      super(props)
      // Store all the React Refs for the <embed/> elements of the floorplans.
      this._floorplanEmbed;
      // Store all the svg-pan-zoom objects, one element for each floorplan.
    }

		componentDidMount() {

      // Attach callback function to the supported rooms on the map.
			let initiateSupportedRoom = () => {
				floorplans[this.props.floor] = floorplans[this.props.floor] || {rooms: {}};
				let normal = 'rgb(15, 36, 125)'
				let filteredOut = '#222222';

				floorplanSvg[this.props.floor] = getSubDocument(this._floorplanEmbed)
				if (floorplanSvg[this.props.floor]) {

					$(floorplanSvg[this.props.floor]).find('text').each((i, label) => {
						$(label).css({
							fontSize: '7px'
						})
					})
          // Find each path component with id containing "room".
          $(floorplanSvg[this.props.floor]).find('path[id*=room]').each((idxRoom, room)=>{
            // To update query and trigger the signals necessary.
            let curRoom = room.id.substr(4, room.id.length);
						let queryCurRoom = this.props.building +' '+curRoom;
						let selected = this.props.rooms && this.props.rooms[curRoom] ? true : false;

						let text = $(floorplanSvg[this.props.floor]).find('text').filter((a, b) => {
							return $(b).text() === curRoom
						}).first()


						floorplans[this.props.floor].rooms[curRoom] = {
							path: $(room),
							text
						}
            $(room).css({
							fill: (selected) ? normal : filteredOut,
							cursor: 'pointer',
              "-webkit-transition": "fill 0.3s", /* Safari */
              "transition": "fill 0.3s",
						})
          })
        }
				$(floorplanSvg[this.props.floor]).click(() => this.props.floorplanPageRequested({floorplan: this.props.floor}))
      }

      // The initiation function for each floor plan.
      let initiateFloorplan = () => {
        initiateSupportedRoom()
			}
      this._floorplanEmbed.addEventListener("load", initiateFloorplan.bind(this), false)
    }

		render() {
			let filteredOut = '#222222';
			let normal = 'rgb(15, 36, 125)'
			$(floorplanSvg[this.props.floor]).find('path[id*=room]').each((idxRoom, room)=>{
				if (!(this.props.rooms)) return
				let curRoom = room.id.substr(4, room.id.length);
				if (!(floorplans[this.props.floor] && floorplans[this.props.floor].rooms[curRoom])) return
				floorplans[this.props.floor].rooms[curRoom].path.css({
					fill: this.props.rooms[curRoom] ? normal : filteredOut
				})
			})
			let floorplan = this.props.floor;
      let fp = null
      if (floorplan) { 
        fp = 
            <embed ref={(node)=>{this._floorplanEmbed=node}}
              type="image/svg+xml"
							className={styles['floorplan-svg']}
              src={'/img/svgFloorPlans/svgFloorPlansSim/svgoManSvgo/'+this.props.filename} />
			}
			return (
				<div className={styles.floorplan}>
					{fp}
				</div>
      )
    }
  }
)
