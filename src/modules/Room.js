import React from 'react'
import VideoBridge from './VideoBridge'

var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;

var pcConfig = {
  'iceServers': [{
    'url': 'stun:stun.l.google.com:19302'
  }]
};
// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
  'mandatory': {
    'OfferToReceiveAudio': true,
    'OfferToReceiveVideo': true
  }
};

/////////////////////////////////////////////

var room = 'foo';
// Could prompt for room name:
// room = prompt('Enter room name:');

var socket;

////////////////////////////////////////////////




export default class Room extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      lastGistUrl: ''
    };
  }
  componentDidMount() {


  	socket = io.connect();

    socket.on('created', room => {
      console.log('Created room ' + room);
      this.refs.vb.init();
      isInitiator = true;
    });

    socket.on('full', function(room) {
      console.log('Room ' + room + ' is full');
    });

    socket.on('join', function (room){
      console.log('Another peer made a request to join room ' + room);
      console.log('This peer is the initiator of room ' + room + '!');

      isChannelReady = true;
    });

    socket.on('joined', function(room) {
      console.log('joined: ' + room);
      isChannelReady = true;
    });

    socket.on('log', function(array) {
      console.log.apply(console, array);
    });


    room = this.props.params.room;
    socket.emit('create or join', room);
    console.log('Attempted to create or  join room', room);
  }
  render(){
  	const href = window.location.href;
    return (
      <div>
        <VideoBridge socket={socket} ref="vb" />
        <div>Waiting for someone to join this room:
        	<a href={href}>{href}</a>
        </div>
      </div>
    );
  }
}