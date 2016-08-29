import React from 'react'

export default class About extends React.Component {
  constructor(props) {
    super(props);
  }
  render(){
  	const loc = window.location.href;
    return (
      <div>Waiting for someone to join this room:
      	<a href="{window.location.href}">{window.location.href}</a>
      </div>
    );
  }
}
