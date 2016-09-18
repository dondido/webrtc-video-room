const setVideo = (state, action) => 
	action.type === 'SET_VIDEO' ? action.video : true;
export default setVideo;