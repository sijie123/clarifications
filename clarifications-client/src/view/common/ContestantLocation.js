import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import axios from 'axios'

import { selectUser } from "../../model/userSlice";

import React, { useState, useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';

export function ContestantLocation(props) {
  const contestantUser = props.contestant;

  const user = useSelector(selectUser);
  const [seatName, setSeatName] = useState('Loading seat...');
  const [seatDescription, setSeatDescription] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const SEARCH_URI = `/seat/${contestantUser}`
    axios.post(SEARCH_URI, {
      username: user.username,
      token: user.token,
    }).then( ({data}) => {
      setSeatName(data.seatname);
      setSeatDescription(data.locationtext);
    }).catch(err => {
      setSeatName("Unavailable");
      setSeatDescription(err.response.data.msg);
    });
  }, [contestantUser])

  const handleShow = () => {
    setShow(true)
    setImageURL(`/seat/map/${seatName}`);
  }

  const handleClose = () => {
    setShow(false)
  }
  return (
    <>
    <a href='#' variant="primary" onClick={handleShow}>
        {seatName}
    </a>

    <Modal show={show} onHide={handleClose} size="lg">
    <Modal.Header closeButton>
      <Modal.Title>{contestantUser}: {seatName}</Modal.Title>
    </Modal.Header>
    <Modal.Body><img style={{width: '100%'}} src={imageURL}></img><p>{seatDescription}</p></Modal.Body>
    </Modal>
    </>
  )
}