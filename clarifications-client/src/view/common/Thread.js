import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'

import React, { useState } from 'react';

import { Messages } from "./Message";

const THREAD_OPEN = 'Awaiting Answer';

export function Thread(props) {
  const thread = props.thread;
  const threadID = props.id;
  const posn = props.posn;
  const replyAction = props.replyAction;

  const ThreadOverview = props.overviewBox;
  const ThreadOverviewElement = ThreadOverview.class;

  const ThreadDetails = props.detailsBox;
  const ThreadDetailsElement = ThreadDetails.class;

  

  const populateBGColour = (ans) => {
    if (ans !== THREAD_OPEN) return 'answered';
    return (posn % 2 == 0) ? '' : 'bg-light';
  }
  
  return (
    
    <React.Fragment>
      <Accordion.Toggle as={Card.Body} variant="link" eventKey={threadID} className={`overview ${populateBGColour(thread.answer)}`}>
        <ThreadOverviewElement threadID={threadID} thread={thread} />
      </Accordion.Toggle>
      <Accordion.Collapse eventKey={threadID}>
        <ThreadDetailsElement threadID={threadID} thread={thread} replyAction={replyAction} bgcolour={populateBGColour(thread.answer)}/>
      </Accordion.Collapse>
    </React.Fragment>
  )
}