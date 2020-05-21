import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion'
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'

import {Thread} from "../common/Thread"
import { Messages } from "../common/Message";

import React, {useState} from 'react';
const THREAD_OPEN = 'Awaiting Answer';

export function ContestantThreadOverview(props) {
  let threadID = props.threadID;
  let thread = props.thread;

  const populateAnswer = (ans) => {
    if (ans === THREAD_OPEN) return THREAD_OPEN;
    else return `Answered: ${ans}`;
  }
  
  return (
      <Row>
        <Col md={9}>
          <Card.Text className="mb-0 titleText">{thread.title}</Card.Text>
          <Card.Text className="extraInfoText text-muted">{thread.subject}</Card.Text>
        </Col>
        <Col md={3}>
          <div style={{ textAlign: 'right' }}> <span class="badge badge-danger"> new</span> {populateAnswer(thread.answer)}</div>
        </Col>
      </Row>
  )
}

export function ContestantThreadReply(props) {
  const replyAction = props.replyAction;
  const threadID = props.threadID;

  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('primary');
  const [replyError, setReplyError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault()
    replyAction(replyText, threadID)
    .then(success => {
      setReplyText('');
      setReplyStatus('success');
      setReplyError('');
      setTimeout(() => {
        setReplyStatus('primary');
      }, 2000)
    }).catch( err => {
      setReplyStatus('danger');
      setReplyError(`${err.message}`);
      setTimeout(() => {
        setReplyStatus('primary');
      }, 2000)
    })
  }
  return (
    <Form onSubmit={handleSubmit}>
      {replyError !== "" ? <p style={{ color: 'red' }}>An error has occurred: {replyError}. Please seek assistance from your invigilator.</p> : ""}
      <InputGroup className="replyFragment">
        <FormControl
          placeholder="Reply"
          aria-label="Reply"
          aria-describedby="replytext"
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
        />
        <InputGroup.Append>
          <Button variant={replyStatus} type="submit" disabled={replyStatus === 'success' ? 'disabled' : ''}><FontAwesomeIcon icon={faPaperPlane} /> Send</Button>
        </InputGroup.Append>
      </InputGroup>
    </Form>
  )
}

export function ContestantThreadDetails(props) {
  const thread = props.thread;
  const threadID = props.threadID;
  const bgcolour = props.bgcolour;
  const replyAction = props.replyAction;
  return (
    <Card.Body className={bgcolour}>
      <Messages messages={thread.messages} />
      <ContestantThreadReply replyAction={replyAction} threadID={threadID} />
    </Card.Body>
  )
}

export function ContestantThread(props) {
  const thread = props.thread;
  const threadID = props.id;
  const posn = props.posn;
  const replyAction = props.reply;

  return (
    <Thread thread={thread} id={threadID} posn={posn} replyAction={replyAction}
      overviewBox={{class: ContestantThreadOverview}} 
      detailsBox={{class: ContestantThreadDetails}}
    />
  )

}