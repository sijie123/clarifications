import React from 'react';
import { BrowserRouter, Route, Switch, Redirect  } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { useSelector } from 'react-redux';

import { Login } from './view/login/Login'
import { MainUI } from './view/mainui/MainUI'
import { selectUser } from './model/userSlice';
function App() {
  const user = useSelector(selectUser);
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/' render={() => {
          if (user.isLoggedIn) return <MainUI />;
          else return <Redirect to="/login" />;
        }} />
        <Route path='/login' render={() => {return <Login />}} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
