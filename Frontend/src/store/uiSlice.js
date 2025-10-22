import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    activeModal: "",
    globalLoading: false,
    loading: false,
    notification: null,
    globalDialog: {
        open: false,
        type: 'info', // 'info', 'danger', 'success'
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: null,
        onCancel: null,
        icon: null
    }
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
        showGlobalDialog: (state, action) => {
            state.globalDialog = {
                open: true,
                type: action.payload.type || 'info',
                title: action.payload.title || '',
                message: action.payload.message || '',
                confirmText: action.payload.confirmText || 'Confirm',
                cancelText: action.payload.cancelText || 'Cancel',
                onConfirm: action.payload.onConfirm || null,
                onCancel: action.payload.onCancel || null,
                icon: action.payload.icon || null
            };
        },
        hideGlobalDialog: (state) => {
            state.globalDialog.open = false;
        },
        clearGlobalDialog: (state) => {
            state.globalDialog = {
                open: false,
                type: 'info',
                title: '',
                message: '',
                confirmText: 'Confirm',
                cancelText: 'Cancel',
                onConfirm: null,
                onCancel: null,
                icon: null
            };
        },
    },
});

export const { 
    setActiveModal, 
    clearModal, 
    setLoading, 
    displayNotification, 
    clearNotification,
    showGlobalDialog,
    hideGlobalDialog,
    clearGlobalDialog
} = uiSlice.actions;
export default uiSlice.reducer;
