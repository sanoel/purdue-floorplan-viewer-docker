import React from 'react'
import {connect} from '@cerebral/react'
import svgPanZoom from 'svg-pan-zoom'
import styles from './styles.module.css'
import $ from 'jquery'
import {getSubDocument} from '../CampusMap/index'
import {mobileEventsHandler} from '../CampusMap/index'
import {state, signal } from 'cerebral/tags'

let panning = false;
let panTimeout;
let rooms = {};
let floorplanSvg;

export default connect({
  floorplan: state`floorplans.floorplan_to_show`,
	rooms: state`filters.result.rooms`,

	roomPageRequested: signal`viewer.roomPageRequested`,
	buildingPageRequested: signal`viewer.buildingPageRequested`,
},

  class FloorPlans extends React.Component {
    constructor(props) {
      super(props)
      // Store all the React Refs for the <embed/> elements of the floorplans.
      this._floorplanEmbed;
      // Store all the svg-pan-zoom objects, one element for each floorplan.
      this._svgPanZoomer;
    }

		componentWillUnmount() {
			this._svgPanZoomer.destroy();
			delete this._svgPanZoomer;
		}

    componentDidMount() {
      let setSvgPanZoom = () => {
        this._svgPanZoomer = svgPanZoom(this._floorplanEmbed, {
          zoomEnabled: true,
          controlIconsEnabled: true,
          refreshRate:59,
          zoomScaleSensitivity: 0.5,
					customEventsHandler: mobileEventsHandler,
					onPan: () => {
						panning = true;
						if (panTimeout) clearTimeout(panTimeout); 
						panTimeout = setTimeout(() => {
							panning = false;
						}, 500)
					},
					beforePan: () => {panning = true;}
        })
      }

      // Attach callback function to the supported rooms on the map.
      let initiateSupportedRoom = () => {

			let filteredOut = '#222222';
      let filteredOutHover = '#999999'
      let normal = 'rgb(15, 36, 125)'
			let normalHover = 'rgb(101, 181, 252)'

        floorplanSvg = getSubDocument(this._floorplanEmbed)
				if (floorplanSvg) {

					let tool = $("#tooltip");

					$(floorplanSvg).find('text').each((i, label) => {
						$(label).css({
							fontSize: '7px'
						})                  
					})
          // Find each path component with id containing "room".
          $(floorplanSvg).find('path[id*=room]').each((idxRoom, room)=>{
            // To update query and trigger the signals necessary.
            let curRoom = room.id.substr(4, room.id.length);
						let fullCurRoom = this.props.floorplan.building +' '+curRoom;
						let selected = this.props.rooms && this.props.rooms[curRoom] ? true : false;

						let text = $(floorplanSvg).find('text').filter((a, b) => {
							return $(b).text() === curRoom
						}).first()

						rooms[curRoom] = {
							path: $(room),
							text
						}
						
						if (this.props.rooms[curRoom]) {
							$(room).click(() => {
								console.log(panning)
								if (!panning) {
									this.props.roomPageRequested({ room: fullCurRoom, building: this.props.floorplan.building, floor: this.props.floorplan.floor})
								}
							})

							$(room).css({
								fill: selected ? normal : filteredOut,
								cursor: 'pointer',
								"-webkit-transition": "fill 0.3s", /* Safari */
								"transition": "fill 0.3s",
							})

							$(room).on('mousemove', (ev) => {
								tool.text(room.id.substring(4, room.id.length));
								tool.css({
									left:(ev.pageX+300) + "px",
									top: (ev.pageY+100) + "px"
								})
							})
						} else {
							$(room).on('mousemove', (ev) => {
								tool.text(room.id.substring(4, room.id.length) +"(unavailable)");
								tool.css({
									left:(ev.pageX+300) + "px",
									top: (ev.pageY+100) + "px"
								})
							})
						}

            $(room).hover(
              // handlerIn
							function(evt) {
								$(this).css({fill: selected ? normalHover : filteredOutHover})
								tool.css({opacity: 1});
              },
              // handlerOut
              function() {
                $(this).css({fill: selected ? normal : filteredOut})
								tool.css({opacity: 0});
							}
            )
          })
        }
      }

      // The initiation function for each floor plan.
      let initiateFloorplan = () => {
        setSvgPanZoom(                  )
        initiateSupportedRoom()
      }

      // Attach the svgPanZoom function when the svg file is completely loaded.
		  //this._floorplanEmbeds.addEventListener("load", initiateFloorplans, false)
      this._floorplanEmbed.addEventListener("load", initiateFloorplan.bind(this), false)
    }

		render() {
			let filteredOut = '#222222';
      let filteredOutHover = '#999999'
      let normal = 'rgb(15, 36, 125)'
			let normalHover = 'rgb(101, 181, 252)'
      $(floorplanSvg).find('path[id*=room]').each((idxRoom, room)=>{
				let curRoom = room.id.substr(4, room.id.length);
				let selected = this.props.rooms && this.props.rooms[curRoom] ? true : false;
				if (!rooms[curRoom]) return
				rooms[curRoom].path.css({
					fill: selected ? normal : filteredOut
				})
				rooms[curRoom].path.hover(() => { //hover in
					rooms[curRoom].path.css({fill: selected ? normalHover : filteredOutHover})
				}, () => { //hover out
					rooms[curRoom].path.css({fill: selected ? normal : filteredOut})
				})
			})
      let floorplan = this.props.floorplan;
      let fp = null
      if (floorplan) { 
        let divKey = 'div_floorplan_' + floorplan.building + '_' + floorplan.floor
        fp = 
          <div key={divKey}
            className={styles['floorplan-div-container']}>
            <div className={styles['floorplan-title']}>
              <br/>
                <p>
									Building: <a onClick={() => {this.props.buildingPageRequested({building:this.props.floorplan.building})}}>
										{floorplan.building}</a>&nbsp;&nbsp;
                  Floor: {floorplan.floor}
                </p>
              <br/>
						</div>
						<div id="tooltip" className={styles.tooltip} />

            <embed ref={(node)=>{this._floorplanEmbed=node}}
              type="image/svg+xml"
              className={styles['floorplan-svg']}
              src={'/img/svgFloorPlans/svgFloorPlansSim/svgoManSvgo/'+floorplan.filename} />
          </div>
      } else {
//TODO: Replace with generic "Unknown X" component that we can have
// error details passed in.
        fp =
          <div>
            <div className={styles['floorplan-title']}>
              <br/>
                <p>
                  Unknown Floor
                </p>
              <br/>
            </div>
            <p className={styles['floorplans-error']}>
            Sorry. No floor plan was found for the building & floor specified.
            </p>
          </div>
      }
      return (

        <div className = {styles.wrapper}>
          <div className={styles.title}>
            FloorPlans
          </div>
          <div className={styles.floorplans}>
            {fp}
          </div>
        </div>
      )
    }
  }
)
