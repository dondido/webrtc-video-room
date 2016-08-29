import React from 'react';

export default class Join extends React.Component {
  constructor(props) {
    super(props);
    this.joinRoom = this.joinRoom.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.setRoom = this.setRoom.bind(this);
    this.state = {
      value: Number(new Date())
    };
  }
  setRoom() {
    this.setState({value: Number(new Date())});
  }
  joinRoom(e) {
    e.preventDefault();
    this.context.router.push('r/' + this.state.value);
  }
  handleChange(e) {
    this.setState({value: e.target.value});
  }
  render(){
    return (
      <div>
        <p>Please enter a room name.</p>
        <input type="text" name="room" value={this.state.value} onChange={this.handleChange} />
        <button type="button" onClick={this.joinRoom}>Join</button>
        <button type="button" onClick={this.setRoom}>Random</button>
      </div>
    );
  }
}

Join.contextTypes = {
  router: React.PropTypes.object
};