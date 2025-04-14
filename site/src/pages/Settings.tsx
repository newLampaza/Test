import React from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
export const Settings = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.clear()
    navigate("/login");
    console.log("Logging out...");
  };
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account settings</p>
      </div>
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Account</h2>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </div>;
};