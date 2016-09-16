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
      .then(stream => {
          this.localStream = stream;
          this.localStream.getVideoTracks()[0].enabled = this.state.video;
          this.localStream.getAudioTracks()[0].enabled = this.state.audio;
          this.refs.localVideo.src = window.URL.createObjectURL(stream);
        });
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
    // attach local media to the peer connection
    this.pc.addStream(this.localStream);
    // call if we were the last to connect (to increase
    // chances that everything is set up properly at both ends)
    if (role === 'host') {
      this.getUserMedia.then(attachMediaIfReady);
    }  
  }
  toggleVideo = () => this.localStream.getVideoTracks()[0].enabled = this.state.video = !this.state.video
  toggleAudio = () => this.localStream.getAudioTracks()[0].enabled = this.state.audio = !this.state.audio
  handleHangup = () => {}
  render(){
    return (
      <div className={this.state.bridge}>
        <video className="remote-video" ref="remoteVideo" autoPlay></video>
        <video className="local-video" ref="localVideo" autoPlay muted></video>
        <div className="media-controls">
          <button onClick={this.handleAudio} className={'audio-button-' + this.state.audio}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
              <path className="on" d="M38 22h-3.4c0 1.49-.31 2.87-.87 4.1l2.46 2.46C37.33 26.61 38 24.38 38 22zm-8.03.33c0-.11.03-.22.03-.33V10c0-3.32-2.69-6-6-6s-6 2.68-6 6v.37l11.97 11.96zM8.55 6L6 8.55l12.02 12.02v1.44c0 3.31 2.67 6 5.98 6 .45 0 .88-.06 1.3-.15l3.32 3.32c-1.43.66-3 1.03-4.62 1.03-5.52 0-10.6-4.2-10.6-10.2H10c0 6.83 5.44 12.47 12 13.44V42h4v-6.56c1.81-.27 3.53-.9 5.08-1.81L39.45 42 42 39.46 8.55 6z" fill="white"></path>
              <path className="off" d="M24 28c3.31 0 5.98-2.69 5.98-6L30 10c0-3.32-2.68-6-6-6-3.31 0-6 2.68-6 6v12c0 3.31 2.69 6 6 6zm10.6-6c0 6-5.07 10.2-10.6 10.2-5.52 0-10.6-4.2-10.6-10.2H10c0 6.83 5.44 12.47 12 13.44V42h4v-6.56c6.56-.97 12-6.61 12-13.44h-3.4z" fill="white"></path>
            </svg>
          </button>
          <button onClick={this.toggleVideo} className={'video-button-' + this.state.video}>
            <svg id="mute-video" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="-10 -10 68 68">
              <circle cx="24" cy="24" r="34">
                <title>Mute video</title>
              </circle>
              <path className="on" transform="scale(0.6), translate(17,16)" d="M40 8H15.64l8 8H28v4.36l1.13 1.13L36 16v12.36l7.97 7.97L44 36V12c0-2.21-1.79-4-4-4zM4.55 2L2 4.55l4.01 4.01C4.81 9.24 4 10.52 4 12v24c0 2.21 1.79 4 4 4h29.45l4 4L44 41.46 4.55 2zM12 16h1.45L28 30.55V32H12V16z" fill="white"></path>
              <path className="off" transform="scale(0.6), translate(17,16)" d="M40 8H8c-2.21 0-4 1.79-4 4v24c0 2.21 1.79 4 4 4h32c2.21 0 4-1.79 4-4V12c0-2.21-1.79-4-4-4zm-4 24l-8-6.4V32H12V16h16v6.4l8-6.4v16z" fill="white"></path>
            </svg>
          </button>
          <button onClick={this.handleFullScreen}>
            <svg id="fullscreen" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="-10 -10 68 68">
              <circle cx="24" cy="24" r="34">
                <title>Enter fullscreen</title>
              </circle>
              <path className="on" d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z" fill="white"></path>
              <path className="off" d="M14 28h-4v10h10v-4h-6v-6zm-4-8h4v-6h6v-4H10v10zm24 14h-6v4h10V28h-4v6zm-6-24v4h6v6h4V10H28z" fill="white"></path>
            </svg>
          </button>
          <button onClick={this.handleHangup}>
            <svg id="hangup" class="hidden" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="-10 -10 68 68">
              <circle cx="24" cy="24" r="34">
              </circle>
              <path transform="scale(0.7), translate(11,10)" d="M24 18c-3.21 0-6.3.5-9.2 1.44v6.21c0 .79-.46 1.47-1.12 1.8-1.95.98-3.74 2.23-5.33 3.7-.36.35-.85.57-1.4.57-.55 0-1.05-.22-1.41-.59L.59 26.18c-.37-.37-.59-.87-.59-1.42 0-.55.22-1.05.59-1.42C6.68 17.55 14.93 14 24 14s17.32 3.55 23.41 9.34c.37.36.59.87.59 1.42 0 .55-.22 1.05-.59 1.41l-4.95 4.95c-.36.36-.86.59-1.41.59-.54 0-1.04-.22-1.4-.57-1.59-1.47-3.38-2.72-5.33-3.7-.66-.33-1.12-1.01-1.12-1.8v-6.21C30.3 18.5 27.21 18 24 18z" fill="white"></path>
            </svg>
          </button>
        </div>
      </div>
    );
  }
}