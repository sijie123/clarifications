import { combineReducers, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import userReducer from './userSlice';
import clarificationDataReducer from './clarificationDataSlice';

const reducers = combineReducers({
  user: userReducer,
  clarificationData: clarificationDataReducer,
})

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  migrate: (state) => {
    console.log('Begin Migration')
    console.log(state);
    if (state._persist.version !== 1) {
      console.log("New version detected. Migrating.");
      return Promise.resolve({})
    } else {
      return Promise.resolve(state)
    }
  }
}

const persistedReducer = persistReducer(persistConfig, reducers)

export default configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
});
