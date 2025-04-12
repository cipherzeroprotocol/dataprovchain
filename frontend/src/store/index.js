import { configureStore } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';

// Import reducers
import datasetReducer from './slices/datasetSlice';
import marketplaceReducer from './slices/marketplaceSlice';
import provenanceReducer from './slices/provenanceSlice';
import attributionReducer from './slices/attributionSlice';
import daoReducer from './slices/daoSlice';
import userReducer from './slices/userSlice';

// Combine all reducers
const rootReducer = combineReducers({
  dataset: datasetReducer,
  marketplace: marketplaceReducer,
  provenance: provenanceReducer,
  attribution: attributionReducer,
  dao: daoReducer,
  user: userReducer,
});

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'], // Only persist user state
  blacklist: [] // Don't persist these reducers
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(thunk, process.env.NODE_ENV === 'development' ? logger : []),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create the persistor
export const persistor = persistStore(store);

// Export the store type


export default store;
