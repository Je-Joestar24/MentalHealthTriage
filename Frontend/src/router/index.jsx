import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Login from "../pages/Login";
import RegisterPage from "../pages/Auth/RegisterPage";
import AuthLayout from "../layouts/AuthLayout";
import HomeLayout from "../layouts/HomeLayout";
import MainLayout from "../layouts/MainLayout";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import RequireGuest from "./access/RequireGuest";
import RequireAuth from "./access/RequireAuth";
import PsychologistDashboard from "../pages/Psychologist/PsychologistDashboard";
import OrgAdminDashboard from "../pages/OrgAdmin/OrgAdminDashboard";
import Organizations from "../pages/Admin/Organizations";
import DiagnosisList from "../pages/Admin/DiagnosisList";
import IndividualAccounts from "../pages/Admin/IndividualAccounts";
import TriagePatient from "../pages/Psychologist/TriagePatient";
import PatientsList from "../pages/Psychologist/PatientsList";
import PsychologistDiagnosisList from "../pages/Psychologist/PsychologistDiagnosisList";
import PatientsTriageHistory from "../pages/Psychologist/PatientsTriageHistory";
import CompanyDetails from "../pages/OrgAdmin/CompanyDetails";
import CompanyDiagnosisLIst from "../pages/OrgAdmin/CompanyDiagnosisList";
import CompanyPsychologistList from "../pages/OrgAdmin/CompanyPsychologistList";
import CompanyPatients from "../pages/OrgAdmin/CompanyPatients";
import CompanySubscription from "../pages/OrgAdmin/CompanySubscription";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            // Home Layout - for landing page
            {
                path: "",
                element: <HomeLayout />,
                children: [
                    {
                        path: "", element: (
                            <RequireGuest>
                                <Home />
                            </RequireGuest>
                        )
                    }
                ]
            },
            // Auth Layout - for login, register, forgot password, etc.
            {
                path: "auth",
                element: <AuthLayout />,
                children: [
                    {
                        path: "login", element: (
                            <RequireGuest>
                                <Login />
                            </RequireGuest>
                        )
                    },
                    {
                        path: "register", element: (
                            <RequireGuest>
                                <RegisterPage />
                            </RequireGuest>
                        )
                    },
                ]
            },
            // Main Layout - for dashboard, profile, settings, etc.
            {
                path: "super",
                element: <MainLayout />,
                children: [
                    // Add your main app routes here like:
                    {
                        path: "dashboard", element: (
                            <RequireAuth roles={["super_admin"]}>
                                <AdminDashboard />
                            </RequireAuth>
                        )
                    },
                    {
                        path: "diagnosis", element: (
                            <RequireAuth roles={["super_admin"]}>
                                <DiagnosisList />
                            </RequireAuth>
                        )
                    },
                    {
                        path: "organizations", element: (
                            <RequireAuth roles={["super_admin"]}>
                                <Organizations />
                            </RequireAuth>
                        )
                    },
                    {
                        path: "accounts", element: (
                            <RequireAuth roles={["super_admin"]}>
                                <IndividualAccounts />
                            </RequireAuth>
                        )
                    },
                    // { path: "profile", element: <Profile /> },
                    // { path: "settings", element: <Settings /> },
                ]
            },
            {
                path: "company",
                element: <MainLayout />,
                children: [
                    // Add your main app routes here like:
                    {
                        path: "dashboard", element: (
                            <RequireAuth roles={["company_admin"]}>
                                <OrgAdminDashboard />
                            </RequireAuth>
                        )
                    },
                    {
                        path: "details", element: (
                            <RequireAuth roles={["company_admin"]}>
                                <CompanyDetails />
                            </RequireAuth>
                        )
                    },
                    {
                        path: "diagnosis/list", element: (
                            <RequireAuth roles={["company_admin"]}>
                                <CompanyDiagnosisLIst />
                            </RequireAuth>
                        )
                    },
                    {
                        path: "psychologist/list", element: (
                            <RequireAuth roles={["company_admin"]}>
                                <CompanyPsychologistList />
                            </RequireAuth>
                        )
                    },
                    {
                        path: "patients", element: (
                            <RequireAuth roles={["company_admin"]}>
                                <CompanyPatients />
                            </RequireAuth>
                        )
                    },
                    {
                        path: "subscription", element: (
                            <RequireAuth roles={["company_admin"]}>
                                <CompanySubscription />
                            </RequireAuth>
                        )
                    },
                    // { path: "profile", element: <Profile /> },
                    // { path: "settings", element: <Settings /> },
                ]
            },
            {
                path: "psychologist",
                element: <MainLayout />,
                children: [
                    // Add your main app routes here like:
                    {
                        path: "dashboard", element: (
                            <RequireAuth roles={["psychologist"]}>
                                <PsychologistDashboard />
                            </RequireAuth>
                        )
                    },
                    {
                        path: "triage", element: (
                            <RequireAuth roles={["psychologist"]}>
                                <TriagePatient />
                            </RequireAuth>
                        )
                    },
                    {
                        path: "triage/:id", element: (
                            <RequireAuth roles={["psychologist"]}>
                                <TriagePatient />
                            </RequireAuth>
                        )
                    },
                    {
                        path: "triage/:id/:triageId", element: (
                            <RequireAuth roles={["psychologist"]}>
                                <TriagePatient />
                            </RequireAuth>
                        )
                    },
                    {
                        path: "patients", element: (
                            <RequireAuth roles={["psychologist"]}>
                                <PatientsList />
                            </RequireAuth>
                        )
                    },
                    {
                        path: "diagnosis/list", element: (
                            <RequireAuth roles={["psychologist"]}>
                                <PsychologistDiagnosisList />
                            </RequireAuth>
                        )
                    },
                    {
                        path: "patients/history/:patientId", element: (
                            <RequireAuth roles={["psychologist", "company_admin"]}>
                                <PatientsTriageHistory />
                            </RequireAuth>
                        )
                    },
                    // { path: "profile", element: <Profile /> },
                    // { path: "settings", element: <Settings /> },
                ]
            }
        ]
    }
]);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}
