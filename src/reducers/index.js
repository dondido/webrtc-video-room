const initialState = {
  rooms: []
}
export default function updateRooms(state = initialState, action) {
  if(action.type === 'ADD_ROOM') {
    return { rooms: [...state.rooms, action.room] }
  }
  return state
}