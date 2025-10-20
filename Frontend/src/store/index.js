import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import uiReducer from "./uiSlice";
import organizationReducer from "./organizationSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        ui: uiReducer,
        organization: organizationReducer,
    },
});
