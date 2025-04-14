import React from "react";
import { Home, Calendar, Brain, Activity, MessageSquare, BookOpen, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
export const DesktopNav = () => {
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
  }, {
    icon: Settings,
    label: "Settings",
    href: "/settings"
  }, ];
  return <nav className="hidden md:block">
      <ul className="flex items-center gap-2">
        {menuItems.map((item, index) => <li key={index}>
            <Link to={item.href} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${location.pathname === item.href ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          </li>)}
      </ul>
    </nav>;
};