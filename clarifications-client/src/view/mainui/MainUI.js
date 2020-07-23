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
import { checkForUpdates, requestUpdate, listTasks, selectClarificationData, updateTimestamp } from '../../model/clarificationDataSlice';
import { fetchDate } from '../../model/actions';

import './MainUI.css';

export function MainUI() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const clarificationData = useSelector(selectClarificationData);
  const history = useHistory();
  
  let [filterText, setFilterText] = useState('');
  let [refreshError, setRefreshError] = useState('');

  useEffect(() => {
    if (!user.isLoggedIn) history.push('/');
  }, [user])

  useEffect(() => {
    if (!clarificationData.shouldUpdate) return;
    dispatch(checkForUpdates())
    .then(success => {
      if (refreshError !== '') {
        console.log("We had an error previously. Force refreshing.")
        setRefreshError('');
        dispatch(updateTimestamp(0));
      }
      return;
    })
    .catch(error => {
      console.log(error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          // Why are you here??
          setRefreshError("Auth token invalid/expired. Please re-open this page using the communications link in CMS again.");
        } else {
          setRefreshError("We're having trouble contacting the server. Please refresh the page manually or speak to your invigilator.");
        }
      } else {
        setRefreshError("We're having problems contacting the server. Check your internet and refresh the page, or speak to your invigilator.");
      }
    })
  }, [clarificationData.shouldUpdate]);

  useEffect(() => {
    dispatch(requestUpdate());
    const timer = setInterval(() => {
      dispatch(requestUpdate());
    }, 5000);
    return () => {
      clearInterval(timer);
    }
  }, []);

  useEffect(() => {
    dispatch(listTasks());
  }, [])

  useEffect(() => {
    fetchDate()
    .then( ({data}) => {
      if (data.timeToStart > 0) {
        setTimeout(() => {
          window.location.reload();
        }, data.timeToStart + (5000 * Math.random()) )
      }
    })
  }, [])

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
      <Nav>{user.displayname}</Nav>
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
        {refreshError !== "" ? <p style={{ color: 'red' }}>{refreshError}</p> : ""}
        </Container>
      <br />
      {(user.role === "CONTESTANT" ? <Contestant searchFilter={searchText(filterText)} /> : "")}
      {(user.role === "VOLUNTEER" ? <Volunteer searchFilter={searchText(filterText)} /> : "")}
      {(user.role === "COMMITTEE" ? <Committee searchFilter={searchText(filterText)} /> : "")}
    </Container>
    </div>
  );
}
