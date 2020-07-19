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
import { truncate } from "../common/Util";

import { Similarity } from './Similarity';
import { Visibility } from '../common/Visibility';
import { ContestantLocation } from '../common/ContestantLocation';

import React, {useState, useEffect} from 'react';
import {useDispatch} from 'react-redux';

export function CommitteeThreadOverview(props) {
  let thread = props.thread;
  let short = props.short;

  return (
    <Row>
      <Col md={10}>
        <Card.Text className="mb-0 titleText">{truncate(thread.title, short)}</Card.Text>
        <Card.Text className="extraInfoText text-muted">{thread.subject} | {thread.senderid} | {thread.created} </Card.Text>
      </Col>
      <Col md={2}>
        <div style={{ textAlign: 'right' }}> {!thread.seen && <span class="badge badge-danger"> new</span>}</div>
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
      <option>Answered in Task Description</option>
      <option>Invalid question</option>
      <option>Refer to comments</option>
    </Form.Control>
  )
}

export function CommitteeExternalThreadReply(props) {
  const dispatch = useDispatch();
  const threadID = props.threadID;

  const [replyOption, setReplyOption] = useState('Yes');
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('warning');
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
    let text = replyOption === "Refer to comments" ? `${replyText}` : replyOption;
    submitNewReply({
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
      {replyError !== "" ? <p style={{ color: 'red' }}>{replyError}</p> : ""}
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
          <Button variant={replyStatus} type="submit" disabled={replyStatus === 'success' ? 'disabled' : ''}><FontAwesomeIcon icon={faPaperPlane} /> Reply (Committee only)</Button>
        </InputGroup.Append>
      </InputGroup>
    </Form>
  )
}

export function CommitteeAnnouncementThreadReply(props) {
  const dispatch = useDispatch();
  const threadID = props.threadID;

  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('warning');
  const [replyError, setReplyError] = useState('');
  const [prepareToSubmit, setPrepareToSubmit] = useState(false);

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
    if (prepareToSubmit) {
      submit();
      setPrepareToSubmit(false);
    } else {
      setPrepareToSubmit(true);
      setTimeout(() => {
        setPrepareToSubmit(false);
      }, 3000);
    }
  }

  const submit = (event) => {
    
    submitNewReply({
      replyText: replyText,
      isExternal: false
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
          <Button variant={replyStatus} type="submit" disabled={replyStatus === 'success' ? 'disabled' : ''}><FontAwesomeIcon icon={faPaperPlane} /> {prepareToSubmit ? 'Again to Confirm' : 'Follow-up (Visible to all)'} </Button>
        </InputGroup.Append>
      </InputGroup>
    </Form>
  )
}


export function CommitteeAnnouncementDetails(props) {
  const thread = props.thread;
  const threadID = props.threadID;

  return (
    <Card.Body>
      <Row>
        <Col md={7} className={'px-2 border-right'}>
          <div className={'bg-light'} style={{paddingTop: '20px'}}>
          <Messages messages={thread.messages} />
          <CommitteeAnnouncementThreadReply threadID={threadID} />
          </div>
        </Col>
        <Col md={5} className={'px-2 border-left'}>
          <h4>Announcement</h4>
          <p>Author: {thread.senderid}
             <br />
             Visibility: All participants & committee</p>
        </Col>
      </Row>
    </Card.Body>
  )
}

export function CommitteeThreadDetails(props) {
  const thread = props.thread;
  const threadID = props.threadID;
  const availableGroups = props.availableGroups;
  const bgcolour = props.bgcolour;
  const setCurrentlyFocusedThreadID = props.setCurrentlyFocusedThreadID;

  let filter = (isExternal) => ( ([, msg]) => (msg.isExternal == isExternal) )

  return (
    <Card.Body>
      <Row>
        <Col md={7} className={'px-2 border-right'}>
          <div className={'bg-light'} style={{paddingTop: '20px'}}>
          <Messages messages={thread.messages} filter={filter(true)} />
          <CommitteeExternalThreadReply threadID={threadID} />
          </div>
        </Col>
        <Col md={5} className={'px-2 border-left'}>
          <h4>Basic Information</h4>
          <p>
            ContestantID: {thread.senderid}<br/>
            Location: <ContestantLocation contestant={thread.senderid}/><br/>
            Created By: {thread.creatorid}<br />
            <Visibility thread={thread} threadID={threadID} availableGroups={availableGroups}/>
          </p>
          <h4>Similar Questions</h4>
          <Similarity title={thread.title} setCurrentlyFocusedThreadID={setCurrentlyFocusedThreadID} />

          <h4>Internal Communication</h4>
          <div className={'bg-internalComms'} style={{paddingTop: '20px'}}>
            <Messages messages={thread.messages} filter={filter(false)}/>
            <CommitteeInternalThreadReply threadID={threadID} />
          </div>
        </Col>
      </Row>
    </Card.Body>
  )
}