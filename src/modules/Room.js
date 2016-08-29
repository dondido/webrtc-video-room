import React from 'react';

export default class Room extends React.Component {
  constructor(props) {
    super(props);
  }
  render(){
  	const href = window.location.href;
    return (
      <div>Waiting for someone to join this room:
      	<a href={href}>{href}</a>
      </div>
    );
  }
}