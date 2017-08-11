export default module => {

  // Use lower case, with dash line to separate words, for naming the variables
  // in the cerebral state.
  module.addState({

    // Controls what floorplans will be shown.
    //
    // Each element is an object similar to app.floorplans,
    // representing one valid floorplan according to the user input, just its
    // elements are just single strings instead of string arrays.
    //
    // Update: also added a field called idx for tracing back to the floorplans.
    //
    // Example:
    //  floorplan_to_show: {
    //   idx: 1, // The index of this floorplan in app.floorplans
    //   href: ['/img/svgFloorPlans/svgFloorPlansSim/svgoManSvgo/GRIS_1.svg'],
    //   filename: ['GRIS_1.svg'], // File name with the extension.
    //   building: ['GRIS'],
    //   floor: ['1'],
    //   key: GRIS_1, // The unique label used for creating React components.
    //   svg:['<svg/>'] // Reserved: The actual content of the file.
    // }
    floorplan_to_show: {},

    // Controls what rooms will be highlighted.
    //
    // Each element is a query string for a room to specify its location, e.g.
    // "GRIS 204". Strings instead of objects are used here so that after being
    // stringified, the URL won't carry too much redundant information, i.e. the
    // keys.
    rooms_to_highlight: []
  })

  module.addSignals({

  })

}
