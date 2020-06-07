import Card from 'react-bootstrap/Card';

import React, {useState} from 'react';

export function Message(props) {
  let msg = props.msg;
  let sender = msg.sender
  if (msg.sender !== msg.creator)
    sender = `${msg.sender} (sent by ${msg.creator})`
  return (
    <div className="messageFragment">
      <Card.Text className="message">{msg.contenttype === 'text' ? msg.content : <img style={{width: '300px'}} src={msg.content} />}</Card.Text>
      <Card.Text className="message timeDateInfo">{sender} ({msg.updated})</Card.Text>
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