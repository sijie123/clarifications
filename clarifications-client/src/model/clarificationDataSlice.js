import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const clarificationDataSlice = createSlice({
  name: 'clarificationData',
  initialState: {
    threads: {},
    shouldUpdate: false,
    currentUpdateTimestamp: 0
  },
  reducers: {
    onMessage: (state, action) => {
      let threadID = action.payload.id;
      state.threads[threadID] = action.payload;
      state.threads[threadID].seen = false;
    },
    updateTimestamp: (state, action) => {
      state.currentUpdateTimestamp = action.payload;
    },
    updateSeen: (state, action) => {
      state.threads[action.payload].seen = true;
    },
    logout: (state, action) => {
      state.threads = {};
      state.currentUpdateTimestamp = 0;
    },
    updateRequired: (state, action) => {
      state.shouldUpdate = true;
    },
    updateSuccess: (state, action) => {
      state.shouldUpdate = false;
    }
  },
});

export const { onMessage, updateTimestamp, updateSeen, logout, updateRequired, updateSuccess } = clarificationDataSlice.actions;

export const requestUpdate = () => dispatch => {
  console.log("Update requested")
  dispatch(updateRequired());
}

export const checkForUpdates = () => (dispatch, getState) => {
  let state = getState();
  return axios.post(`/update`, {
    username: state.user.username,
    token: state.user.token,
    currentUpdateTimestamp: state.clarificationData.currentUpdateTimestamp
  }).then(resp => {
    dispatch(receiveNewMessage(resp.data.threads))
    dispatch(updateTimestamp(resp.data.updated))
    dispatch(updateSuccess())
  })
}

export const receiveNewMessage = (threads) => dispatch => {
  threads.forEach((thread) => {
    dispatch(onMessage(thread))
  })
}

export const replyToThread = (message, resolve, reject) => (dispatch, getState) => {
  let state = getState();
  return axios.post(`/thread/${message.threadID}`, {
    username: state.user.username,
    token: state.user.token,
    content: message.content,
    isExternal: message.isExternal
  }).then(success => {
    dispatch(requestUpdate());
  }).then(() => resolve())
    .catch(err => reject(err))
}

export const doLogout = () => dispatch => {
  dispatch(logout());
}

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectClarificationData = state => state.clarificationData;

export default clarificationDataSlice.reducer;
