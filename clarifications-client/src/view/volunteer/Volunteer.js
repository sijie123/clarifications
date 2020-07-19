import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import { VolunteerThreadOverview, VolunteerThreadDetails, VolunteerAnnouncementDetails } from './VolunteerThread'
import { DetailsWrapper } from "../common/DetailsWrapper";
import { NothingSelectedThread } from "../common/NothingSelectedThread"
import { NewThread } from '../common/NewThread'

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectClarificationData, listGroups } from '../../model/clarificationDataSlice';
import '../common/Common.css'
import './Volunteer.css';

const THREAD_OPEN = 'Awaiting Answer';

export function Volunteer(props) {

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
    if (currentlyFocusedThreadID == null) return '';
    else if (currentlyFocusedThreadID === 'NewQuestion') {
      return (
        <Overlay setCurrentlyFocusedThreadID={setCurrentlyFocusedThreadID}>
          <NewThread isAnnouncement={false} allowOnBehalf={true} />
        </Overlay>
      )
    }
    let thread = clarificationData.threads[currentlyFocusedThreadID]
    return (
      <Overlay setCurrentlyFocusedThreadID={setCurrentlyFocusedThreadID}>
        <DetailsWrapper thread={thread} threadID={currentlyFocusedThreadID}>
            <Card.Body className={`${answered(thread)}`}><VolunteerThreadOverview threadID={currentlyFocusedThreadID} thread={thread} /></Card.Body>
            {
              thread.isannouncement ? 
                <VolunteerAnnouncementDetails threadID={currentlyFocusedThreadID} thread={thread} /> : 
                <VolunteerThreadDetails threadID={currentlyFocusedThreadID} thread={thread} availableGroups={clarificationData.availableGroups} setCurrentlyFocusedThreadID={setCurrentlyFocusedThreadID} />
            }
        </DetailsWrapper>
      </Overlay>
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
        <VolunteerThreadOverview threadID={threadID} thread={thread} />
      </Card.Body>
    )
  }

  return (
    <Container>
      <Row>
        <Col md={12}>
          <Card className="overviewGroup">
            <Button id="newQuestion" onClick={e => {setCurrentlyFocusedThreadID('NewQuestion')}}>Post Question / Create Log</Button> 
          </Card>
          <br/>
          <Card className="overviewGroup">
            <Card.Header>
              <h5 class="m-0" className="inline">Awaiting Response</h5>
            </Card.Header>
            {
              Object.entries(clarificationData.threads).filter(searchFilter).filter(noAnnouncements).filter(onlyUnanswered).sort(sortIDAsc).map(display)
            }
          </Card>
          <br/>
          <Card className="overviewGroup">
            <Card.Header>
              <h5 class="m-0" className="inline">Answered</h5>
            </Card.Header>
            {
              Object.entries(clarificationData.threads).filter(searchFilter).filter(noAnnouncements).filter(onlyAnswered).sort(sortIDDesc).map(display)
            }
          </Card>
          <br/>
          <Card className="overviewGroup">
            <Card.Header>
              <h5 class="m-0" className="inline">Announcements</h5>
              <br />
              <span className={'extraInfoText'}>Messages from the committee to all contestants / FYI only.</span>
              {/* <Button id="newQuestion" onClick={e => {setCurrentlyFocusedThreadID('NewQuestion')}}>New Announcement</Button> */}
            </Card.Header>
            {
              Object.entries(clarificationData.threads).filter(searchFilter).filter(onlyAnnouncements).sort(sortIDAsc).map(display)
            }
          </Card>
          <br/>
        </Col>
      </Row>
      {displayCurrentlyFocusedThread()}
    </Container>
    
  );
}

export function Overlay(props) {

  const setCurrentlyFocusedThreadID = props.setCurrentlyFocusedThreadID;
  const [left, setLeft] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [originalX, setOriginalX] = useState(0);
  const [startTime, setStartTime] = useState(0);
  
  const handleClick = fn => (e) => {
    fn(e.clientX);
  }
  const handleTouch = fn => (e) => {
    if (e.touches.length >= 2) return; // Don't support multi-touch / pinch.
    fn(e.touches[0].clientX);
  }
  const handleStart = (x) => {
    setOriginalX(x);
    setStartTime(new Date());
    setIsMoving(true);
  }

  const handleMove = (x) => {
    if (!isMoving) return;
    setLeft(x - originalX);
  }

  const handleEnd = (_) => {
    setIsMoving(false);
    let timenow = new Date();
    let timeDifference = (timenow.getTime() - startTime.getTime()) / 1000;
    let velocity = left / timeDifference;
    if (left > window.screen.width / 2 || velocity > 200) {
      setLeft(1000);
      setTimeout(() => setCurrentlyFocusedThreadID(null), 100);
    } else {
      setLeft(0);
    }
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    }
  }, [])
  

  return (
    <div className={'overlay'} 
      onTouchStart={handleTouch(handleStart)} onMouseDown={handleClick(handleStart)}
      onTouchMove={handleTouch(handleMove)} onMouseMove={handleClick(handleMove)}
      onTouchEnd={handleEnd} onMouseUp={handleEnd} style={{transform: `translate3d(${left}px, 0px, 0px)`, opacity: 1 - 0.3 * left / window.screen.width}}>

      {props.children}
    </div>
  )
}