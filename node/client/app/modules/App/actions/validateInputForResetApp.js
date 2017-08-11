// Create the searchbar_input and viewer_state fields in the input.
function validateInputForResetApp({input, output}) {
  // The searchbar text can be out of sych with the URL query state. We will
  // update it as long as the query field is set in the input, i.e. in the URL.
  let searchbar_input = input.query || ''

  // Update the viewer.state according to the in put, too.
  let viewer_state = {
    // Set the new state of the viewer. Essentially, we also change the main
    // content of the viewer if the current_page is set in the input, no matter
    // what other states have been updated to the viewer component.
    current_page: input.current_page || 'campusmap',
    // Note, if any of the fields below isn't set, we will get undefined from
    // the input, and that's exactly what we want to set, so a default value
    // isn't provided.
    building: input.building,
    floor: input.floor,
    id: input.id, // Room id.
    person: input.person,
    query: input.query,
    idx: input.idx
  }

  output({
    searchbar_input: searchbar_input,
    viewer_state: viewer_state
  })
}

export default validateInputForResetApp
