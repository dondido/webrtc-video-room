# WebRTC video chat app with ReactJS
## Synopsis
WebRTC audio/video conferencing app with user authentication using ReactJS.
## Motivation
Simple ReactJS app that interacts with the WebRTC APIs to establish audio/video conference between users, without a trip through a server.
## Application Logic and Implementations
To connect two users over WebRTC, we exchange information to allow browsers to talk to each other. This process is called signaling and it is facilitated by using NodeJS and socket server chained to the express 4.0 engine to provide the plumbing. Other than signaling, no data has to be sent through a server. When a connection is successfully established and authentication and authorization are complete, stream data exchanged between peers is directed to a React component for rendering.

## Installation

Once you have forked this project, go ahead and use npm through the command line to install all required dependecies:

```bash
npm install
npm install webpack -global
webpack --progress -p
npm start
```

## Demo

Demo of the app can be found on Heroku:
https://webrtc-video-room.herokuapp.com/

### License

MIT License

Copyright (c) 2015 Dian Dimitrov

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
