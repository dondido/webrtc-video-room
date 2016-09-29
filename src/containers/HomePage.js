import React from 'react'
import { connect } from 'react-redux'
import Home from '../components/Home'
import store from '../store'
class HomePage extends React.Component {
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
  joinRoom = e => {
    e.preventDefault();
    this.context.router.push('r/' + this.state.value);
  }
  handleChange = e => this.setState({value: e.target.value})
  render(){
    return (
      <Home
        roomId={this.state.value}
        handleChange={this.handleChange}
        joinRoom={this.joinRoom}
        setRoom={this.setRoom}
        rooms={this.props.rooms}
        ></Home>
    );
  }
}
const mapStateToProps = store => ({rooms: new Set([...store.rooms])});
export default connect(mapStateToProps)(HomePage);