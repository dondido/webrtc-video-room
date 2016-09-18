import React from 'react'
import Remarkable from 'remarkable'
import { Link } from 'react-router'
export default class Auth extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    room: 'auth',
    sid: '',
    message: ''
  }
  hideAuth() {
    this.setState({room: 'auth'});
  } 
  full = () => this.setState({room: 'auth full'})
  componentDidMount() {
    const socket = this.props.socket;
    let user;
    socket.on('create', () => user = 'host');
    socket.on('full', this.full);
    socket.on('bridge', role => this.props.initRemote(role || user));
    socket.on('join', () => {
      this.setState({room: 'auth join'});
      user = 'guest';
    });
    socket.on('approve', data => {
      this.setState({room: 'auth approve'});
      this.setState({message: data.message});
      this.setState({sid: data.sid});
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
          <p>Send an invitation to join the room.</p>
        	<input type="text" autoFocus onChange={this.handleInput} data-ref="message" placeholder="Hi, I'm John Doe." />
          <button onClick={this.send} className="primary-button">Send</button>
        </form>
        <div className="grant-access">
          <p>A peer has sent you a message to join the room:</p>
          <div dangerouslySetInnerHTML={this.getContent(this.state.message)}></div>
          <button onClick={this.handleInvitation} data-ref="reject" className="primary-button">Reject</button>
          <button onClick={this.handleInvitation} data-ref="accept" className="primary-button">Accept</button>
        </div>
        <div className="room-occupied">
          <p>Please, try another room!</p>
          <Link  className="primary-button" to="/">OK</Link>
        </div>
      </div>
    );
  }
}