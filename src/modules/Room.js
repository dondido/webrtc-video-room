import React from 'react'
import { withRouter } from 'react-router'
import VideoBridge from './VideoBridge'
import Auth from './Auth'
import { connect } from 'react-redux'
import store from '../store'
import { addRooms } from '../actions/rooms'

class Room extends React.Component {
  constructor(props) {
    super(props);
  }
  socket = io.connect()
  initRemote = user => this.refs.videoBridge.init(user)
  componentDidMount() {
    this.props.addRoom();
    console.log('this.props', this.props)
  }
  render(){
  	const href = window.location.href;
    
    return (
      <div>
        <VideoBridge ref="videoBridge" socket={this.socket} />
        <Auth socket={this.socket} initRemote={this.initRemote} />
        <div>Waiting for someone to join this room:
        	<a href={href}>{href}</a>
        </div>
      </div>
    );
  }
}
const mapStateToProps = store => ({rooms: store.rooms});
const mapDispatchToProps = (dispatch, ownProps) =>
   ({
    addRoom: function() {
      console.log('ownProps', ownProps)
      store.dispatch({
        type: 'ADD_ROOM',
        room: ownProps.params.room
      });
    }
  });
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Room));
