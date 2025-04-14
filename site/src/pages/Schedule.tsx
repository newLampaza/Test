
import React, { useState, useEffect } from "react";
import { Plane, Clock, Calendar, LayoutGrid, LayoutList } from "lucide-react";

interface Flight {
  flight_id: number;
  departure_time: string;
  arrival_time: string;
  from_code: string;
  from_city: string;
  to_code: string;
  to_city: string;
  aircraft: string;
  duration: number;
  crew_name: string;
}

interface FlightDayGroup {
  date: string;
  flights: Flight[];
}

const formatTime = (isoString: string) => 
  new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatDate = (isoString: string) =>
  new Date(isoString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

const FlightCard = ({ flight, viewMode }: { flight: Flight; viewMode: "detailed" | "simple" }) => {
  return viewMode === 'detailed' ? (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-8">
          <div>
            <p className="text-sm text-gray-500">From</p>
            <p className="text-xl font-medium">{flight.from_code}</p>
            <p className="text-sm text-gray-500">{flight.from_city}</p>
            <p className="text-sm text-gray-500">
              {formatTime(flight.departure_time)}
            </p>
          </div>
          <Plane className="text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">To</p>
            <p className="text-xl font-medium">{flight.to_code}</p>
            <p className="text-sm text-gray-500">{flight.to_city}</p>
            <p className="text-sm text-gray-500">
              {formatTime(flight.arrival_time)}
            </p>
          </div>
        </div>
        <div className="md:text-right space-y-1">
          <div className="flex items-center gap-2 text-gray-600 md:justify-end">
            <Clock size={16} />
            <span>
              {Math.floor(flight.duration / 60)}h {flight.duration % 60}m
            </span>
          </div>
          <p className="font-medium text-gray-900">{flight.aircraft}</p>
          <p className="text-sm text-blue-600">{flight.crew_name}</p>
        
        </div>
      </div>
    </div>
  ) : (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-lg font-medium">{flight.from_code}</p>
            <p className="text-sm text-gray-500">{formatTime(flight.departure_time)}</p>
          </div>
          <Plane className="text-blue-500" size={16} />
          <div className="text-center">
            <p className="text-lg font-medium">{flight.to_code}</p>
            <p className="text-sm text-gray-500">
              {Math.floor(flight.duration / 60)}h {flight.duration % 60}m
            </p>
          </div>
        </div>
        <p className="text-sm font-medium text-gray-600">{flight.aircraft}</p>
      </div>
    </div>
  );
};

export const Schedule = () => {
  const [viewMode, setViewMode] = useState<"detailed" | "simple">("detailed");
  const [days, setDays] = useState<FlightDayGroup[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch('/api/flights', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch flights');
        
        const data: Flight[] = await response.json();

        // Группировка рейсов по дням
        const groupedFlights = data.reduce((acc: { [key: string]: Flight[] }, flight) => {
          const dateKey = new Date(flight.departure_time).toDateString();
          if (!acc[dateKey]) acc[dateKey] = [];
          acc[dateKey].push(flight);
          return acc;
        }, {});
        // Преобразование в массив с форматированными датами
        const daysArray = Object.entries(groupedFlights).map(([date, flights]) => ({
          date: formatDate(date),
          flights: flights.sort((a, b) => 
            new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime()
          )
        }));

        // Сортировка дней по дате
        daysArray.sort((a, b) => 
          new Date(a.flights[0].departure_time).getTime() - 
          new Date(b.flights[0].departure_time).getTime()
        );
        setDays(daysArray);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  if (loading) return <div className="p-4 text-center text-gray-600">Loading schedule...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Flight Schedule</h1>
          <p className="text-gray-500 mt-1">Your upcoming flights</p>
        </div>
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("detailed")}
            className={`p-2 rounded-md ${
              viewMode === "detailed" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
            }`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode("simple")}
            className={`p-2 rounded-md ${
              viewMode === "simple" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
            }`}
          >
            <LayoutList size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {days.map((day, index) => (
          <div key={index} className="space-y-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={18} />
              <h2 className="font-medium text-lg">{day.date}</h2>
            </div>
            <div className="grid gap-4">
              {day.flights.map(flight => (
                <FlightCard 
                  key={flight.flight_id} 
                  flight={flight} 
                  viewMode={viewMode} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

