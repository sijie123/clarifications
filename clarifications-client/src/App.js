import React from 'react';
import { BrowserRouter, Route, Switch, Redirect  } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useSelector } from 'react-redux';

import { Login } from './features/login/Login'
import { MainUI } from './features/main_ui/MainUI'
import {
  selectUser
} from './features/login/userSlice';
function App() {
  const user = useSelector(selectUser);
  console.log(user);
  console.log(user.isLoggedIn);
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/' render={() => {
          // return "Hi you are logged in";
          if (user.isLoggedIn) return "Hi you are logged in.";
          else return <Redirect to="/login" />;
        }} />
        <Route path='/login' render={() => {return <Login />}} />
      </Switch>
    </BrowserRouter>
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <Counter />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <span>
    //       <span>Learn </span>
    //       <a
    //         className="App-link"
    //         href="https://reactjs.org/"
    //         target="_blank"
    //         rel="noopener noreferrer"
    //       >
    //         React
    //       </a>
    //       <span>, </span>
    //       <a
    //         className="App-link"
    //         href="https://redux.js.org/"
    //         target="_blank"
    //         rel="noopener noreferrer"
    //       >
    //         Redux
    //       </a>
    //       <span>, </span>
    //       <a
    //         className="App-link"
    //         href="https://redux-toolkit.js.org/"
    //         target="_blank"
    //         rel="noopener noreferrer"
    //       >
    //         Redux Toolkit
    //       </a>
    //       ,<span> and </span>
    //       <a
    //         className="App-link"
    //         href="https://react-redux.js.org/"
    //         target="_blank"
    //         rel="noopener noreferrer"
    //       >
    //         React Redux
    //       </a>
    //     </span>
    //   </header>
    // </div>
  );
}

export default App;
