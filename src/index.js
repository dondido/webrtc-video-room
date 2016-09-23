import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import store from './store';
import { Router, Route, browserHistory } from 'react-router'
import Home from './containers/HomePage'
import Room from './containers/RoomPage'
import NotFound from './components/NotFound'
render((
	<Provider store={store}>
    { /* Tell the Router to use our enhanced history */ }
	  <Router history={browserHistory}>
	    <Route path="/" component={Home}/>
	    <Route path="/r/:room" component={Room}/>
	    <Route path='*' component={NotFound} />
	  </Router>
	</Provider>
), document.getElementById('app'))
