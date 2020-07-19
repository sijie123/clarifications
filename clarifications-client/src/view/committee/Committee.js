import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import { CommitteeThreadOverview, CommitteeThreadDetails, CommitteeAnnouncementDetails } from './CommitteeThread'
import { DetailsWrapper } from "../common/DetailsWrapper";
import { NothingSelectedThread } from "../common/NothingSelectedThread"
import { NewThread } from '../common/NewThread'
import { Alert } from '../common/Alert'
import { OverviewPagination } from '../common/OverviewPagination';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { listGroups, selectClarificationData } from '../../model/clarificationDataSlice';
import '../common/Common.css'

const THREAD_OPEN = 'Awaiting Answer';

export function Committee(props) {

  const dispatch = useDispatch();
  const searchFilter = props.searchFilter;
  const clarificationData = useSelector(selectClarificationData);

  let [currentlyFocusedThreadID, setCurrentlyFocusedThreadID] = useState(null);

  useEffect(() => {
    dispatch(listGroups());
  }, []);

  const answered = (thread) => {
    return (thread.answer !== THREAD_OPEN) ? 'answered' : '';
  }

  const currentlySelected = (threadID) => {
    return (currentlyFocusedThreadID == threadID) ? 'bg-selected' : '';
  }

  const displayCurrentlyFocusedThread = () => {
    if (currentlyFocusedThreadID == null) return <NothingSelectedThread />;
    else if (currentlyFocusedThreadID === 'NewAnnouncement') return <NewThread isAnnouncement={true} />;
    else if (currentlyFocusedThreadID === 'NewQuestion') return <NewThread isAnnouncement={false} allowOnBehalf={true} />;
    let thread = clarificationData.threads[currentlyFocusedThreadID]
    return (
      <DetailsWrapper thread={thread} threadID={currentlyFocusedThreadID}>
          <Card.Body className={`${answered(thread)}`}><CommitteeThreadOverview threadID={currentlyFocusedThreadID} thread={thread} short={false}/></Card.Body>
          {
            thread.isannouncement ? 
              <CommitteeAnnouncementDetails threadID={currentlyFocusedThreadID} thread={thread} /> : 
              <CommitteeThreadDetails threadID={currentlyFocusedThreadID} thread={thread} availableGroups={clarificationData.availableGroups} setCurrentlyFocusedThreadID={setCurrentlyFocusedThreadID} />
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
        <CommitteeThreadOverview threadID={threadID} thread={thread} short={true}/>
      </Card.Body>
    )
  }

  return (
    <Container fluid className={'flexVertical flexElement'}>
      <Alert />
      <Row style={{flexFlow:'row', minHeight: '100%'}}>
        <Col md={3} style={{flex: '1 1 auto', overflow: 'auto'}}>
          <Card className="overviewGroup">
            <Card.Header>
              <h5 class="m-0" className="inline">Announcements</h5>
              <Button id="newQuestion" onClick={e => {setCurrentlyFocusedThreadID('NewAnnouncement')}}>New Announcement</Button>
            </Card.Header>
            {
              Object.entries(clarificationData.threads).filter(searchFilter).filter(onlyAnnouncements).sort(sortIDAsc).map(display)
            }
          </Card>
          <br/>
          <Card className="overviewGroup">
            <Card.Header>
              <h5 class="m-0" className="inline">Awaiting Response</h5>
              <Button id="newQuestion" onClick={e => {setCurrentlyFocusedThreadID('NewQuestion')}}>Post Question On Behalf</Button>
            </Card.Header>
            {
              Object.entries(clarificationData.threads).filter(searchFilter).filter(noAnnouncements).filter(onlyUnanswered).sort(sortIDAsc).map(display)
            }
          </Card>
          <br/>
          <OverviewPagination threads={Object.entries(clarificationData.threads).filter(searchFilter).filter(noAnnouncements).filter(onlyAnswered).sort(sortIDDesc)} display={display}/>
          <br/>
        </Col>
        <Col md={9} style={{flex: '1 1 auto', overflow: 'auto'}}>
          {displayCurrentlyFocusedThread()}
        </Col>
      </Row>
      
    </Container>
  );
}

