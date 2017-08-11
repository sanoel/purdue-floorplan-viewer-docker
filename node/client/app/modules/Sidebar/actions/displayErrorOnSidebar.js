// Display input.errorMsg on both the UI and the console.
function displayErrorOnSidebar({input, state}) {
  state.set('sidebar.error', input.errorMsg)
  console.error(input.errorMsg)
}

export default displayErrorOnSidebar
