import { combineReducers } from 'redux';
// Reducers
import roomReducer from './room-reducer';
// Combine Reducers
const reducers = combineReducers({
    rooms: roomReducer
});
export default reducers;