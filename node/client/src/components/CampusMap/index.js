// TODO: switch to inline svg for the campus map and floorplan viewer?

import uuid from 'uuid'
import React from 'react'
import {connect} from '@cerebral/react'
import svgPanZoom from 'svg-pan-zoom'
import Hammer from 'hammerjs'
import {Circle} from 'better-react-spinkit'
import styles from './styles.module.css'
import $ from 'jquery'
import {state, signal } from 'cerebral/tags'

let panning = false;
let panTimeout;

let buildings = {};

let campusMapSvg;

export default connect({
	buildings: state`filters.result.buildings`,
	buildingPageRequested: signal`viewer.buildingPageRequested`,
},
	class CampusMap extends React.Component {

		componentWillUnmount() {
			this._svgPanZoomer.destroy();
			delete this._svgPanZoomer;
		}

    componentDidMount() {

      let setSvgPanZoom = () => {
        this._svgPanZoomer = svgPanZoom(this._campusmap, {
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
					beforePan: () => { panning = true; },
        })
      }

      // Hide the control icons when the container is too narrow.
      let updateSvgPanZoom = () => {
        // 768 px ~= 48em = the bound for md grids in purecss.
        // Tricks:
        //   Window width: window.innerWidth
        //   The map viewr width: this._campusmap.clientWidth
        if(window.innerWidth < 768) {
          this._svgPanZoomer.disableControlIcons()
        } else {
          this._svgPanZoomer.enableControlIcons()
        }
        // Also center the svg image.
        this._svgPanZoomer.reset()
      }

      // Attach callback function to the suppoted buildings on the map.
			let initiateSupportedBldgs = () => {
        let normal = '#0000ff'
				let normalHover = '#006eff'
				let	filteredOut = '#000'
				let filteredOutHover = '#333'

        campusMapSvg = getSubDocument(this._campusmap)

        // Disable title for the map.
        $(campusMapSvg).find('title').remove()
        if (campusMapSvg) {
          // Find each path component with id containing "bldg".
					$(campusMapSvg).find('path[id*=bldg]').each((idx, building)=>{
	            // To update the query and trigger the signals necessary.
						let curBldg = building.id.substr(4, building.id.length)
						let selected = this.props.buildings ? (this.props.buildings[curBldg] && true) : true;
            // TODO: Add a hint for mouse hovering.
						$(building).append('<title>'+curBldg+'</title>')


						let text = $(campusMapSvg).find('text').filter((a, b) => {
							return $(b).text() === curBldg
						}).first()

						text.click(() => {
							if (!panning) {
	             this.props.buildingPageRequested({
									building: curBldg,
							 })
							}
						})

						text.css({
							cursor: 'pointer',
						})

            text.hover(
              // handlerIn
              function() {
                $(building).css({fill: selected ? normalHover : filteredOutHover})
              },
              // handlerOut
              function() {
                $(building).css({fill: selected ? normal : filteredOut})
              }
            )


						buildings[curBldg] = {
							path: $(building),
							text
						}

            $(building).click(() => {
							if (!panning) {
								this.props.buildingPageRequested({
									building: curBldg,
								})
							}
						})

						$(building).css({
              fill: selected ? normal : filteredOut,
              cursor: 'pointer',
              "-webkit-transition": "fill 0.3s", /* Safari */
              "transition": "fill 0.3s",
            })
            $(building).hover(
              // handlerIn
              function() {
                $(this).css({fill: selected ? normalHover : filteredOutHover})
              },
              // handlerOut
              function() {
                $(this).css({fill: selected ? normal : filteredOut})
              }
            )
					})
				}
      }

      let initiateCampusMap = () => {
        setSvgPanZoom()
        updateSvgPanZoom()
        initiateSupportedBldgs()
        $('#loading-indicator').css('display','none')
				$(this._campusmap).css('visibility','visible')
      }

      // Attach the svgPanZoom function when the svg file is completely loaded.
		  this._campusmap.addEventListener("load", initiateCampusMap, false)

      $(window).resize( () => {
        if(this._svgPanZoomer) {
          // Hide the svgPanZoom buttons when the screen is too narrow.
          updateSvgPanZoom()
          // Resize the svg pan zoom container on page resize.
          this._svgPanZoomer.resize()
          this._svgPanZoomer.fit()
          this._svgPanZoomer.center()
        }
      })
    }

		render() {
      let normal = '#0000ff'
      let normalHover = '#006eff'
			let	filteredOut = '#000'
			let filteredOutHover = '#333'
			$(campusMapSvg).find('path[id*=bldg]').each((idx, building)=>{
				let curBldg = building.id.substr(4, building.id.length)
				let selected = this.props.buildings ? (this.props.buildings[curBldg] && true) : true;
				if (!buildings[curBldg]) return
				buildings[curBldg].path.css({
					fill: selected ? normal : filteredOut
				})
				buildings[curBldg].path.hover(
					() => {
						buildings[curBldg].path.css({fill: this.props.buildings[curBldg] ? normalHover : filteredOutHover})
					},
					() => {
						buildings[curBldg].path.css({fill: this.props.buildings[curBldg] ? normal : filteredOut})
					}
				)
			})
      return (
        <div className={styles.wrapper}>
          <Circle id="loading-indicator"
            className={styles['loading-indicator']}
            color="#c79d50" size={50}
          />
					<embed 
						id="campus-map"
						type="image/svg+xml"
            ref={(node)=>{this._campusmap=node}}
            className={styles['campus-map-svg']}
            src="/img/svgCampusMap/campus-map.min.svg"
            style={{visibility:'hidden'}}/>
        </div>
      )
    }
  }
)

// fetches the document for the given embedding_element
export function getSubDocument(embedding_element)
{
	if (embedding_element.contentDocument)
	{
		return embedding_element.contentDocument
	}
	else
	{
		var subdoc = null
		try {
			subdoc = embedding_element.getSVGDocument()
		} catch(e) {}
		return subdoc
	}
}

// Event listeners for supporing mobile
export const mobileEventsHandler = {
  haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel']
, init: function(options) {
    var instance = options.instance
      , initialScale = 1
      , pannedX = 0
      , pannedY = 0
    // Init Hammer
    // Listen only for pointer and touch events
    this.hammer = Hammer(options.svgElement, {
      inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
    })
    // Enable pinch
    this.hammer.get('pinch').set({enable: true})
    // Handle double tap
    this.hammer.on('doubletap', function(ev){
      instance.zoomIn()
    })
    // Handle pan
    this.hammer.on('panstart panmove', function(ev){
      // On pan start reset panned variables
      if (ev.type === 'panstart') {
        pannedX = 0
        pannedY = 0
      }
      // Pan only the difference
      instance.panBy({x: ev.deltaX - pannedX, y: ev.deltaY - pannedY})
      pannedX = ev.deltaX
      pannedY = ev.deltaY
    })
    // Handle pinch
    this.hammer.on('pinchstart pinchmove', function(ev){
      // On pinch start remember initial zoom
      if (ev.type === 'pinchstart') {
        initialScale = instance.getZoom()
        instance.zoom(initialScale * ev.scale)
      }
      instance.zoom(initialScale * ev.scale)
    })
    // Prevent moving the page on some devices when panning over SVG
    options.svgElement.addEventListener('touchmove', function(e){ e.preventDefault() })
  }
, destroy: function(){
    this.hammer.destroy()
  }
}
