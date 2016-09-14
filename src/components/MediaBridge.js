import React from 'react'

export default class MediaBridge extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    bridge: 'media-bridge',
    audio: false,
    video: true,
    full: false
  }
  getUserMedia = navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true
  }).catch(e => alert('getUserMedia() error: ' + e.name))
  componentDidMount() {
    // chrome polyfill for connection between the local device and a remote peer
    window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection;
    this.getUserMedia
      .then(stream => this.refs.localVideo.src = window.URL.createObjectURL(stream));
    this.props.socket.on('message', this.onMessage);
    this.props.socket.on('hangup', this.onHangup);
  }
  componentWillUnmount() {
    if(this.localStream !== undefined) {
      this.localStream.getVideoTracks()[0].stop();
    }
    this.props.socket.emit('leave');
  }
  onHangup = () => {
    this.setState({bridge: 'media-bridge'});
  }
  onMessage = message => {
      if (message.type === 'offer') {
          // set remote description and answer
          this.pc.setRemoteDescription(new RTCSessionDescription(message));
          this.pc.createAnswer()
            .then(this.setDescription)
            .then(this.sendDescription)
            .catch(this.handleError); // An error occurred, so handle the failure to connect

      } else if (message.type === 'answer') {
          // set remote description
          this.pc.setRemoteDescription(new RTCSessionDescription(message));
      } else if (message.type === 'candidate') {
          // add ice candidate
          this.pc.addIceCandidate(
              new RTCIceCandidate({
                  sdpMLineIndex: message.mlineindex,
                  candidate: message.candidate
              })
          );
      }
  }
  sendData(msg) {
    this.dc.send(JSON.stringify(msg))
  }
  // Set up the data channel message handler
  setupDataHandlers() {
      this.dc.onmessage = e => {
          var msg = JSON.parse(e.data);
          console.log('received message over data channel:' + msg);
      };
      this.dc.onclose = () => {
          this.remoteStream.getVideoTracks()[0].stop();
          console.log('The Data Channel is Closed');
      };
  }
  setDescription = offer => this.pc.setLocalDescription(offer)
  // send the offer to a server to be forwarded to the other peer
  sendDescription = () => this.props.socket.send(this.pc.localDescription)
  handleError = e => console.log(e)
  init(role) {
    // wait for local media to be ready
    const attachMediaIfReady = () => {
      this.dc = this.pc.createDataChannel('chat');
      this.setupDataHandlers();
      this.pc.createOffer()
        .then(this.setDescription)
        .then(this.sendDescription)
        .catch(this.handleError); // An error occurred, so handle the failure to connect
    }
    // set up the peer connection
    // this is one of Google's public STUN servers
    // make sure your offer/answer role does not change. If user A does a SLD
    // with type=offer initially, it must do that during  the whole session
    this.pc = new RTCPeerConnection({iceServers: [{url: 'stun:stun.l.google.com:19302'}]});
    // when our browser gets a candidate, send it to the peer
    this.pc.onicecandidate = e => {
        console.log(e, 'onicecandidate');
        if (e.candidate) {
            this.props.socket.send({
                type: 'candidate',
                mlineindex: e.candidate.sdpMLineIndex,
                candidate: e.candidate.candidate
            });
        }
    };
    // when the other side added a media stream, show it on screen
    this.pc.onaddstream = e => {
        console.log('onaddstream', e) 
        this.remoteStream = e.stream;
        this.refs.remoteVideo.src = window.URL.createObjectURL(this.remoteStream);
        this.setState({bridge: 'media-bridge established'});
    };
    this.pc.ondatachannel = e => {
        // data channel
        this.dc = e.channel;
        this.setupDataHandlers();
        this.sendData({
          peerMediaStream: {
            video: this.localStream.getVideoTracks()[0].enabled
          }
        });
        //sendData('hello');
    };
    this.getUserMedia
      .then(stream => {
        // attach local media to the peer connection
        this.localStream = stream;
        this.pc.addStream(stream);
        // call if we were the last to connect (to increase
        // chances that everything is set up properly at both ends)
        if (role === 'host') {
          this.getUserMedia.then(attachMediaIfReady);
        }
      });
  }
  toggleVideo = () => this.localStream.getVideoTracks()[0].enabled = !this.localStream.getVideoTracks()[0].enabled;
  render(){
    return (
      <div className={this.state.bridge}>
        <video className="remote-video" ref="remoteVideo" autoPlay></video>
        <video className="local-video" ref="localVideo" autoPlay muted></video>
        <button onClick={this.handleAudio} data-ref="audio">Audio</button>
        <button onClick={this.toggleVideo} data-ref="video">Video</button>
        <button onClick={this.handleFullScreen} data-ref="full">Full</button>
      </div>
    );
  }
}