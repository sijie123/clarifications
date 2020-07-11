import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button'

import React, { useEffect } from 'react';
import { useHistory } from "react-router-dom";

import { useSelector, useDispatch } from 'react-redux';
import { doLogin, selectUser } from '../../model/userSlice';
import style from './Login.module.css';
import Cookies from 'js-cookie'
import * as qs from 'query-string';

/**
 * This page uses traditional form posts rather than AJAX.
 * On form submit, POST: /api/login.
 * On success, user will automatically be redirected back here
 * with cookie set.
 */
export function Login() {
  const dispatch = useDispatch();
  const history = useHistory();

  const parsed = qs.parse(window.location.search);
  const errorMsg = parsed['err'];

  const parseError = (msg) => {
    switch(msg) {
      case 'invalid_credentials':
        return "Invalid Login Credentials";
      default:
        return "";
    }
  }

  const user = useSelector(selectUser);
  
  const isLoggedIn = () => {
    if (user.isLoggedIn) return true;
    
    let token = Cookies.get('auth');
    if (token) {
      dispatch(doLogin(token));
      return true;
    }

    return false;
  }

  useEffect(() => {
    if (isLoggedIn()) history.push('/');
  })

  return (
    <Container>
      <div className={style.logregforms}>
        <Form className={style.formsignin} id="loginForm" action="/api/login/" method="POST">
          <h3 style={{textAlign: "center"}}>Online Clarification System</h3>
          <h1 className="h3 mb-3 font-weight-normal" style={{textAlign: "center"}}> Sign in</h1>
          <h5 style={{color: "red"}} id="errorMsg">{parseError(errorMsg)}</h5>
          <hr />
          <Form.Control className={style.formcontrol} type="text" name="username" id="username" placeholder="Username" required="" autoFocus="" />
          <Form.Control className={style.formcontrol} type="password" name="password" id="password" placeholder="Password" required="" />
          <Button variant="primary" type="submit">
            <i className="fas fa-sign-in-alt"></i>
            Submit
          </Button>
        </Form>
      </div>
    </Container>
  );
}
