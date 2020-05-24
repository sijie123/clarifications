import Card from 'react-bootstrap/Card';
import './Common.css';

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { updateSeen } from '../../model/clarificationDataSlice'

export function DetailsWrapper(props) {
  const thread = props.thread;
  const threadID = props.threadID;

  const dispatch = useDispatch();

  useEffect(() => {
    if (thread.seen) return;
    dispatch(updateSeen(threadID));
  }, [thread.seen]);

  return (
    <Card>
      {props.children}
    </Card>
  )
}