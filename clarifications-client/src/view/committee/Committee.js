import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import { CommitteeThreadOverview, CommitteeThreadDetails, CommitteeAnnouncementDetails } from './CommitteeThread'
import { DetailsWrapper } from "../common/DetailsWrapper";
import { NothingSelectedThread } from "../common/NothingSelectedThread"
import { NewThread } from '../common/NewThread'

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectClarificationData } from '../../model/clarificationDataSlice';
import '../common/Common.css'

const THREAD_OPEN = 'Awaiting Answer';

export function Committee() {

  const clarificationData = useSelector(selectClarificationData);

  let [currentlyFocusedThreadID, setCurrentlyFocusedThreadID] = useState(null);

  const answered = (thread) => {
    return (thread.answer !== THREAD_OPEN) ? 'answered' : '';
  }

  const currentlySelected = (threadID) => {
    return (currentlyFocusedThreadID == threadID) ? 'bg-selected' : '';
  }

  const displayCurrentlyFocusedThread = () => {
    if (currentlyFocusedThreadID == null) return <NothingSelectedThread />;
    else if (currentlyFocusedThreadID === 'NewQuestion') return <NewThread isAnnouncement={true} subjectOptions={["General", "Mountaineering", "Space Exploration", "Corona Beer"]} />;
    let thread = clarificationData.threads[currentlyFocusedThreadID]
    return (
      <DetailsWrapper thread={thread} threadID={currentlyFocusedThreadID}>
          <Card.Body className={`${answered(thread)}`}><CommitteeThreadOverview threadID={currentlyFocusedThreadID} thread={thread} /></Card.Body>
          {
            thread.isannouncement ? 
              <CommitteeAnnouncementDetails threadID={currentlyFocusedThreadID} thread={thread} /> : 
              <CommitteeThreadDetails threadID={currentlyFocusedThreadID} thread={thread} setCurrentlyFocusedThreadID={setCurrentlyFocusedThreadID} />
          }
      </DetailsWrapper>
    ); 
  }
  
  let onlyAnswered = ([,thread]) => {
    return thread.answer !== THREAD_OPEN;
  }
  let onlyUnanswered = ([,thread]) => {
    return thread.answer === THREAD_OPEN;
  }
  let onlyAnnouncements = ([,thread]) => {
    return thread.isannouncement == true;
  }
  let noAnnouncements = ([,thread]) => {
    return thread.isannouncement == false;
  }
  let sortIDAsc = ( [thread1ID,], [thread2ID,] ) => {
    return thread1ID - thread2ID;
  }
  let sortIDDesc = ( [thread1ID,], [thread2ID,] ) => {
    return -(thread1ID - thread2ID);
  }
  let display = ( [threadID, thread] ) => {
    return (
      <Card.Body onClick={e => setCurrentlyFocusedThreadID(threadID)} className={`overviewEntry ${answered(thread)} ${currentlySelected(threadID)}`}>
        <CommitteeThreadOverview threadID={threadID} thread={thread} />
      </Card.Body>
    )
  }

  return (
    <Container fluid>
      <Row>
        <Col md={3}>
          <Card className="overviewGroup">
            <Card.Header>
              <h5 class="m-0" className="inline">Announcements</h5>
              <Button id="newQuestion" onClick={e => {setCurrentlyFocusedThreadID('NewQuestion')}}>New Announcement</Button>
            </Card.Header>
            {
              Object.entries(clarificationData.threads).filter(onlyAnnouncements).sort(sortIDAsc).map(display)
            }
          </Card>
          <br/>
          <Card className="overviewGroup">
            <Card.Header>
              <h5 class="m-0" className="inline">Unresolved</h5>
            </Card.Header>
            {
              Object.entries(clarificationData.threads).filter(noAnnouncements).filter(onlyUnanswered).sort(sortIDAsc).map(display)
            }
          </Card>
          <br/>
          <Card className="overviewGroup">
            <Card.Header>
              <h5 class="m-0" className="inline">Answered</h5>
              
            </Card.Header>
            {
              Object.entries(clarificationData.threads).filter(noAnnouncements).filter(onlyAnswered).sort(sortIDDesc).map(display)
            }
          </Card>
        </Col>
        <Col md={9}>
          {displayCurrentlyFocusedThread()}
        </Col>
      </Row>
      
    </Container>
  );
}
