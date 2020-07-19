import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'

import { replyToThread } from "../../model/clarificationDataSlice";
import { Messages } from "../common/Message";

import React, {useState, useEffect} from 'react';
import {useDispatch} from 'react-redux';
const THREAD_OPEN = 'Awaiting Answer';

export function ContestantThreadOverview(props) {
  let thread = props.thread;

  const populateAnswer = (ans) => {
    return <b><i>{ans}</i></b>;
  }

  return (
    <Row>
      <Col md={7}>
        <Card.Text className="mb-0 titleText">{thread.title}</Card.Text>
        <Card.Text className="extraInfoText text-muted">{thread.subject}</Card.Text>
      </Col>
      {
        !thread.isannouncement && 
        <Col md={5}>
          <div style={{ textAlign: 'right' }}> {!thread.seen && <span className="badge badge-danger"> new</span>} {populateAnswer(thread.answer)}</div>
        </Col>
      }
    </Row>
  )
}

export function ContestantThreadReply(props) {
  const dispatch = useDispatch();
  const threadID = props.threadID;

  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('primary');
  const [replyError, setReplyError] = useState('');

  const submitNewReply = (reply, threadID) => {
    return new Promise( (resolve, reject) => {
      if (reply.replyText.trim() === '') {
        throw new Error("Your message cannot be empty.");
      }
      dispatch(replyToThread({
        threadID: threadID,
        content: reply.replyText,
        isExternal: reply.isExternal,
      }, resolve, reject))
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    submitNewReply({
      replyText: replyText,
      isExternal: true
    }, threadID)
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
      {replyError !== "" ? <p style={{ color: 'red' }}>{replyError}</p> : ""}
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

export function ContestantAnnouncementDetails(props) {
  const thread = props.thread;
  const bgcolour = props.bgcolour;
  return (
    <Card.Body className={bgcolour}>
      <Messages messages={thread.messages} />
    </Card.Body>
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
