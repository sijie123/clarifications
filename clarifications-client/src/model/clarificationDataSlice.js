import { createSlice } from '@reduxjs/toolkit';
import { fetchGroups, fetchTasks, grantAccessToThread, fetchUpdatesSince, postReplyToThread } from './actions';
import {cloneDeep} from 'lodash';
const isEqual = require("fast-deep-equal/es6");


export const clarificationDataSlice = createSlice({
  name: 'clarificationData',
  initialState: {
    threads: {},
    shouldUpdate: false,
    currentUpdateTimestamp: 0,
    availableGroups: [],
    availableTasks: [],
    shouldMakeBeep: false,
    hasNewNotification: false,
  },
  reducers: {
    onMessage: (state, action) => {
      // Update a single message
      let threadID = action.payload.id;
      state.threads[threadID] = action.payload;
      state.threads[threadID].seen = false;
    },
    onMessages: (state, action) => {
      // Update multiple threads. This is much more efficient
      // as compared to calling onMessage many times, so use
      // this whenever possible.
      let threads = action.payload;
      threads.forEach(thread => {
        let threadID = thread.id;
        let current = cloneDeep(state.threads[threadID])
        thread.messages.sort((a, b) => {
          return a.ID - b.ID;
        });
        if (current && 'seen' in current) delete current['seen']
        if (!isEqual(current, thread)) {
          state.threads[threadID] = thread;
          state.threads[threadID].seen = false;
          state.hasNewNotification = true;
          state.shouldMakeBeep = true;
        }
      })
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
      state.shouldUpdate = false;
      state.availableGroups = [];
      state.availableTasks = [];
      state.shouldMakeBeep = false;
      state.hasNewNotification = false;
    },
    updateRequired: (state, action) => {
      state.shouldUpdate = true;
    },
    updateDone: (state, action) => {
      state.shouldUpdate = false;
    },
    updateAvailableGroups: (state, action) => {
      state.availableGroups = action.payload;
    },
    updateAvailableTasks: (state, action) => {
      state.availableTasks = action.payload;
    },
    shouldNotMakeBeep: (state, action) => {
      state.shouldMakeBeep = false;
    },
    shouldDismissTitle: (state, action) => {
      state.hasNewNotification = false;
    }
  },
});

export const { onMessage, onMessages, updateTimestamp, updateSeen, logout, updateRequired, updateDone, updateAvailableGroups, updateAvailableTasks, shouldNotMakeBeep, shouldDismissTitle } = clarificationDataSlice.actions;

export const listTasks = () => (dispatch) => {
  return fetchTasks().then(res => {
    dispatch(updateAvailableTasks(res.data.tasks))
  }).catch(err => {
    console.log(err);
  })
}

export const listGroups = () => (dispatch) => {
  return fetchGroups().then(res => {
    dispatch(updateAvailableGroups(res.data.groups))
  }).catch(err => {
    console.log(err);
  })
}

export const grantGroup = (threadID, groupname, resolve, reject) => (dispatch, getState) => {
  return grantAccessToThread(threadID, groupname)
    .then(success => {
      dispatch(requestUpdate());
    })
    .then(() => resolve())
    .catch(err => {
      console.log(err);
      reject(err);
    })
}

export const requestUpdate = () => dispatch => {
  dispatch(updateRequired());
}

export const checkForUpdates = () => (dispatch, getState) => {
  let state = getState();
  return fetchUpdatesSince(state.clarificationData.currentUpdateTimestamp).then(resp => {
    dispatch(onMessages(resp.data.threads))
    dispatch(updateTimestamp(resp.data.updated))
    dispatch(updateDone())
  }).catch(err => {
    //Even if there's an error, we will still update done to enable future updates
    dispatch(updateDone())
    throw err;
  })
}


export const replyToThread = (message, resolve, reject) => (dispatch) => {
  return postReplyToThread(message).then(success => {
    dispatch(requestUpdate());
  }).then(() => resolve())
    .catch(err => reject(err))
}

export const stopBeeping = () => dispatch => {
  dispatch(shouldNotMakeBeep());
}

export const resetTitle = () => dispatch => {
  dispatch(shouldDismissTitle());
}

export const doLogout = () => dispatch => {
  dispatch(logout());
}

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectClarificationData = state => state.clarificationData;

export default clarificationDataSlice.reducer;
