
import React, { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Clock, XCircle } from "lucide-react";

interface EligibilityCriteria {
  id: number;
  name: string;
  status: "passed" | "failed" | "pending" | "conditionally_passed";
  last_check: string;
  expiry_date?: string;
  details?: string;
  required: boolean;
}

export const FlightEligibility = () => {
  const [eligibility, setEligibility] = useState<EligibilityCriteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  useEffect(() => {
    const fetchEligibility = async () => {
      try {
        const response = await fetch('/api/flight-eligibility', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch eligibility data');
        
        const data = await response.json();
        setEligibility(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchEligibility();
  }, []);

  const StatusIndicator = ({ status }: { status: string }) => {
    const config = {
      passed: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-5 h-5" /> },
      conditionally_passed: { color: "bg-yellow-100 text-yellow-800", icon: <AlertCircle className="w-5 h-5" /> },
      failed: { color: "bg-red-100 text-red-800", icon: <XCircle className="w-5 h-5" /> },
      pending: { color: "bg-blue-100 text-blue-800", icon: <Clock className="w-5 h-5" /> }
    }[status];

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config?.color || ''}`}>
        {config?.icon}
        <span className="text-sm font-medium">{status.toUpperCase()}</span>
      </div>
    );
  };

  if (loading) return <div className="p-4 text-center text-gray-600">Loading eligibility status...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Flight Readiness Status
      </h2>
      
      <div className="space-y-5">
        {eligibility.map((criteria) => (
          <div key={criteria.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">{criteria.name}</h3>
              <StatusIndicator status={criteria.status} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Last checked:</p>
                <p className="font-medium">{formatDate(criteria.last_check)}</p>
              </div>
              
              {criteria.expiry_date && (
                <div>
                  <p className="text-gray-600">Expiry date:</p>
                  <p className="font-medium">{formatDate(criteria.expiry_date)}</p>
                </div>
              )}
            </div>

            {criteria.details && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">{criteria.details}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};