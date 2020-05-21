import Card from 'react-bootstrap/Card';

import React, {useState} from 'react';

export function Message(props) {
  let msg = props.msg;
  return (
    <div className="messageFragment">
      <Card.Text className="message">{msg.content}</Card.Text>
      <Card.Text className="message timeDateInfo">{msg.author} ({msg.updated})</Card.Text>
    </div>
  )
}

export function Messages(props) {

  let messages = Object.entries(props.messages);
  if (props.filter) messages = messages.filter(props.filter);
  messages = messages.sort(([, msg1], [, msg2]) => {
    return msg1.ID - msg2.ID;
  });

  return (
    messages.map(([, msg]) => {
      return <Message msg={msg} />
    })
  )
}