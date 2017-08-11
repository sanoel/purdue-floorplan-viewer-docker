function readDropPanFile({input, output}) {
  let roomsFile = input.dropzone_file[0]
  let reader = new FileReader()

  reader.onload = function(event) {
    output.success({droppan_file_content: event.target.result})
  };
  reader.onerror = output.error

  reader.readAsText(roomsFile)
}
// Use default outputs:  success and error.
readDropPanFile.async = true

export default readDropPanFile
