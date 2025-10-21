import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    activeModal: "",
    globalLoading: false,
    loading: false,
    notification: null,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setActiveModal: (state, action) => {
            state.activeModal = action.payload || "";
        },
        clearModal: (state) => {
            state.activeModal = "";
        },
        setLoading: (state, action) => {
            state.loading = !!action.payload;
        },
        displayNotification: (state, action) => {
            state.notification = {
                message: action.payload.message,
                type: action.payload.type || 'info',
            };
        },
        clearNotification: (state) => {
            state.notification = null;
        },
    },
});

export const { setActiveModal, clearModal, setLoading, displayNotification, clearNotification } = uiSlice.actions;
export default uiSlice.reducer;
