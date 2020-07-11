import { createSlice } from '@reduxjs/toolkit';
import { fetchGroups, grantAccessToThread, fetchUpdatesSince, postReplyToThread } from './actions';
export const clarificationDataSlice = createSlice({
  name: 'clarificationData',
  initialState: {
    threads: {},
    shouldUpdate: false,
    currentUpdateTimestamp: 0,
    availableGroups: []
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
        state.threads[threadID] = thread;
        state.threads[threadID].seen = false;
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
    },
    updateRequired: (state, action) => {
      state.shouldUpdate = true;
    },
    updateSuccess: (state, action) => {
      state.shouldUpdate = false;
    },
    updateAvailableGroups: (state, action) => {
      state.availableGroups = action.payload;
    }
  },
});

export const { onMessage, onMessages, updateTimestamp, updateSeen, logout, updateRequired, updateSuccess, updateAvailableGroups } = clarificationDataSlice.actions;

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
    dispatch(updateSuccess())
  })
}


export const replyToThread = (message, resolve, reject) => (dispatch) => {
  return postReplyToThread(message).then(success => {
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
