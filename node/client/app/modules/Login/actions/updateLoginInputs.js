function updateLoginInputs({input, state}) {
  // Update name / password depending on which input box changes.
  state.set('login.user.'+input.id, input.value)
}

export default updateLoginInputs
