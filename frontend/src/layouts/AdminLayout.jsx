import { Outlet } from "react-router-dom";
import AdminMenu from "../components/admin/AdminMenu";
import "../styles/adminLayout.css";
import "../styles/adminMenu.css";

function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminMenu />

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
