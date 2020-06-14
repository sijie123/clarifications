import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import { ContestantThreadOverview, ContestantThreadDetails, ContestantAnnouncementDetails } from './ContestantThread'
import { DetailsWrapper } from "../common/DetailsWrapper";
import { NothingSelectedThread } from "../common/NothingSelectedThread"
import { NewThread } from '../common/NewThread'

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectClarificationData } from '../../model/clarificationDataSlice';
import '../common/Common.css';

const THREAD_OPEN = 'Awaiting Answer';

export function Contestant(props) {

  const dispatch = useDispatch();
  const searchFilter = props.searchFilter;
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
    else if (currentlyFocusedThreadID === 'NewQuestion') return <NewThread isAnnouncement={false} subjectOptions={["General", "Mountaineering", "Space Exploration", "Corona Beer"]} />;
    let thread = clarificationData.threads[currentlyFocusedThreadID]
    return (
      <DetailsWrapper thread={thread} threadID={currentlyFocusedThreadID}>
          <Card.Body className={`${answered(thread)}`}><ContestantThreadOverview threadID={currentlyFocusedThreadID} thread={thread} /></Card.Body>
          {
            thread.isannouncement ? 
              <ContestantAnnouncementDetails threadID={currentlyFocusedThreadID} thread={thread} /> : 
              <ContestantThreadDetails threadID={currentlyFocusedThreadID} thread={thread} setCurrentlyFocusedThreadID={setCurrentlyFocusedThreadID} />
          }
      </DetailsWrapper>
    ); 
  }

  let onlyAnnouncements = ([,thread]) => {
    return thread.isannouncement == true;
  }
  let noAnnouncements = ([,thread]) => {
    return thread.isannouncement == false;
  }
  let onlyAnswered = ([,thread]) => {
    return thread.answer !== THREAD_OPEN;
  }
  let onlyUnanswered = ([,thread]) => {
    return thread.answer === THREAD_OPEN;
  }
  let sortIDDesc = ( [thread1ID,], [thread2ID,] ) => {
    return -(thread1ID - thread2ID);
  }
  let display = ( [threadID, thread], posn ) => {
    return (
      <Card.Body onClick={e => setCurrentlyFocusedThreadID(threadID)} className={`overviewEntry ${answered(thread)} ${currentlySelected(threadID)}`}>
        <ContestantThreadOverview threadID={threadID} thread={thread} />
      </Card.Body>
    )
  }

  return (
    <Container fluid className={'flexVertical flexElement'}>
      <Row style={{flexFlow:'row', minHeight: '100%'}}>
        <Col md={5} style={{flex: '1 1 auto', overflow: 'auto'}}>
          <Card className="overviewGroup">
            <Card.Header>
              <h5 className="m-0 inline">Announcements</h5>
            </Card.Header>
            {
              Object.entries(clarificationData.threads).filter(searchFilter).filter(onlyAnnouncements).sort(sortIDDesc).map(display)
            }
          </Card>
          <br />
          <Card className="overviewGroup">
            <Card.Header>
              <h5 className="m-0 inline">Questions</h5>
              <Button id="newQuestion" onClick={e => {setCurrentlyFocusedThreadID('NewQuestion')}}>New Question</Button>
            </Card.Header>
            {
              Object.entries(clarificationData.threads).filter(searchFilter).filter(noAnnouncements).filter(onlyAnswered).sort(sortIDDesc).map(display)
            }
            {
              Object.entries(clarificationData.threads).filter(searchFilter).filter(noAnnouncements).filter(onlyUnanswered).sort(sortIDDesc).map(display)
            }
          </Card>
          <br/>
        </Col>
        <Col md={7} style={{flex: '1 1 auto', overflow: 'auto'}}>
          {displayCurrentlyFocusedThread()}
        </Col>
      </Row>
      
    </Container>
  );
}
