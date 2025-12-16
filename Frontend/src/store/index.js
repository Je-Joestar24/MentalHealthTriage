import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import uiReducer from "./uiSlice";
import organizationReducer from "./organizationSlice";
import diagnosisReducer from "./diagnosisSlice";
import individualReducer from "./individualSlice";
import profileReducer from "./profileSlice";
import patientsReducer from "./patientSlice";
import triageReducer from "./triageSlice";
import companyReducer from "./companySlice";
import psychologistsReducer from "./psychologistsSlice";
import subscriptionReducer from "./subscriptionSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        ui: uiReducer,
        organization: organizationReducer,
        diagnosis: diagnosisReducer,
        individual: individualReducer,
        profile: profileReducer,
        patients: patientsReducer,
        triage: triageReducer,
        company: companyReducer,
        psychologists: psychologistsReducer,
        subscription: subscriptionReducer,
    },
});
