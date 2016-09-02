import React from 'react'
import VideoBridge from './VideoBridge'
import Auth from './Auth'

var socket;


export default class Room extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      lastGistUrl: ''
    };
    this.getUserMedia = navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true
    })
  }
  componentDidMount() {


  	socket = io.connect();

    this.getUserMedia.then(stream => 
      this.refs.lv.src = window.URL ? window.URL.createObjectURL(stream) : stream);

    socket.on('created', room => {
      console.log('Created room ' + room);
      //this.refs.vb.init();
      this.getUserMedia.then(this.refs.au.init);
    });

    socket.on('full', function(room) {
      console.log('Room ' + room + ' is full');
    });

    socket.on('join', function (room){
      console.log('Another peer made a request to join room ' + room);
      console.log('This peer is the initiator of room ' + room + '!');
    });

    socket.on('joined', function(room) {
      console.log('joined: ' + room);
    });

    socket.on('log', function(array) {
      console.log.apply(console, array);
    });
    socket.emit('create or join', this.props.params.room);
  }
  render(){
  	const href = window.location.href;
    return (
      <div>
        <video ref="lv" autoPlay muted></video>
        <VideoBridge socket={socket} au={this.refs.au} ref="vb" />
        <Auth socket={socket} ref="au" />
        <div>Waiting for someone to join this room:
        	<a href={href}>{href}</a>
        </div>
      </div>
    );
  }
}