import React from 'react'
import { withRouter } from 'react-router'
import VideoBridge from './VideoBridge'
import Auth from './Auth'
class Room extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
      user: '',
      audio: false,
      video: true,
      full: false
  }
  haveMedia = false;
  getUserMedia = navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true
  }).catch(e => alert('getUserMedia() error: ' + e.name))
  socket = io.connect()
  initRemote = user => {this.getUserMedia.then(() => {
    this.refs.videoBridge.init(user, this.localStream); console.log(113, this.state.user);})}
  toggleVideo = () => this.localStream.getVideoTracks()[0].enabled = !this.localStream.getVideoTracks()[0].enabled;
  componentDidMount() {
    this.getUserMedia
      .then(stream => {
        this.localStream = stream;
        console.log(111, 'this.localStream', this.localStream)
        //this.haveMedia = true;
        this.refs.localVideo.src = window.URL.createObjectURL(stream);
      });
    this.props.router.setRouteLeaveHook(this.props.route, () => {
      this.localStream.getVideoTracks()[0].stop();
      //this.haveMedia = false;
      this.socket.emit('leave');
      console.log('disconnect', this.socket)
    });
  }
  render(){
  	const href = window.location.href;
    return (
      <div>
        <Auth socket={this.socket} initRemote={this.initRemote} />
        <div className="media-port">
          <video ref="localVideo" autoPlay muted></video>
          <button onClick={this.handleAudio} data-ref="audio">Audio</button>
          <button onClick={this.toggleVideo} data-ref="video">Video</button>
          <button onClick={this.handleFullScreen} data-ref="full">Full</button>
          <VideoBridge ref="videoBridge" getUserMedia={this.getUserMedia} socket={this.socket} />
        </div>
        <div>Waiting for someone to join this room:
        	<a href={href}>{href}</a>
        </div>
      </div>
    );
  }
}
export default withRouter(Room)