function importRoomsData({input, output}) {
  let roomsFileContent = input.droppan_file_content
  try {
    let rooms = JSON.parse(roomsFileContent)
    output.success({result: rooms})
  } catch(error) {
    output.error()
  }
}

export default importRoomsData
