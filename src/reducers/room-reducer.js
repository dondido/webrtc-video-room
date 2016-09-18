const initialState = new Set();
export default const updateRooms = (state = initialState, action) => {
  if(action.type === 'ADD_ROOM') {
  	return new Set([...state, action.room]);
  }
  return state
}