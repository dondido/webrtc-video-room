import React from 'react'
import { render } from 'react-dom'
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'
import { Router, Route, browserHistory } from 'react-router'
import App from './modules/App'
import About from './modules/About'
import Room from './modules/Room'
import NotFound from './modules/NotFound'
import * as reducers from './reducers'
// Add the reducer to your store on the `routing` key
const store = createStore(
  combineReducers({
    ...reducers,
    routing: routerReducer
  })
)
// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store)
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
