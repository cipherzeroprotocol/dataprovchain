import { combineReducers } from '@reduxjs/toolkit';
import marketplaceReducer from './marketplace.reducer';
import authReducer from './auth.reducer';
import datasetReducer from './dataset.reducer';
import provenanceReducer from './provenance.reducer';
import attributionReducer from './attribution.reducer';
import uiReducer from './ui.reducer';

const rootReducer = combineReducers({
  marketplace: marketplaceReducer,
  auth: authReducer,
  dataset: datasetReducer,
  provenance: provenanceReducer,
  attribution: attributionReducer,
  ui: uiReducer
});

export default rootReducer;