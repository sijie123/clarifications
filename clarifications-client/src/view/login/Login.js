import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button'

import React, { useState } from 'react';
import { useHistory } from "react-router-dom";

import { useSelector, useDispatch } from 'react-redux';
import { doLogin, selectUser } from '../../model/userSlice';
import style from './Login.module.css';

export function Login() {
  const history = useHistory();

  const user = useSelector(selectUser);
  if (user.isLoggedIn) history.push('/')

  const dispatch = useDispatch();
  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(doLogin({username, password}, (success) => {
      history.push('/');
    }, (error) => {
      console.log(error);
      setError(`${error.msg}`);
    }));
  }
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setError] = useState('');

  return (
    <Container>
      <div className={style.logregforms}>
        <Form className={style.formsignin} id="loginForm" onSubmit={handleSubmit}>
          <h3 style={{textAlign: "center"}}>Online Clarification System</h3>
          <h1 className="h3 mb-3 font-weight-normal" style={{textAlign: "center"}}> Sign in</h1>
          <h5 style={{color: "red"}} id="errorMsg">{errorMsg}</h5>
          <hr />
          <Form.Control className={style.formcontrol} type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required="" autoFocus="" />
          <Form.Control className={style.formcontrol} type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required="" />
          <Button variant="primary" type="submit">
            <i className="fas fa-sign-in-alt"></i>
            Submit
          </Button>
        </Form>
      </div>
    </Container>
  );
}
