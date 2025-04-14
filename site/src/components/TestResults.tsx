import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Brain, Clock, CheckCircle, XCircle, List, Zap } from 'lucide-react';

interface TestResult {
  test_id: number;
  test_date: string;
  test_type: string;
  score: number;
  duration: number;
  details: {
    total_questions: number;
    correct_answers: number;
  };
  mistakes: Array<{
    question: string;
    user_answer: string;
    correct_answer: string;
  }>;
}

const TestResults = () => {
  const { testId } = useParams();
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/tests/results/${testId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to load results');
        
        const data = await response.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [testId]);

  const getTestIcon = (type: string) => {
    const icons = {
      attention: <Brain className="w-6 h-6" />,
      memory: <List className="w-6 h-6" />,
      reaction: <Zap className="w-6 h-6" />
    };
    return icons[type as keyof typeof icons] || <Brain className="w-6 h-6" />;
  };

  if (loading) return <div className="p-4 text-center">Loading results...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!result) return <div className="p-4 text-center">No results found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-50 rounded-lg">
            {getTestIcon(result.test_type)}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">
              {result.test_type.charAt(0).toUpperCase() + result.test_type.slice(1)} Test Results
            </h2>
            <p className="text-gray-500">
              {new Date(result.test_date).toLocaleDateString()} • 
              Duration: {Math.floor(result.duration)}s
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">{result.score}%</p>
            <p className="text-sm text-gray-600">Overall Score</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">
              {result.details.correct_answers}/{result.details.total_questions}
            </p>
            <p className="text-sm text-gray-600">Correct Answers</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600">
              {result.details.total_questions - result.details.correct_answers}
            </p>
            <p className="text-sm text-gray-600">Mistakes</p>
          </div>
        </div>

        {result.mistakes.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <XCircle className="text-red-500" />
              Mistakes Analysis
            </h3>
            <div className="space-y-4">
              {result.mistakes.map((mistake, index) => (
                <div key={index} className="bg-red-50 p-4 rounded-lg">
                  <p className="font-medium mb-2">{mistake.question}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="text-red-500 flex-shrink-0" />
                      <span>Your answer: {mistake.user_answer || 'No answer'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-500 flex-shrink-0" />
                      <span>Correct: {mistake.correct_answer}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate('/tests')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
              flex items-center gap-2 transition-colors"
          >
            <List size={20} />
            Вернуться к списку тестов
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestResults;