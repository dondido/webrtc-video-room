import React from 'react'

var mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
var mediaRecorder;
var recordedBlobs;
var sourceBuffer;

function handleSourceOpen(event) {
  console.log('MediaSource opened');
  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  console.log('Source buffer: ', sourceBuffer);
}

export default class Auth extends React.Component {
  constructor(props) {
    super(props);
    this.snapAndSend = this.snapAndSend.bind(this);
  }
  init() {
    var photo = document.getElementById('photo');
    var photoContext = photo.getContext('2d');
    console.log(111, photo);
  }
  handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
      recordedBlobs.push(event.data);
    }
  }
  handleStop(event) {
    console.log('Recorder stopped: ', event);
  }
  stopRecording() {
    mediaRecorder.stop();
    console.log('Recorded Blobs: ', recordedBlobs);
    recordedVideo.controls = true;
  }
  play() {
    var superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
    recordedVideo.src = window.URL.createObjectURL(superBuffer);
  }
  startRecording() {
    recordedBlobs = [];
    mediaRecorder = new MediaRecorder(window.stream, {mimeType: 'video/webm;codecs=vp9'});
    
    console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
    //recordButton.textContent = 'Stop Recording';
    //playButton.disabled = true;
    //downloadButton.disabled = true;
    mediaRecorder.onstop = this.handleStop;
    mediaRecorder.ondataavailable = this.handleDataAvailable;
    mediaRecorder.start(10); // collect 10ms of data
    console.log('MediaRecorder started', mediaRecorder);
  }
  render(){
    return (
      <div>
      	<canvas id="photo"></canvas>
        <button onClick={this.record}>Start recording</button>
      </div>
    );
  }
}
