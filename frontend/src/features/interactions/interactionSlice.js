import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchInteractions = createAsyncThunk(
  'interactions/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/interactions/');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || err.message || 'Failed to fetch');
    }
  }
);

export const createInteraction = createAsyncThunk(
  'interactions/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await API.post('/interactions/', data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || err.message || 'Failed to create');
    }
  }
);

export const updateInteraction = createAsyncThunk(
  'interactions/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/interactions/${id}/`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || err.message || 'Failed to update');
    }
  }
);

export const deleteInteraction = createAsyncThunk(
  'interactions/delete',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/interactions/${id}/`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || err.message || 'Failed to delete');
    }
  }
);

const interactionSlice = createSlice({
  name: 'interactions',
  initialState: {
    list:    [],
    loading: false,
    error:   null,
    success: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.error   = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInteractions.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchInteractions.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchInteractions.rejected,  (state, action) => { state.loading = false; state.error = String(action.payload); })

      .addCase(createInteraction.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(createInteraction.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
        state.success = 'Interaction logged successfully!';
      })
      .addCase(createInteraction.rejected,  (state, action) => { state.loading = false; state.error = String(action.payload); })

      .addCase(updateInteraction.pending,   (state) => { state.loading = true; })
      .addCase(updateInteraction.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.list.findIndex(i => i.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
        state.success = 'Interaction updated!';
      })
      .addCase(updateInteraction.rejected,  (state, action) => { state.loading = false; state.error = String(action.payload); })

      .addCase(deleteInteraction.fulfilled, (state, action) => {
        state.list    = state.list.filter(i => i.id !== action.payload);
        state.success = 'Deleted!';
      });
  },
});

export const { clearMessages } = interactionSlice.actions;
export default interactionSlice.reducer;