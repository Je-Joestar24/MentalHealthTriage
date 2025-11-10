import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as profileService from '../services/admin/profileService';

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (payload, { rejectWithValue, getState }) => {
    const state = getState();
    const currentUser = state?.user?.user;
    const userId = currentUser?.id || currentUser?._id;
    const requestPayload = userId ? { ...payload, id: userId } : payload;

    const result = await profileService.updateProfile(requestPayload);
    if (!result.success) {
      return rejectWithValue(result.error || 'Failed to update profile');
    }
    return result.data;
  }
);

const initialState = {
  loading: false,
  error: null,
  success: null
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileMessages: (state) => {
      state.error = null;
      state.success = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.loading = false;
        state.success = 'Profile updated successfully';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update profile';
      });
  }
});

export const { clearProfileMessages } = profileSlice.actions;
export default profileSlice.reducer;

