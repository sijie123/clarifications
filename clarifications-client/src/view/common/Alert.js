
import React, {useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {selectClarificationData, stopBeeping, resetTitle} from '../../model/clarificationDataSlice';

export function Alert(props) {
  const dispatch = useDispatch();
  const clarificationData = useSelector(selectClarificationData);

  const alertTone = () => {
    return new Promise( (resolve, _) => {
      var context = new (window.AudioContext || window.webkitAudioContext)();
      let oscillator = context.createOscillator()
      let g = context.createGain()
      oscillator.connect(g)
      g.connect(context.destination)
      oscillator.frequency.value = 1000
      oscillator.start(0)
      
      g.gain.exponentialRampToValueAtTime(0.00001,context.currentTime + 1)
      setTimeout(() => oscillator.stop(), 1000);
      dispatch(stopBeeping())
    });
  }

  useEffect(() => {
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  });

  useEffect(() => {
    if (clarificationData.shouldMakeBeep) alertTone()
    if (clarificationData.hasNewNotification) {
      if (!document.hasFocus()) document.title = "New Notification!";
      else {
        // We are currently focused when the new notif arrived.
        dispatch(resetTitle())
      }
    } else {
      // No new notif.
      document.title = "Clarification System";
    }
  }, [clarificationData])

  const onFocus = () => {
    dispatch(resetTitle())
  }

  return (
    <>
    </>
  )
}