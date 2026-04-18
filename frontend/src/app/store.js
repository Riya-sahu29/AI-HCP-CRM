
import { configureStore } from '@reduxjs/toolkit';
import interactionReducer from '../features/interactions/interactionSlice';
import chatReducer        from '../features/chat/chatSlice';

export const store = configureStore({
  reducer: {
    interactions: interactionReducer,
    chat:         chatReducer,
  },
});

export default store;