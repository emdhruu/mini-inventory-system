
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import ProductList from "./pages/products/ProductsList";
import ProductForm from "./pages/products/ProductForm";
import CustomerList from "./pages/customers/CustomerList";
import CustomerForm from "./pages/customers/CustomerForm";
import OrderList from "./pages/orders/OrderList";
import OrderForm from "./pages/orders/OrderForm";
import OrderDetails from "./pages/orders/OrderDetails";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "products",
        element: <ProductList/>,
      },
      {
        path: "products/new",
        element: <ProductForm />,
      },
      {
        path: "products/:id/edit",
        element: <ProductForm />,
      },
      {
        path: "customers",
        element: <CustomerList />,
      },
      {
        path: "customers/new",
        element: <CustomerForm />,
      },
      {
        path: "customers/:id/edit",
        element: <CustomerForm />,
      },
      {
        path: "orders",
        element: <OrderList />,
      },
      {
        path: "orders/new",
        element: <OrderForm />,
      },
      {
        path: "orders/:id",
        element: <OrderDetails />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;