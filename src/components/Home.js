import React from 'react'
import { Link } from 'react-router'

const Home = props =>
  <div className="home">
    <div>
      <h1 itemProp="headline">Webrtc Video Room</h1>
      <p>Please enter a room name.</p>
      <form onSubmit={props.joinRoom}>
        <input type="text" name="room" value={props.roomId} onChange={props.handleChange} pattern="^\w+$" maxLength="10" required autoFocus title="Room name should only contain letters or numbers."/>
        <button className="primary-button" type="submit">Join</button>
        <button className="primary-button" onClick={props.setRoom}>Random</button>
      </form>
      {props.rooms.length !== 0 && <div>Recently used rooms:</div>}
      {[...props.rooms].map(room => <Link key={room} className="recent-room" to={'/r/' + room}>{room}</Link>)}
    </div>
  </div>;
Home.propTypes = {
  handleChange: React.PropTypes.func.isRequired,
  joinRoom: React.PropTypes.func.isRequired,
  setRoom: React.PropTypes.func.isRequired,
  roomId: React.PropTypes.string.isRequired,
  rooms: React.PropTypes.object.isRequired
};
export default Home;
