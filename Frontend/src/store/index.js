import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import uiReducer from "./uiSlice";
import organizationReducer from "./organizationSlice";
import diagnosisReducer from "./diagnosisSlice";
import individualReducer from "./individualSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        ui: uiReducer,
        organization: organizationReducer,
        diagnosis: diagnosisReducer,
        individual: individualReducer,
    },
});
