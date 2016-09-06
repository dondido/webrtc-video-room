import React from 'react';

export default class Join extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    value: new Date() - new Date().setHours(0, 0, 0, 0)
  }
  static contextTypes = {
    router: React.PropTypes.object
  }
  setRoom = () => this.setState({value: new Date() - new Date().setHours(0, 0, 0, 0)})
  joinRoom = (e) => {
    e.preventDefault();
    this.context.router.push('r/' + this.state.value);
  }
  handleChange = e => this.setState({value: e.target.value})
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