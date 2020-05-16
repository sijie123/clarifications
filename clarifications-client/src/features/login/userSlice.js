import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    counter: 0,
    isLoggedIn: false,
    username: null,
    token: null
  },
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      state.username = action.payload.username;
      state.token = action.payload.token
    }
  },
});

export const { login, fake } = userSlice.actions;

export const doLogin = (auth, success, failureCallback) => dispatch => {
  console.log("Here2");
  axios.post('/auth', {
    username: auth.username || "sijie",
    password: auth.password || "linsijie"
  }).then(resp => {
    dispatch(login({
      username: resp.data.username,
      token: resp.data.token
    }))
  }).then(() => success()).catch(err => {
    failureCallback(err.response.data)
  })
}

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectUser = state => state.user;

export default userSlice.reducer;
