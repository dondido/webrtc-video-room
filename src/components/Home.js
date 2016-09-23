import React from 'react'
import { Link } from 'react-router'
const Home = props =>
  <div className="home">
    <div>
      <p>Please enter a room name.</p>
      <input type="text" name="room" value={props.roomId} onChange={props.handleChange}  autoFocus />
      <button className="primary-button" type="button" onClick={props.joinRoom}>Join</button>
      <button className="primary-button" type="button" onClick={props.setRoom}>Random</button>
      {props.rooms.length !== 0 && <div>Recently used rooms:</div>}
      {[...props.rooms].map(room => <Link key={room} className="recent-room" to={'/r/' + room}>{room}</Link>)}
    </div>
  </div>;
Home.propTypes = {
  roomId: React.PropTypes.number.isRequired,
  handleChange: React.PropTypes.func.isRequired,
  joinRoom: React.PropTypes.func.isRequired,
  setRoom: React.PropTypes.func.isRequired,
  rooms: React.PropTypes.object.isRequired,
}
export default Home;