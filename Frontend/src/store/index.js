import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import uiReducer from "./uiSlice";
import organizationReducer from "./organizationSlice";
import diagnosisReducer from "./diagnosisSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        ui: uiReducer,
        organization: organizationReducer,
        diagnosis: diagnosisReducer,
    },
});
