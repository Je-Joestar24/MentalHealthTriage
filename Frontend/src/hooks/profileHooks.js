import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile as updateProfileThunk, clearProfileMessages } from '../store/profileSlice';
import { displayNotification } from '../store/uiSlice';
import { setAuth } from '../store/userSlice';

const useProfile = () => {
  const dispatch = useDispatch();
  const profileState = useSelector((state) => state.profile);
  const user = useSelector((state) => state.user.user);

  const updateProfile = useCallback(
    async (payload) => {
      const result = await dispatch(updateProfileThunk(payload));
      if (updateProfileThunk.fulfilled.match(result)) {
        const updatedUser = result.payload;
        const token = sessionStorage.getItem('token');
        dispatch(
          setAuth({
            token,
            user: updatedUser
          })
        );
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        dispatch(
          displayNotification({
            message: 'Profile updated successfully',
            type: 'success'
          })
        );
      } else {
        const message =
          typeof result.payload === 'string'
            ? result.payload
            : result.payload?.message || 'Failed to update profile';
        dispatch(
          displayNotification({
            message,
            type: 'error'
          })
        );
      }
      return result;
    },
    [dispatch]
  );

  const clearMessages = useCallback(() => {
    dispatch(clearProfileMessages());
  }, [dispatch]);

  return {
    ...profileState,
    user,
    updateProfile,
    clearMessages
  };
};

export default useProfile;

