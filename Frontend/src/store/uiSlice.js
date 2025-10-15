import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    activeModal: "",
    globalLoading: false,
    // No modal open by default
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
    },
});

export const { setActiveModal, clearModal } = uiSlice.actions;
export default uiSlice.reducer;
