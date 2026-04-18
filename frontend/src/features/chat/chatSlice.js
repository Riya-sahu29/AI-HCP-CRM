import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const sendChatMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ message, history }, { rejectWithValue }) => {
    try {
      const res = await API.post('/chat/', {
        message,
        conversation_history: history,
      });
      const data = res.data;
      let reply = '';
      if (typeof data === 'string') {
        reply = data;
      } else if (typeof data.response === 'string') {
        reply = data.response;
      } else if (typeof data.response === 'object') {
        reply = data.response?.reply || data.response?.content || JSON.stringify(data.response);
      } else {
        reply = JSON.stringify(data);
      }
      return reply;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail || err.message || 'AI error'
      );
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    loading:  false,
    error:    null,
  },
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({ role: 'user', content: String(action.payload) });
    },
    clearChat: (state) => {
      state.messages = [];
      state.error    = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push({
          role:    'assistant',
          content: String(action.payload || ''),
        });
      })
      .addCase(sendChatMessage.rejected,  (state, action) => {
        state.loading = false;
        state.error   = String(action.payload || 'Something went wrong');
      });
  },
});

export const { addUserMessage, clearChat } = chatSlice.actions;
export default chatSlice.reducer;