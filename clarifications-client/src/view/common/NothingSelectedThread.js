import Card from 'react-bootstrap/Card';
import React from 'react';

export function NothingSelectedThread() {
  return (
    <Card style={{ height: '600px' }}>
      <Card.Body className={'center'}>Select a question on the left to view details.</Card.Body>
    </Card>
  )
}