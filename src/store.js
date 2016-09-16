import { createStore } from 'redux';
import reducers from './reducers';
const mapStoreToStorage = () =>
	localStorage.setItem('reduxState', JSON.stringify(store.getState())),
	persistedState = localStorage.getItem('reduxState') ?
		JSON.parse(localStorage.getItem('reduxState')) :
		{rooms: new Set()};
const store = createStore(reducers, persistedState);
store.subscribe(mapStoreToStorage);
export default store;