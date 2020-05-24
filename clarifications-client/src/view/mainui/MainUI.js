import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav';

import { Logout } from '../login/Logout'
import { Contestant } from '../contestant/Contestant'
import { Committee } from '../committee/Committee'

import React, {useEffect} from 'react';
import { useHistory } from "react-router-dom";

import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../model/userSlice';
import { checkForUpdates, requestUpdate, selectClarificationData } from '../../model/clarificationDataSlice';

import styles from './MainUI.module.css';

export function MainUI() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const clarificationData = useSelector(selectClarificationData);
  const history = useHistory();
  

  useEffect(() => {
    if (!user.isLoggedIn) history.push('/');
  }, [user])

  useEffect(() => {
    if (!clarificationData.shouldUpdate) return;
    dispatch(checkForUpdates())
    .catch(err => {
      console.log(err);
    })
  }, [clarificationData.shouldUpdate]);

  useEffect(() => {
    dispatch(requestUpdate());
    const timer = setInterval(() => {
      dispatch(requestUpdate());
    }, 5000);
  }, []);


  return (
    <div>
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="#home">Clarification System</Navbar.Brand>
      <Nav className="mr-auto"></Nav>
      <Nav>{user.groupname} {user.displayname}</Nav>
      <Nav><Logout /></Nav>
    </Navbar>
    <Container className={styles.topMargin} fluid>
      {(user.role === "CONTESTANT" ? <Contestant /> : "")}
      {(user.role === "VOLUNTEER" ? <Contestant /> : "")}
      {(user.role === "COMMITTEE" ? <Committee /> : "")}
    </Container>
    </div>
  );
}
