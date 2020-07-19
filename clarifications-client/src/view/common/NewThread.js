import axios from 'axios'
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import bsCustomFileInput from 'bs-custom-file-input'
import {AsyncTypeahead} from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
// import 'react-bootstrap-typeahead/css/Typeahead-bs4.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileAlt, faLaptop, faMugHot, faRestroom } from '@fortawesome/free-solid-svg-icons'

import React, {useState, useEffect, useCallback, createRef} from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { requestUpdate } from '../../model/clarificationDataSlice';
import { selectUser } from '../../model/userSlice';
import { newThread, fetchUsers } from '../../model/actions';

export function FindContestant(props) {
  const setContestantFor = props.setContestantFor;
  const user = useSelector(selectUser);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState([]);

  const handleSearch = (query) => {
    setIsLoading(true);
    fetchUsers(query).then(usernames => {
      let options = usernames.data.users;
      setOptions(options);
      setIsLoading(false);
    });
  };

  return (
    <Form.Group controlId="forContestant">
      <Form.Label>Submitting for:</Form.Label>
      <AsyncTypeahead
        id="async-example"
        isLoading={isLoading}
        labelKey="username"
        onSearch={handleSearch}
        onChange={setContestantFor}
        options={options}
        placeholder="Search for a contestant..."
        renderMenuItemChildren={(option, props) => (
          <div>
            <span>{option.username} ({option.groupname} {option.displayname})</span>
          </div>
        )}
      />
    </Form.Group>
  )
}
export function NewThread(props) {

  let subjectOptions = props.subjectOptions;
  let isAnnouncement = props.isAnnouncement;
  let allowOnBehalf = props.allowOnBehalf || false;
  let threadType = props.isAnnouncement ? "Announcement" : "Question";

  let fileInput = createRef();

  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const [isLogistics, setIsLogistics] = useState(false);
  const [contestantFor, setContestantFor] = useState(null);
  const [threadText, setThreadText] = useState('');
  const [threadSubject, setThreadSubject] = useState("General");
  const [threadStatus, setThreadStatus] = useState('primary');
  const [threadError, setThreadError] = useState('');

  const buildForm = async () => {
    let form = {};
    
    let message = {
      subject: `${threadSubject}${isLogistics ? ' (Ops)' : ''}`,
      content: threadText,
      isAnnouncement: isAnnouncement,
      isLogistics: isLogistics,
    }
    if (allowOnBehalf && contestantFor !== null) {
      if (typeof contestantFor === 'string') message['createdFor'] = contestantFor;
      else message['createdFor'] = contestantFor[0].username;
    }

    let file = fileInput.current.files[0];
    if (file != undefined) {
      let fileType = file.type;
      if (fileType !== "image/jpeg" && fileType !== "image/png") {
        throw new Error("Only jpg/png files are accepted.");
      }
      let base64File = await toBase64(file);
      message['attachment'] = base64File;
      message['attachmentType'] = fileType;
    }

    form['message'] = message;
    return form;
  }

  const submitNewThread = async () => {
    let form = await buildForm();
    return newThread(form).then(success => dispatch(requestUpdate()))
  }
  
  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });


  const setSuccess = () => {
    setThreadText('');
    setThreadSubject("General");
    setThreadStatus('success');
    setThreadError('');
    // fileInput.value = null;
    console.log(fileInput);
    setTimeout(() => {
      setThreadStatus('primary');
    }, 2000)
  }

  const setError = (msg) => {
    setThreadStatus('danger');
    setThreadError(msg);
    setTimeout(() => {
      setThreadStatus('primary');
    }, 2000)
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (threadText.trim() === '') {
      setError("Question field cannot be empty.");
      return;
    }
    if (allowOnBehalf && !isAnnouncement && contestantFor == null) {
      setError("Submitting-for field is invalid. You'll need to click on the autocomplete name to select it.");
      return;
    }
    submitNewThread()
    .then(success => setSuccess())
    .catch(err => setError(`${err.message}`));
  }

  useEffect(() => {
    bsCustomFileInput.init()
  }, [])
  
  return (
    <Card.Body className="bg-light">
      <h4>New {threadType}</h4>
      <Form onSubmit={handleSubmit}>
        {
          !isAnnouncement && 
          <Form.Group controlId="newQuestionLogistics">
          <Form.Label>What do you need help with?</Form.Label>
          <Row>
            <Col md={6}>
            <Button style={{height: '150px', width: '100%'}} variant={isLogistics == false ? 'primary' : 'outline-secondary'} onClick={e => setIsLogistics(false)}>
              <FontAwesomeIcon icon={faFileAlt} size="4x"/>
              <br/>
              <br/>
              I have a question on the problem set.
            </Button>
            </Col>
            <Col md={6}>
            <Button style={{height: '150px', width: '100%'}} variant={isLogistics == true ? 'primary' : 'outline-secondary'} onClick={e => setIsLogistics(true)}>
              <Row>
                <Col style={{borderRight: '1px solid grey'}}>
                <FontAwesomeIcon icon={faLaptop} size="4x"/>
                </Col>
                <Col style={{borderRight: '1px solid grey'}}>
                <FontAwesomeIcon icon={faMugHot} size="4x"/>
                </Col>
                <Col>
                <FontAwesomeIcon icon={faRestroom} size="4x"/>
                </Col>
              </Row>
              <br />
              I need help on something else.</Button>
            </Col>
          </Row>
          </Form.Group>
        }
        {
          allowOnBehalf && <FindContestant setContestantFor={setContestantFor}/>
        }
        <Form.Group controlId="newQuestionSubject">
          {
            !isLogistics && 
            <>
            <Form.Label>Category</Form.Label>
            <Form.Control as="select" custom value={threadSubject} onChange={e => setThreadSubject(e.target.value)}>
              {
                !isLogistics && subjectOptions.map(opt => {
                  return <option>{opt}</option>;
                })
              }
            </Form.Control>
            </>
          }
        </Form.Group>
        <Form.Group controlId="exampleForm.ControlTextarea1">
          <Form.Label>{threadType}</Form.Label>
          <Form.Control as="textarea" rows="3" value={threadText} onChange={e => setThreadText(e.target.value)} />
        </Form.Group>
        <Form.Group controlId="newFileUpload">
          <Form.Label>Attach Image (optional, png/jpg only)</Form.Label>
          <Form.File 
            id="custom-file"
            label="Select file"
            ref={fileInput}
            custom
          />
        </Form.Group>
        { threadError !== "" ? <p style={{color: 'red'}}>{threadError}</p> : "" }
        <Button variant={threadStatus} type="submit" block disabled={threadStatus === 'success' ? 'disabled' : ''}>{threadStatus === 'success' ? 'Success' : `Post New ${threadType}`}</Button>
      </Form>
    </Card.Body>
  )
}