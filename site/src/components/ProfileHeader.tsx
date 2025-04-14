import React, { useEffect, useState } from "react";
import { Mail, Phone, Clock, Calendar } from "lucide-react";

interface UserProfile {
  employee_id: number;
  name: string;
  role: string;
  contact_info: string;
  employment_date: string;
  image_url: string;
  total_flights: number;
  total_hours: number;
  weekly_completed_flights: number;
  weekly_completed_hours: number;
}

export const ProfileHeader = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to load profile');
        
        const data: UserProfile = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="animate-pulse bg-gray-100 rounded-lg h-40" />;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex flex-col md:flex-row items-start gap-6">
        <img 
          src={profile.image_url} 
          alt={profile.name}
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
        />
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
          <p className="text-lg text-gray-600">{profile.role}</p>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail size={18} />
              <span>{profile.contact_info}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone size={18} />
              <span>+7 (XXX) XXX-XX-XX</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <Calendar size={24} className="text-blue-600" />
              <p className="font-medium">{profile.weekly_completed_flights}</p>
              <p className="text-sm">Completed flights</p>
              <p className="text-xs text-gray-500">This week</p>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <Clock size={24} className="text-green-600" />
              <p className="font-medium">{profile.weekly_completed_hours}</p>
              <p className="text-sm">Flight hours</p>
              <p className="text-xs text-gray-500">This week</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};