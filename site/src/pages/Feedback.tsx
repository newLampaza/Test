import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Star, 
  Send, 
  Clock, 
  Plane, 
  AlertCircle, 
  CheckCircle,
  XCircle 
} from "lucide-react";

interface FeedbackEntry {
  feedback_id: number;
  feedback_text: string;
  feedback_date: string;
  from_code: string;
  to_code: string;
  departure_time: string;
  arrival_time: string;
}

interface FlightOption {
  flight_id: number;
  display: string;
  departure_time: string;
}

const FeedbackCard = ({ feedback }: { feedback: FeedbackEntry }) => {
  const flightDate = new Date(feedback.departure_time).toLocaleDateString('en-US', {
    weekday: 'short', 
    day: 'numeric', 
    month: 'short'
  });

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <Plane className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {feedback.from_code} → {feedback.to_code}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
              <Clock size={14} />
              <span>{flightDate}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
            Completed
          </span>
        </div>
      </div>

      <div className="mt-4 pl-2 border-l-4 border-blue-200">
        <p className="text-gray-700 whitespace-pre-wrap">
          {feedback.feedback_text}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          Submitted on {new Date(feedback.feedback_date).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export const Feedback = () => {
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');
  const [flights, setFlights] = useState<FlightOption[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackEntry[]>([]);
  const [formData, setFormData] = useState({
    flight_id: '',
    feedback_text: '',
    rating: 5
  });
  const [loading, setLoading] = useState({ form: false, flights: true });
  const [error, setError] = useState('');

  // Загрузка завершенных рейсов
  useEffect(() => {
    const loadFlights = async () => {
      try {
        const response = await fetch('/api/flights?completed=true', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to load flights');
        
        const data = await response.json();
        setFlights(data.map((f: any) => ({
          flight_id: f.flight_id,
          display: `${f.from_code} → ${f.to_code} (${new Date(f.departure_time).toLocaleDateString()})`,
          departure_time: f.departure_time
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Flight load error');
      } finally {
        setLoading(prev => ({ ...prev, flights: false }));
      }
    };

    loadFlights();
  }, []);

  // Загрузка истории отзывов
  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const response = await fetch('/api/feedback', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to load feedback');
        
        setFeedbackHistory(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Feedback load error');
      }
    };

    if (activeTab === 'history') loadFeedback();
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, form: true }));
    setError('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          flight_id: parseInt(formData.flight_id),
          feedback_text: formData.feedback_text
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Submission failed');

      setFormData({ flight_id: '', feedback_text: '', rating: 5 });
      setActiveTab('history');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission error');
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const isFlightPast = (departureTime: string) => {
    return new Date(departureTime) < new Date();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Flight Feedback System
        </h1>
        <p className="text-gray-600">
          Share your post-flight experiences and review previous feedback
        </p>
      </div>

      <div className="flex gap-4 border-b mb-8">
        <button
          onClick={() => setActiveTab('submit')}
          className={`pb-2 px-1 border-b-2 font-medium ${
            activeTab === 'submit'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Submit Feedback
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-2 px-1 border-b-2 font-medium ${
            activeTab === 'history'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Feedback History
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-center gap-3 text-red-700">
          <XCircle className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {activeTab === 'submit' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Completed Flight
              </label>
              <select
                value={formData.flight_id}
                onChange={(e) => setFormData({ ...formData, flight_id: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={loading.flights}
                required
              >
                <option value="">Choose a completed flight...</option>
                {flights.map((flight) => (
                  <option
                    key={flight.flight_id}
                    value={flight.flight_id}
                    disabled={!isFlightPast(flight.departure_time)}
                  >
                    {flight.display}
                    {!isFlightPast(flight.departure_time) && ' (Upcoming)'}
                  </option>
                ))}
                {flights.length === 0 && !loading.flights && (
                  <option disabled>No completed flights available</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flight Experience
              </label>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className={`p-1.5 rounded-md ${
                      star <= formData.rating
                        ? 'text-yellow-400 bg-yellow-50'
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  >
                    <Star size={24} fill="currentColor" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Feedback
              </label>
              <textarea
                value={formData.feedback_text}
                onChange={(e) =>
                  setFormData({ ...formData, feedback_text: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 h-32"
                placeholder="Describe your flight experience..."
                maxLength={1000}
                required
              />
              <div className="text-sm text-gray-500 mt-2 text-right">
                {formData.feedback_text.length}/1000 characters
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading.form || loading.flights}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading.form ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">↻</span>
                Submitting...
              </span>
            ) : (
              'Submit Feedback'
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          {feedbackHistory.length > 0 ? (
            feedbackHistory.map((feedback) => (
              <FeedbackCard key={feedback.feedback_id} feedback={feedback} />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
              <MessageSquare className="mx-auto mb-3 text-gray-400" />
              <p>No feedback submissions found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};