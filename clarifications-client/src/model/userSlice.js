import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    isLoggedIn: false,
    username: null,
    displayname: null,
    groupname: null,
    role: null,
    token: null
  },
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      state.username = action.payload.username;
      state.displayname = action.payload.displayname;
      state.groupname = action.payload.groupname;
      state.role = action.payload.role;
      state.token = action.payload.token;
    },
    logout: (state, _) => {
      state.isLoggedIn = false;
      state.username = null;
      state.role = null;
      state.token = null;
    }
  },
});

export const { login, logout } = userSlice.actions;

export const doLogin = (auth, success, failureCallback) => dispatch => {
  console.log("Here2");
  axios.post('/auth', {
    username: auth.username,
    password: auth.password
  }).then(resp => {
    dispatch(login({
      username: resp.data.username,
      role: resp.data.role,
      displayname: resp.data.displayname,
      groupname: resp.data.groupname,
      token: resp.data.token
    }))
  }).then(() => success()).catch(err => {
    failureCallback(err.response.data)
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
export const selectUser = state => state.user;

export default userSlice.reducer;
