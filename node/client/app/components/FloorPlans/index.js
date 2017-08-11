import React from 'react'
import {connect} from 'cerebral-view-react'
import svgPanZoom from 'svg-pan-zoom'
import Hammer from 'hammerjs'
import styles from './styles.css'
import classNames from 'classnames/bind'
import $ from 'jquery'
import {getSubDocument} from '../CampusMap/index'
import {mobileEventsHandler} from '../CampusMap/index'
let cx = classNames.bind(styles)

export default connect({
  floorplan: 'floorplans.floorplan_to_show',
  rooms: 'floorplans.rooms',
  roomsToHighlight: 'floorplans.rooms_to_highlight',
  searchbar_query: 'viewer.state.query',
  idx_selected_suggestion: 'viewer.state.idx'
}, {
  roomPageRequested: 'viewer.roomPageRequested',
},

  class FloorPlans extends React.Component {
    constructor(props) {
      super(props)
      // Store all the React Refs for the <embed/> elements of the floorplans.
      this._floorplanEmbed;
      // Store all the svg-pan-zoom objects, one element for each floorplan.
      this._svgPanZoomer;
    }

    componentDidMount() {
      let setSvgPanZoom = () => {
        this._svgPanZoomer = svgPanZoom(this._floorplanEmbed, {
          zoomEnabled: true,
          controlIconsEnabled: true,
          refreshRate:59,
          zoomScaleSensitivity: 0.5,
          customEventsHandler: mobileEventsHandler
        })
      }

      // Attach callback function to the supported rooms on the map.
      let initiateSupportedRoom = () => {

        let colorNormal = '#222222'
        let colorHover = '#999999'
        let colorHighlighted = 'rgb(15, 36, 125)'
        let colorHighlightedHover = 'rgb(101, 181, 252)'

        let floorplanSvg = getSubDocument(this._floorplanEmbed)
        if (floorplanSvg) {
          // Find each path component with id containing "room".
          $(floorplanSvg).find('path[id*=room]').each((idxRoom, room)=>{
            // To update query and trigger the signals necessary.
            let curRoom = room.id.substr(4, room.id.length)
            let queryCurRoom = this.props.floorplan.building +' '+curRoom
            $(room).click(
              () => {
                // Change to a room information page.
                this.props.roomPageRequested({ room: queryCurRoom, building: this.props.floorplan.building, floor: this.props.floorplan.floor})
              }
            )

            let roomColor=colorNormal, roomColorHover=colorHover
            if(this.props.roomsToHighlight.indexOf(queryCurRoom) > -1){
              roomColor=colorHighlighted
              roomColorHover=colorHighlightedHover
            }

            // Set the appearance.
            $(room).css({
              fill: roomColor,
              cursor: 'pointer',
              "-webkit-transition": "fill 0.3s", /* Safari */
              "transition": "fill 0.3s",
            })
            $(room).hover(
              // handlerIn
              function() {
                $(this).css({fill: roomColorHover})
              },
              // handlerOut
              function() {
                $(this).css({fill: roomColor})
              }
            )
          })
        }
      }

      // The initiation function for each floor plan.
      let initiateFloorplan = () => {
        setSvgPanZoom()
        initiateSupportedRoom()
      }

      // Attach the svgPanZoom function when the svg file is completely loaded.
		  //this._floorplanEmbeds.addEventListener("load", initiateFloorplans, false)
      this._floorplanEmbed.addEventListener("load", initiateFloorplan.bind(this), false)
    }

    render() {
      let floorplan = this.props.floorplan;
      let fp = null
      if (floorplan) { 
        // Make a copy of the floorplan meta data just to make sure
        // everything is in the same order.
        let divKey = 'div_floorplan_' + floorplan.building + '_' + floorplan.floor
        fp = 
          <div key={divKey}
            className={cx('floorplan-div-container')}>
            <div className={cx('floorplan-title')}>
              <br/>
                <p>
                  Building: {floorplan.building}&nbsp;&nbsp;
                  Floor: {floorplan.floor}
                </p>
              <br/>
            </div>

            <embed ref={(node)=>{this._floorplanEmbed=node}}
              type="image/svg+xml"
              className={cx('floorplan-svg')}
              src={'/img/svgFloorPlans/svgFloorPlansSim/svgoManSvgo/'+floorplan.filename} />
          </div>
      } else {
//TODO: Replace with generic "Unknown X" component that we can have
// error details passed in.
        fp =
          <div>
            <div className={cx('floorplan-title')}>
              <br/>
                <p>
                  Unknown Floor
                </p>
              <br/>
            </div>
            <p className={cx('floorplans-error')}>
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
