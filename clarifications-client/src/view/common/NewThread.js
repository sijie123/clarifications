import axios from 'axios'
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

import React, {useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { requestUpdate } from '../../model/clarificationDataSlice';
import { selectUser } from '../../model/userSlice';

export function NewThread(props) {

  let subjectOptions = props.subjectOptions;
  let isAnnouncement = props.isAnnouncement;
  let threadType = props.isAnnouncement ? "Announcement" : "Question";

  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const [threadText, setThreadText] = useState('');
  const [threadSubject, setThreadSubject] = useState(subjectOptions[0]);
  const [threadStatus, setThreadStatus] = useState('primary');
  const [threadError, setThreadError] = useState('');

  const submitNewThread = () => {
    return axios.post(`/thread`, {
      username: user.username,
      token: user.token,
      message: {
        subject: threadSubject,
        content: threadText,
        isAnnouncement: isAnnouncement
      }
    }).then(success => dispatch(requestUpdate()))
  }
  
  const handleSubmit = (event) => {
    event.preventDefault();
    submitNewThread()
    .then(success => {
      setThreadText('');
      setThreadSubject('');
      setThreadStatus('success');
      setThreadError('');
      setTimeout(() => {
        setThreadStatus('primary');
      }, 2000)
    }).catch(err => {
      setThreadStatus('danger');
      setThreadError(`${err.message}`);
      setTimeout(() => {
        setThreadStatus('primary');
      }, 2000)
    });
  }
  
  return (
    <Card.Body className="bg-light">
      <h4>New {threadType}</h4>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="newQuestionSubject">
          <Form.Label>Category</Form.Label>
          <Form.Control as="select" custom value={threadSubject} onChange={e => setThreadSubject(e.target.value)}>
            {
              subjectOptions.map(opt => {
                return <option>{opt}</option>;
              })
            }
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="exampleForm.ControlTextarea1">
          <Form.Label>{threadType}</Form.Label>
          <Form.Control as="textarea" rows="3" value={threadText} onChange={e => setThreadText(e.target.value)} />
        </Form.Group>
        { threadError !== "" ? <p style={{color: 'red'}}>An error has occurred: {threadError}.</p> : "" }
        <Button variant={threadStatus} type="submit" block disabled={threadStatus === 'success' ? 'disabled' : ''}>{threadStatus === 'success' ? 'Success' : `Post New ${threadType}`}</Button>
      </Form>
    </Card.Body>
  )
}