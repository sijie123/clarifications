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

export function CommitteeThreadOverview(props) {
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
          <Card.Text className="extraInfoText text-muted">{thread.subject} | {thread.contestantid} | {thread.created} </Card.Text>
        </Col>
        <Col md={3}>
          <div style={{ textAlign: 'right' }}> <span class="badge badge-danger"> new</span> {populateAnswer(thread.answer)}</div>
        </Col>
      </Row>
  )
}

export function CommitteeThreadReplyQuick(props) {
  const [replyOption, setReplyOption] = props.replyOption;

  return (
    <Form.Control as="select" custom value={replyOption} onChange={e => setReplyOption(e.target.value)}>
      <option>Yes</option>
      <option>No</option>
      <option>No comments</option>
      <option>Invalid question</option>
      <option>Refer to comments</option>
    </Form.Control>
  )
}

export function CommitteeExternalThreadReply(props) {
  const replyAction = props.replyAction;
  const threadID = props.threadID;

  const [replyOption, setReplyOption] = useState('Yes');
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('warning');
  const [replyError, setReplyError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault()
    let text = replyOption === "Refer to comments" ? `${replyOption}: ${replyText}` : replyOption;
    replyAction({
      replyText: text,
      isExternal: true
    }, threadID)
    .then(success => {
      setReplyText('');
      setReplyStatus('success');
      setReplyError('');
      setTimeout(() => {
        setReplyStatus('warning');
      }, 2000)
    }).catch( err => {
      setReplyStatus('danger');
      setReplyError(`${err.message}`);
      setTimeout(() => {
        setReplyStatus('warning');
      }, 2000)
    })
  }
  return (
    <Form onSubmit={handleSubmit}>
      {replyError !== "" ? <p style={{ color: 'red' }}>An error has occurred: {replyError}. Please seek assistance from your invigilator.</p> : ""}
      <InputGroup className="replyFragment">
        { replyOption === "Refer to comments" && (
          <InputGroup.Prepend>
            <CommitteeThreadReplyQuick replyOption={[replyOption, setReplyOption]} />
          </InputGroup.Prepend>
        ) || (
          <CommitteeThreadReplyQuick replyOption={[replyOption, setReplyOption]} />
        )}
        
        { replyOption === "Refer to comments" &&
          <FormControl
            placeholder="Reply"
            aria-label="Reply"
            aria-describedby="replytext"
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
          />
        }
        <InputGroup.Append>
          <Button variant={replyStatus} type="submit" disabled={replyStatus === 'success' ? 'disabled' : ''}><FontAwesomeIcon icon={faPaperPlane} /> Reply (visible to contestant)</Button>
        </InputGroup.Append>
      </InputGroup>
    </Form>
  )
}

export function CommitteeInternalThreadReply(props) {
  const replyAction = props.replyAction;
  const threadID = props.threadID;

  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('primary');
  const [replyError, setReplyError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault()
    replyAction({
      replyText: replyText,
      isExternal: false
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
          <Button variant={replyStatus} type="submit" disabled={replyStatus === 'success' ? 'disabled' : ''}><FontAwesomeIcon icon={faPaperPlane} /> Reply (Committee only)</Button>
        </InputGroup.Append>
      </InputGroup>
    </Form>
  )
}

export function CommitteeThreadDetails(props) {
  const thread = props.thread;
  const threadID = props.threadID;
  const bgcolour = props.bgcolour;
  const replyAction = props.replyAction;

  let filter = (isExternal) => ( ([, msg]) => (msg.isExternal == isExternal) )
  return (
    <Card.Body className={bgcolour}>
      <Row>
        <Col md={6}>
          <Messages messages={thread.messages} filter={filter(true)} />
          <CommitteeExternalThreadReply replyAction={replyAction} threadID={threadID} />
        </Col>
        <Col md={6} className={'bg-secondary'}>
          <Messages messages={thread.messages} filter={filter(false)}/>
          <CommitteeInternalThreadReply replyAction={replyAction} threadID={threadID} />
        </Col>
      </Row>
    </Card.Body>
  )
}

export function CommitteeThread(props) {
  const thread = props.thread;
  const threadID = props.id;
  const posn = props.posn;
  const replyAction = props.reply;

  return (
    <Thread thread={thread} id={threadID} posn={posn} replyAction={replyAction}
      overviewBox={{class: CommitteeThreadOverview}} 
      detailsBox={{class: CommitteeThreadDetails}}
    />
  )

}