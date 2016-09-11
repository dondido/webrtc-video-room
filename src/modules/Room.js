import React from 'react'
import { withRouter } from 'react-router'
import VideoBridge from './VideoBridge'
import Auth from './Auth'

import { connect } from 'react-redux'
import { addRooms } from '../actions/rooms'

class Room extends React.Component {
  constructor(props) {
    super(props);
  }
  socket = io.connect()
  initRemote = user => this.refs.videoBridge.init(user)
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
export default connect(
  state => {console.log(111, state);return { number: state.rooms }},
  { addRooms }
)(Room)
//export default withRouter(Room)