import React from 'react'
import Remarkable from 'remarkable'
import MediaContainer from './MediaContainer'
import Communication from '../components/Communication'
import store from '../store'
import { connect } from 'react-redux'
class CommunicationContainer extends React.Component {
  constructor(props) {
    super(props);
  }
  static propTypes = {
    socket: React.PropTypes.object.isRequired,
    getUserMedia: React.PropTypes.object.isRequired,
    audio: React.PropTypes.bool.isRequired,
    video: React.PropTypes.bool.isRequired,
    setVideo: React.PropTypes.func.isRequired,
    setAudio: React.PropTypes.func.isRequired,
    media: React.PropTypes.instanceOf(MediaContainer)
  }
  state = {
    sid: '',
    message: '',
    audio: true,
    video: true
  }
  hideAuth() {
    this.props.media.setState({bridge: 'connecting'});
  } 
  full = () => this.props.media.setState({bridge: 'full'})
  componentWillMount() {
    this.setState({video: this.props.video});
    this.setState({audio: this.props.audio});
  }
  componentDidMount() {
    const socket = this.props.socket;
    socket.on('create', () =>
      this.props.media.setState({user: 'host', bridge: 'create'}));
    socket.on('full', this.full);
    socket.on('bridge', role => this.props.media.init());
    socket.on('join', () =>
      this.props.media.setState({user: 'guest', bridge: 'join'}));
    socket.on('approve', data => {
      this.props.media.setState({bridge: 'approve'});
      this.setState({message: data.message});
      this.setState({sid: data.sid});
    });
    socket.emit('find');
    this.props.getUserMedia
      .then(stream => {
          this.localStream = stream;
          this.localStream.getVideoTracks()[0].enabled = this.state.video;
          this.localStream.getAudioTracks()[0].enabled = this.state.audio;
        });
  }
  handleInput = e => this.setState({[e.target.dataset.ref]: e.target.value})
  send = e => {
    e.preventDefault();
    this.props.socket.emit('auth', this.state);
    this.hideAuth();
  }
  handleInvitation = e => {
    e.preventDefault();
    this.props.socket.emit([e.target.dataset.ref], this.state.sid);
    this.hideAuth();
  }
  getContent(content) {
    return {__html: (new Remarkable()).render(content)};
  }
  toggleVideo = () => {
    const video = this.localStream.getVideoTracks()[0].enabled = !this.state.video;
    this.setState({video: video});
    this.props.setVideo(video);
  }
  toggleAudio = () => {
    const audio = this.localStream.getAudioTracks()[0].enabled = !this.state.audio;
    this.setState({audio: audio});
    this.props.setAudio(audio);
  }
  handleHangup = () => this.props.media.hangup()
  render(){
    return (
      <Communication
        {...this.state}
        toggleVideo={this.toggleVideo}
        toggleAudio={this.toggleAudio}
        getContent={this.getContent}
        send={this.send}
        handleHangup={this.handleHangup}
        handleInput={this.handleInput}
        handleInvitation={this.handleInvitation} />
    );
  }
}
const mapStateToProps = store => ({video: store.video, audio: store.audio});
const mapDispatchToProps = dispatch => (
    {
      setVideo: boo => store.dispatch({type: 'SET_VIDEO', video: boo}),
      setAudio: boo => store.dispatch({type: 'SET_AUDIO', audio: boo})
    }
  );
export default connect(mapStateToProps, mapDispatchToProps)(CommunicationContainer);