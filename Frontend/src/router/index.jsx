import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { path: "", element: (<Home />) },
        ]
    }
]);


export default function AppRouter() {
    return <RouterProvider router={router} />;
}
