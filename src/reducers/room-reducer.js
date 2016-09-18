const initialState = new Set();
const updateRooms = (state = initialState, action) => {
  if(action.type === 'ADD_ROOM') {
  	return new Set([...state, action.room]);
  }
  return state
}
export default updateRooms;