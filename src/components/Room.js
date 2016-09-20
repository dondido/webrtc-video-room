import React from 'react'
import MediaBridge from './MediaBridge'
import Auth from './Auth'
import { connect } from 'react-redux'
import store from '../store'
class Room extends React.Component {
  constructor(props) {
    super(props);
  }
  getUserMedia = navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true
  }).catch(e => alert('getUserMedia() error: ' + e.name))
  socket = io.connect()
  componentWillMount() {
    this.props.addRoom();
  }
  render(){
  	const href = window.location.href;
    return (
      <div>
        <MediaBridge media={media => this.media = media} socket={this.socket} getUserMedia={this.getUserMedia} />
        <Auth socket={this.socket} media={this.media} getUserMedia={this.getUserMedia} className="auth" />
      </div>
    );
  }
}
const mapStateToProps = store => ({rooms: new Set([...store.rooms])});
const mapDispatchToProps = (dispatch, ownProps) => (
    {
      addRoom: () => store.dispatch({type: 'ADD_ROOM', room: ownProps.params.room})
    }
  );
export default connect(mapStateToProps, mapDispatchToProps)(Room);
