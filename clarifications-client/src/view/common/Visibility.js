import Pagination from 'react-bootstrap/Pagination';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Table from 'react-bootstrap/Table'
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button'

import { grantGroup } from "../../model/clarificationDataSlice";

import React, { useState, useEffect } from 'react';

import { useDispatch } from 'react-redux';

export function Visibility(props) {
  const thread = props.thread;
  const threadID = props.threadID;
  const availableGroups = props.availableGroups;

  let [grantableGroups, setGrantableGroups] = useState([]);
  let [selectedGroup, setSelectedGroup] = useState(availableGroups[0] || '');
  let [grantStatus, setGrantStatus] = useState('warning');
  const dispatch = useDispatch();

  useEffect(() => {
    setGrantableGroups(availableGroups.filter(grp => thread.visibility.indexOf(grp) == -1));
    setSelectedGroup(availableGroups.filter(grp => thread.visibility.indexOf(grp) == -1)[0] || '');
  }, [thread])

  const grantAccess = (threadID, groupname) => {
    return new Promise( (resolve, reject) => {
      dispatch(grantGroup(threadID, groupname, resolve, reject))
    })
  }

  const handleAddGroup = (e) => {
    e.preventDefault();
    console.log(selectedGroup);
    if (selectedGroup === '') return;
    grantAccess(threadID, selectedGroup)
    .then(setSelectedGroup(availableGroups[0]))
    .catch(err => {
      setGrantStatus('danger');
      setTimeout(() => {
        setGrantStatus('warning');
      }, 2000)
    })
  }

  return (
    <Form inline onSubmit={handleAddGroup}>
      Visibility:&nbsp;
      {thread.visibility.map(groupname => <Badge style={{ marginRight: '3px' }} variant="primary">{groupname}</Badge>)}
      <InputGroup>
        <Form.Control as="select" custom value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
          {grantableGroups.map(group => <option>{group}</option>)}
        </Form.Control>
        <InputGroup.Append>
          <Button variant={grantStatus} type="submit" disabled={selectedGroup === ''}>Add</Button>
        </InputGroup.Append>
      </InputGroup>
    </Form>
  )
}