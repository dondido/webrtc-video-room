import React from 'react'
import { withRouter, Link } from 'react-router'
import { connect } from 'react-redux'

class Home extends React.Component {
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
      <div className="home">
        <div>
          <p>Please enter a room name.</p>
          <input type="text" name="room" value={this.state.value} onChange={this.handleChange} />
          <button className="primary-button" type="button" onClick={this.joinRoom}>Join</button>
          <button className="primary-button" type="button" onClick={this.setRoom}>Random</button>
          {this.props.rooms.length !== 0 && <div>Recently used rooms:</div>}
          {this.props.rooms.map(room => <Link key={room} className="recent-room" to={'/r/' + room}>{room}</Link>)}
        </div>
      </div>
    );
  }
}
const mapStateToProps = store => {console.log(114, store); return {
  rooms: store.rooms.concat()}};
const mapDispatchToProps = (dispatch, ownProps) =>
   ({
    addRoom: function() {
      console.log('ownProps', ownProps)
      store.dispatch({
        type: 'ADD_ROOM',
        room: ownProps.params.room
      });
    }
  });
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Home));