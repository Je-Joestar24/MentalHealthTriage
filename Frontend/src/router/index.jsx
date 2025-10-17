import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Login from "../pages/Login";
import AuthLayout from "../layouts/AuthLayout";
import HomeLayout from "../layouts/HomeLayout";
import MainLayout from "../layouts/MainLayout";
import AdminDashboard from "../pages/AdminDashboard";
import RequireGuest from "./access/RequireGuest";
import RequireAuth from "./access/RequireAuth";

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
                    { path: "", element: (
                        <RequireGuest>
                            <Home />
                        </RequireGuest>
                    ) }
                ]
            },
            // Auth Layout - for login, register, forgot password, etc.
            {
                path: "auth",
                element: <AuthLayout />,
                children: [
                    { path: "login", element: (
                        <RequireGuest>
                            <Login />
                        </RequireGuest>
                    ) },
                    // Add more auth routes here like:
                    // { path: "register", element: <Register /> },
                    // { path: "forgot-password", element: <ForgotPassword /> },
                ]
            },
            // Main Layout - for dashboard, profile, settings, etc.
            {
                path: "superadmin",
                element: <MainLayout />,
                children: [
                    // Add your main app routes here like:
                    { path: "dashboard", element: (
                        <RequireAuth roles={["super_admin"]}>
                            <AdminDashboard/>
                        </RequireAuth>
                    ) },
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
