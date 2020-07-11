import Button from 'react-bootstrap/Button'

import React from 'react';

import { useDispatch } from 'react-redux';
import { doLogout as userLogout } from '../../model/userSlice';
import { doLogout as dataLogout } from '../../model/clarificationDataSlice';
import Cookies from 'js-cookie'

export function Logout() {
  const dispatch = useDispatch();

  const handleLogout = (event) => {
    dispatch(userLogout())
    dispatch(dataLogout())
    Cookies.remove('auth');
  }

  return (
    <Button variant="danger" onClick={handleLogout}>
      <i className="fas fa-sign-in-alt"></i>
      Logout
    </Button>
  );
}
