import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const newThread = (answered, subject) => {
  return {
    answered: '',
    subject: '',
    title: '',
    messages: {}
  }
}

export const newMessage = () => {
  return {
    content: '',
    author: '',
    timestamp: null
  }
}

const max = (a, b) => {
  return a > b ? a : b;
}

export const clarificationDataSlice = createSlice({
  name: 'clarificationData',
  initialState: {
    threads: {},
    currentUpdateTimestamp: 0
  },
  reducers: {
    onMessage: (state, action) => {
      // let threadID = action.payload.threadID;
      // if (! (threadID in state.threads)) {
      //   state.threads[threadID] = newThread();
      // }
      // let currentThread = state.threads[threadID];
      // currentThread.answered = action.payload.answered;
      // currentThread.subject = action.payload.subject;
      // currentThread.title = action.payload.title;
      
      // let payloadMessage = action.payload.message;
      // if (! (payloadMessage.ID in currentThread.messages)) {
      //   currentThread.messages[payloadMessage.ID] = newMessage();
      // }
      // let currentMessage = currentThread.messages[payloadMessage.ID]
      // currentMessage.content = payloadMessage.content;
      // currentMessage.author = payloadMessage.author;
      // currentMessage.timestamp = payloadMessage.timestamp;
      let threadID = action.payload.id;
      state.threads[threadID] = action.payload;
    },
    updateTimestamp: (state, action) => {
      state.currentUpdateTimestamp = action.payload;
    },
    logout: (state, action) => {
      state.threads = {};
      state.currentUpdateTimestamp = 0;
    }
  },
});

export const { onMessage, updateTimestamp, logout } = clarificationDataSlice.actions;

export const checkForUpdates = (auth, currentUpdateTimestamp, success, failure) => dispatch => {
  axios.post(`/update`, {
    username: auth.username,
    token: auth.token,
    currentUpdateTimestamp: currentUpdateTimestamp
  }).then(resp => {
    dispatch(receiveNewMessage(resp.data.threads))
    dispatch(updateTimestamp(resp.data.updated))
  }).then(() => success())
    .catch(err => {
      failure(err)
    })
}

export const receiveNewMessage = (threads) => dispatch => {
  threads.forEach((thread) => {
    dispatch(onMessage(thread))
  })
}

export const startNewThread = (auth, message, success, failure) => {
  axios.post(`/thread`, {
    username: auth.username,
    token: auth.token,
    subject: message.subject,
    content: message.content
  }).then(resp => {
    success()
  }).catch(err => {
    failure(err)
  })
}

export const replyToThread = (auth, message) => {
  return axios.post(`/thread/${message.threadID}`, {
    username: auth.username,
    token: auth.token,
    content: message.content,
    isExternal: message.isExternal
  })
}

export const doLogout = () => dispatch => {
  dispatch(logout());
  // return new Promise( (resolve) => {
  //   dispatch(logout());
  //   resolve();
  // })
}

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectClarificationData = state => state.clarificationData;

export default clarificationDataSlice.reducer;
