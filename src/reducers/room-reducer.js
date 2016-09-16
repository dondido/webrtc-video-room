const initialState = new Set();
export default function updateRooms(state = initialState, action) {
	console.log('action.type', action.type)
  if(action.type === 'ADD_ROOM') {
  	return new Set([...state, action.room]);
  }
  return state
}