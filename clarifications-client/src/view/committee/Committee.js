import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion'
import AccordionContext from 'react-bootstrap/AccordionContext';
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col'

import { CommitteeThread } from './CommitteeThread'
import { NewQuestion } from './NewQuestion'

import React, { useState, useEffect, useRef, useContext } from 'react';
import { useHistory } from "react-router-dom";

import { useSelector, useDispatch } from 'react-redux';
import { checkForUpdates, startNewThread, replyToThread, selectClarificationData } from '../../model/clarificationDataSlice';
import { selectUser } from '../../model/userSlice';
import './Contestant.css';

export function Committee() {

  const history = useHistory();
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const clarificationData = useSelector(selectClarificationData);

  const [hasUpdatesFromServer, setHasUpdatesFromServer] = useState(true);
  const activeKeyRef = useRef();
  const currentEventKey = useContext(AccordionContext);

  const submitNewQuestion = (clarificationSubject, clarificationText, success, failure) => {
    startNewThread({
      username: user.username,
      token: user.token
    }, {
      subject: clarificationSubject,
      content: clarificationText
    }, () => {
      console.log(currentEventKey);
      // console.log(activeKeyRef.current.setState({activeKey: '' }));
      success();
      setHasUpdatesFromServer(true);
      // activeKeyRef.current.activeKey = '1';
    }, failure)
  }

  const submitNewReply = (reply, threadID) => {
    return replyToThread({
      username: user.username,
      token: user.token
    }, {
      threadID: threadID,
      content: reply.replyText,
      isExternal: reply.isExternal,
    }).then(successResult => {
      setHasUpdatesFromServer(true);
    })
  }

  useEffect(() => {
    if (!hasUpdatesFromServer) return;
    dispatch(checkForUpdates({
      username: user.username,
      token: user.token
    }, clarificationData.currentUpdateTimestamp, () => {
      setHasUpdatesFromServer(false);
    }, (err) => {
      console.log(err);
    }))
  }, [hasUpdatesFromServer]);

  const THREAD_OPEN = 'Awaiting Answer';

  return (
    <Container fluid>
      <Accordion ref={activeKeyRef}>
        <Card>
          <Card.Header>
            <h5 class="m-0" className="inline">Questions</h5>
            <Accordion.Toggle as={Button} id="newQuestion" eventKey="newQuestionBody">New Question</Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey="newQuestionBody">
            <NewQuestion action={submitNewQuestion} subjectOptions={["General", "Mountaineering", "Space Exploration", "Corona Beer"]} />
          </Accordion.Collapse>
          {Object.entries(clarificationData.threads).sort(([, msg1], [, msg2]) => {
            if (msg1.answer == THREAD_OPEN && msg2.answer == THREAD_OPEN)
              return msg1.ID - msg2.ID;
            if (msg1.answer == THREAD_OPEN && msg2.answer != THREAD_OPEN)
              return 1;
            if (msg1.answer != THREAD_OPEN && msg2.answer == THREAD_OPEN)
              return -1;
            return msg1.ID - msg2.ID;
          }).map(([id, thread], posn) => {
            return <CommitteeThread reply={submitNewReply} thread={thread} id={id} posn={posn} />
          })}
        </Card>
      </Accordion>
    </Container>
  );
}
