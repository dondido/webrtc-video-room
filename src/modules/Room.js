import React from 'react'
import VideoBridge from './VideoBridge'

var socket;


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

    socket.emit('create or join', this.props.params.roo);
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