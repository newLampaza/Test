import React, { useState, useEffect } from "react";
import { Plane, Clock } from "lucide-react";

interface Flight {
  flight_id: number;
  departure_time: string;
  arrival_time: string;
  from_code: string;
  from_city: string;
  to_code: string;
  to_city: string;
  aircraft: string;
  crew_name: string;
  duration: number;
}

const formatTime = (isoString: string) => 
  new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const CurrentFlight = () => {
  const [currentFlight, setCurrentFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentFlight = async () => {
      try {
        const response = await fetch('/api/flights?limit=1', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch flight');
        
        const data = await response.json();
        setCurrentFlight(data[0] || null);
      } catch (error) {
        console.error("Error fetching current flight:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentFlight();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading current flight...</div>;
  if (!currentFlight) return <div className="p-4 text-center">No upcoming flights</div>;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Current Flight
      </h2>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8">
        <div className="flex items-center gap-4 md:gap-8">
          <div>
            <p className="text-sm text-gray-500">From</p>
            <p className="text-xl font-medium">{currentFlight.from_code}</p>
            <p className="text-sm text-gray-500">{currentFlight.from_city}</p>
            <p className="text-sm text-gray-500">
              {formatTime(currentFlight.departure_time)}
            </p>
          </div>
          <Plane className="text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">To</p>
            <p className="text-xl font-medium">{currentFlight.to_code}</p>
            <p className="text-sm text-gray-500">{currentFlight.to_city}</p>
            <p className="text-sm text-gray-500">
              {formatTime(currentFlight.arrival_time)}
            </p>
          </div>
        </div>
        <div className="md:text-right space-y-1">
          <div className="flex items-center gap-2 text-gray-600 md:justify-end">
            <Clock size={16} />
            <span>
              {Math.floor(currentFlight.duration / 60)}h {currentFlight.duration % 60}m
            </span>
          </div>
          <p className="font-medium text-gray-900">{currentFlight.aircraft}</p>
          <p className="text-sm text-blue-600">{currentFlight.crew_name}</p>
          {/* <p className="text-sm text-gray-500">
            Duration: {Math.floor(currentFlight.duration / 60)}h {currentFlight.duration % 60}m
          </p> */}
        </div>
      </div>
    </div>
  );
};