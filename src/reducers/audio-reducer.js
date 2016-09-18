const setVideo = (state, action) => 
	action.type === 'SET_AUDIO' ? action.audio : true;
export default setVideo;