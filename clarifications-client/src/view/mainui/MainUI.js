import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import { Logout } from '../login/Logout'
import { Contestant } from '../contestant/Contestant'
import { Committee } from '../committee/Committee'
import { Volunteer } from '../volunteer/Volunteer'


import React, {useEffect, useState} from 'react';
import { useHistory } from "react-router-dom";

import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../model/userSlice';
import { checkForUpdates, requestUpdate, selectClarificationData } from '../../model/clarificationDataSlice';

import './MainUI.css';

export function MainUI() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const clarificationData = useSelector(selectClarificationData);
  const history = useHistory();
  
  let [filterText, setFilterText] = useState('');

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

  let searchText = filterText => ([,thread]) => {
    if (filterText === '') return true;
    filterText = filterText.toLowerCase();
    let matchMessage = false;
    for (let message of thread.messages) {
      if ( (message.contentType === 'text' && message.content.toLowerCase().includes(filterText)) || message.sender.toLowerCase().includes(filterText)) matchMessage = true;
    }
    return matchMessage || thread.subject.toLowerCase().includes(filterText) || thread.title.toLowerCase().includes(filterText) || thread.senderid.toLowerCase().includes(filterText) 
  }

  return (
    <div className={'flexVertical'}>
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="#home">Clarification System</Navbar.Brand>
      <Nav className="mr-auto"></Nav>
      <Nav>{user.groupname} {user.displayname}</Nav>
      <Nav><Logout /></Nav>
    </Navbar>
    <Container className={'flexVertical flexElement'} fluid >
      <Container fluid>
      <Row>
          <Col>
            <InputGroup className="replyFragment">

              <FormControl
                placeholder="Filter Questions"
                aria-label="Filter Questions"
                aria-describedby="replytext"
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
              />
              <InputGroup.Append>
                <Button variant="warning" type="button" onClick={e => setFilterText('')}>Clear Filter</Button>
              </InputGroup.Append>
            </InputGroup>
            </Col>
        </Row>
        </Container>
      <br />
      {(user.role === "CONTESTANT" ? <Contestant searchFilter={searchText(filterText)} /> : "")}
      {(user.role === "VOLUNTEER" ? <Volunteer searchFilter={searchText(filterText)} /> : "")}
      {(user.role === "COMMITTEE" ? <Committee searchFilter={searchText(filterText)} /> : "")}
    </Container>
    </div>
  );
}
