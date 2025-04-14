import React from "react";
import { X, Home, Calendar, Activity, MessageSquare, BookOpen, Settings, Brain } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}
export const MobileNav = ({
  isOpen,
  onClose
}: MobileNavProps) => {
  const location = useLocation();
  const menuItems = [{
    icon: Home,
    label: "Dashboard",
    href: "/"
  }, {
    icon: Calendar,
    label: "Schedule",
    href: "/schedule"
  }, {
    icon: Brain,
    label: "Tests",
    href: "/tests"
  }, {
    icon: MessageSquare,
    label: "Feedback",
    href: "/feedback"
  }, {
    icon: BookOpen,
    label: "Training",
    href: "/training"
  }, { 
    icon: Activity, 
    label: "Fatigue Analysis", 
    href: "/fatigue-analysis" 
  },{
    icon: Settings,
    label: "Settings",
    href: "/settings"
  }, ];
  return <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out z-50 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">Menu</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Close menu">
              <X size={24} />
            </button>
          </div>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => <li key={index}>
                <Link to={item.href} className={`flex items-center gap-3 p-3 rounded-lg transition-colors
                    ${location.pathname === item.href ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`} onClick={onClose}>
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>)}
          </ul>
        </nav>
      </div>
    </>;
};