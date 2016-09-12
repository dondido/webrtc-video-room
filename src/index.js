import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import store from './store';
import { Router, Route, browserHistory } from 'react-router'
import App from './modules/App'
import About from './modules/About'
import Room from './modules/Room'
import NotFound from './modules/NotFound'
render((
	<Provider store={store}>
    { /* Tell the Router to use our enhanced history */ }
	  <Router history={browserHistory}>
	    <Route path="/" component={App}/>
	    <Route path="/r/:room" component={Room}/>
	    <Route path="/about" component={About}/>
	    <Route path='*' component={NotFound} />
	  </Router>
	</Provider>
), document.getElementById('app'))
