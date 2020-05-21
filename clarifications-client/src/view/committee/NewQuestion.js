import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

import React, {useState} from 'react';

export function NewQuestion(props) {

  let subjectOptions = props.subjectOptions;
  let submitNewQuestion = props.action;

  const [clarificationText, setClarificationText] = useState('');
  const [clarificationSubject, setClarificationSubject] = useState(subjectOptions[0]);
  const [clarificationStatus, setClarificationStatus] = useState('primary');
  const [clarificationError, setClarificationError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    submitNewQuestion(clarificationSubject, clarificationText, () => {
      setClarificationText('');
      setClarificationSubject('');
      setClarificationStatus('success');
      setClarificationError('');
      setTimeout(() => {
        setClarificationStatus('primary');
      }, 2000)
    }, (err) => {
      setClarificationStatus('danger');
      setClarificationError(`${err.message}`);
      setTimeout(() => {
        setClarificationStatus('primary');
      }, 2000)
    });
  }
  
  return (
    <Card.Body className="bg-light">
      <h4>New Question</h4>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="newQuestionSubject">
          <Form.Label>Category</Form.Label>
          <Form.Control as="select" custom value={clarificationSubject} onChange={e => setClarificationSubject(e.target.value)}>
            {
              subjectOptions.map(opt => {
                return <option>{opt}</option>;
              })
            }
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="exampleForm.ControlTextarea1">
          <Form.Label>Clarification</Form.Label>
          <Form.Control as="textarea" rows="3" value={clarificationText} onChange={e => setClarificationText(e.target.value)} />
        </Form.Group>
        { clarificationError !== "" ? <p style={{color: 'red'}}>An error has occurred: {clarificationError}. Please seek assistance from your invigilator.</p> : "" }
        <Button variant={clarificationStatus} type="submit" block disabled={clarificationStatus === 'success' ? 'disabled' : ''}>{clarificationStatus === 'success' ? 'Success' : 'Post New Question'}</Button>
      </Form>
    </Card.Body>
  )
}