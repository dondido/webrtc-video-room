import React from 'react';

export default class Authentication extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    console.log(this,112);
    this.context.router.push('/about');
    //this.context.router.transitionTo('/');
  }

  render(){
    return (<div onClick={this.handleClick}>Click me!</div>);
  }
}

Authentication.contextTypes = {
  router: React.PropTypes.object
};