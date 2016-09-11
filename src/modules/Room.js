import React from 'react'
import { withRouter } from 'react-router'
import VideoBridge from './VideoBridge'
import Auth from './Auth'
class Room extends React.Component {
  constructor(props) {
    super(props);
  }
  socket = io.connect()
  initRemote = user => {
    this.refs.videoBridge.init(user); console.log(113, user);}
  componentDidMount() {
    this.props.router.setRouteLeaveHook(this.props.route, () => {
      //this.localStream.getVideoTracks()[0].stop();
      //this.haveMedia = false;
      this.socket.emit('leave');
    });
  }
  render(){
  	const href = window.location.href;
    return (
      <div>
        <Auth socket={this.socket} initRemote={this.initRemote} />
        <VideoBridge ref="videoBridge" socket={this.socket} />
        <div>Waiting for someone to join this room:
        	<a href={href}>{href}</a>
        </div>
      </div>
    );
  }
}
export default withRouter(Room)