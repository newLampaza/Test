import React, { useEffect, useState } from "react";

interface CrewMember {
  name: string;
  role: string;
  image_url: string;
  crew_name: string;
}

export const CrewList = () => {
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrew = async () => {
      try {
        const response = await fetch('/api/crew', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        setCrew(data);
        setLoading(false); // Обновляем состояние после загрузки
      } catch (error) {
        console.error("Error fetching crew:", error);
        setLoading(false); // Обновляем состояние даже при ошибке
      }
    };
    
    fetchCrew();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading crew members...</div>;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Current Crew</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {crew.map((member, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <img 
              src={member.image_url} 
              alt={member.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-gray-500">{member.role}</p>
              <p className="text-xs text-blue-600">{member.crew_name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};