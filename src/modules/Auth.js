import React from 'react'
import Remarkable from 'remarkable'

export default class Auth extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    room: '',
    sid: '',
    userName: '',
    message: ''
  }
  hideAuth() {
    this.setState({room: ''});
  } 
  full = () => this.setState({room: 'full'})
  componentDidMount() {
    const socket = this.props.socket;
    let user;
    socket.on('create', () => {
      user = 'host';
      localStorage.setItem('rooms', JSON.stringify({aaa: {user: 'host'}}))
    });
    socket.on('full', this.full);
    socket.on('bridge', role => {
      user = role || user; 
      this.props.setUser(user); console.log(112, user)});
    socket.on('join', () => {
      this.setState({room: 'join'});
      user = 'guest';
    });
    socket.on('approve', data => {
      this.setState({room: 'approve'});
      this.setState({userName: data.userName});
      this.setState({message: data.message});
      this.setState({sid: data.sid});
    });
    socket.on('log', function(array) {
      console.log.apply(console, array);
    });
    socket.emit('find');
  }
  handleInput = e => this.setState({[e.target.dataset.ref]: e.target.value})
  send = e => {
    e.preventDefault();
    this.props.socket.emit('auth', this.state);
    this.hideAuth();
  }
  handleInvitation = e => {
    e.preventDefault();
    this.props.socket.emit([e.target.dataset.ref], this.state.sid);
    this.hideAuth();
  }
  getContent(content) {
    return {__html: (new Remarkable()).render(content)};
  }
  render(){
    return (
      <div className={this.state.room}>
        <form className="request-access">
          <input type="text" onChange={this.handleInput} data-ref="userName" />
        	<input type="text" onChange={this.handleInput} data-ref="message" />
          <button onClick={this.send}>Send</button>
        </form>
        <div className="grant-access">
          <div dangerouslySetInnerHTML={this.getContent(this.state.userName)}></div>
          <div dangerouslySetInnerHTML={this.getContent(this.state.message)}></div>
          <button onClick={this.handleInvitation} data-ref="reject">Reject</button>
          <button onClick={this.handleInvitation} data-ref="accept">Accept</button>
        </div>
        <div className="room-occupied">Please, try another room!</div>
      </div>
    );
  }
}