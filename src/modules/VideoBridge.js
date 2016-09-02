import React from 'react'

var dc,
    pc,
    socket,
    localVideoStream;

export default class VideoBridge extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
  	socket = this.props.socket;
  }
  init() {
    var remoteVideoStream,
      localVideo = document.getElementById('localVideo'),
      remoteVideo = document.getElementById('remoteVideo'),
      haveLocalMedia = false,
      onMessage = message => {
          console.log('message from peer:', message);
          if (message.type === 'offer') {
              // set remote description and answer
              pc.setRemoteDescription(new RTCSessionDescription(message));
              pc.createAnswer(gotDescription, handleError);
          } else if (message.type === 'answer') {
              // set remote description
              pc.setRemoteDescription(new RTCSessionDescription(message));
          } else if (message.type === 'candidate') {
              // add ice candidate
              pc.addIceCandidate(
                  new RTCIceCandidate({
                      sdpMLineIndex: message.mlineindex,
                      candidate: message.candidate
                  })
              );
          }
      },
      sendData = msg => {
          msg = JSON.stringify(msg);
          console.log('sending ' + msg + ' over data channel');
          dc.send(msg);
      },
      // send the offer to a server to be forwarded to the other peer
      gotDescription = localDesc => {
          pc.setLocalDescription(localDesc);
          console.log('localDesc', localDesc)
          socket.emit('message', localDesc);
      },
      // Set up the data channel message handler
      setupDataHandlers = () => {
          dc.onmessage = function(e) {
              var msg = JSON.parse(e.data);
              console.log('received message over data channel:');
              console.log(msg);
          };
          dc.onclose = function() {
              localVideoStream.getVideoTracks()[0].stop();
              remoteVideoStream.getVideoTracks()[0].stop();
              $broadcast.classList.remove('show', 'modal-callee', 'modal-caller');
              //$broadcastX.removeEventListener('click', close);
              haveLocalMedia = false;
              console.log('The Data Channel is Closed');
          };
      },
      // If RTCPeerConnection is ready and we have local media,
      // attach media to pc
      attachMediaIfReady = () => {
          console.log('attachMediaIfReady', pc, haveLocalMedia);
          if (pc && haveLocalMedia) {
              pc.addStream(localVideoStream);
              console.log('attached', callee);
              // call if we were the last to connect (to increase
              // chances that everything is set up properly at both ends)
              if (callee) {
                  dc = pc.createDataChannel('chat');
                  setupDataHandlers();
                  pc.createOffer(gotDescription, handleError);
              }
          }
      },
      handleError = e => console.log(e),
      //close = () => pc.close(),
      attachMyStream = stream => {
          console.log('getUserMedia success');
          localVideoStream = stream;
          haveLocalMedia = true;
          window.adapter.browserShim.attachMediaStream(localVideo, localVideoStream);
          // wait for RTCPeerConnection to be created
          attachMediaIfReady();
      },
      success = function(stream) {
          console.log('getUserMedia success');
          localVideoStream = stream;
          haveLocalMedia = true;
          window.adapter.browserShim.attachMediaStream(localVideo, localVideoStream);
          // wait for RTCPeerConnection to be created
          attachMediaIfReady();
      };
    // set up the peer connection
    pc = new RTCPeerConnection(
        // this is one of Google's public STUN servers
        {
            iceServers: [{
                url: 'stun:stun.l.google.com:19302'
            }]
        });
    // when our browser gets a candidate, send it to the peer
    pc.onicecandidate = e => {
        console.log(e);
        if (e.candidate) {
            socket.emit('message', {
                type: 'candidate',
                mlineindex: e.candidate.sdpMLineIndex,
                candidate: e.candidate.candidate
            });
        }
    };
    // when the other side added a media stream, show it on screen
    pc.onaddstream = e => {
        console.log('onaddstream', e) 
        remoteVideoStream = e.stream;
        window.adapter.browserShim.attachMediaStream(remoteVideo, remoteVideoStream);
        
    };
    pc.ondatachannel = e => {
        // data channel
        dc = e.channel;
        setupDataHandlers();
        sendData('hello');
    }
    // User selects another user to start a peer connection with

    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true
    })
    .then(attachMyStream)
    .catch(function(e) {
      alert('getUserMedia() error: ' + e.name);
    });
    // wait for local media to be ready
    attachMediaIfReady();
  }
  render(){
    return (
          <video id="remoteVideo" autoPlay></video>
    );
  }
}