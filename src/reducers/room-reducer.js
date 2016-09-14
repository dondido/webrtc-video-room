const initialState = []
export default function updateRooms(state = initialState, action) {
	console.log('action.type', action.type)
  if(action.type === 'ADD_ROOM') {
    return state.concat([action.room]);
  }
  return state
}