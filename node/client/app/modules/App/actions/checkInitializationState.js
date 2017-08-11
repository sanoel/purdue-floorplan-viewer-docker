function checkInitializationState({input, state, output}) {
  if(state.get('app.initialized')) {
    output.initialized()
  } else {
    output.uninitialized()
  }
}

checkInitializationState.outputs = ['initialized','uninitialized']

export default checkInitializationState
