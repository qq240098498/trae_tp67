import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/Layout";
import Toast from "@/components/Toast";
import Dashboard from "@/pages/Dashboard";
import ProductList from "@/pages/ProductList";
import ProductNew from "@/pages/ProductNew";
import ProductSupply from "@/pages/ProductSupply";
import OrderStats from "@/pages/OrderStats";
import SortingList from "@/pages/SortingList";
import SortingDetail from "@/pages/SortingDetail";
import Verification from "@/pages/Verification";
import AftersaleList from "@/pages/AftersaleList";
import AftersaleNew from "@/pages/AftersaleNew";
import PickupReminder from "@/pages/PickupReminder";

export default function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/new" element={<ProductNew />} />
          <Route path="/products/supply" element={<ProductSupply />} />
          <Route path="/orders" element={<OrderStats />} />
          <Route path="/sorting" element={<SortingList />} />
          <Route path="/sorting/:id" element={<SortingDetail />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/aftersale" element={<AftersaleList />} />
          <Route path="/aftersale/new" element={<AftersaleNew />} />
          <Route path="/pickup-reminder" element={<PickupReminder />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </AppLayout>
      <Toast />
    </Router>
  );
}
