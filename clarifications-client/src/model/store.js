import { combineReducers, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import userReducer from './userSlice';
import clarificationDataReducer from './clarificationDataSlice';
import { CLARIFICATION_VERSION } from '../version';

const reducers = combineReducers({
  user: userReducer,
  clarificationData: clarificationDataReducer,
})

// const persistConfig = {
//   key: 'root',
//   version: CLARIFICATION_VERSION,
//   storage,
//   migrate: (state) => {
//     console.log('Begin Migration')
//     if (!state._persist || state._persist.version !== CLARIFICATION_VERSION) {
//       console.log("New version detected. Migrating.");
//       return Promise.resolve({})
//     } else {
//       return Promise.resolve(state)
//     }
//   }
// }

// const persistedReducer = persistReducer(persistConfig, reducers)

export default configureStore({
  reducer: reducers,
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
});
