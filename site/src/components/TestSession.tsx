import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, Brain, List, Zap, CheckCircle, XCircle } from 'lucide-react';

interface Question {
  id: string;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  delay?: number;
}

const SequenceMemory = ({ question, onAnswer }: { 
  question: Question;
  onAnswer: (answer: string) => void;
}) => {
  const [showSequence, setShowSequence] = useState(true);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSequence(false);
    }, (question.delay || 5) * 1000);
    
    return () => clearTimeout(timer);
  }, [question.delay]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setInputValue(value);
    onAnswer(value);
  };

  return (
    <div className="text-center space-y-4">
      {showSequence ? (
        <div className="text-4xl font-bold text-blue-600">
          {question.question.split(': ')[1]}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-gray-600">Введите запомненную последовательность цифр:</p>
          <input
            type="text"
            value={inputValue}
            onChange={handleInput}
            className="border-2 border-blue-200 p-2 rounded-lg text-xl text-center w-48"
            maxLength={10}
            autoFocus
          />
        </div>
      )}
    </div>
  );
};

const ReactionTest = ({ question, onAnswer }: { 
  question: Question;
  onAnswer: (answer: string) => void;
}) => {
  const [startTime, setStartTime] = useState(0);
  const [showTarget, setShowTarget] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);

  const startTest = useCallback(() => {
    const delay = Math.random() * 2000 + 1000;
    setTimeout(() => {
      setShowTarget(true);
      setStartTime(Date.now());
    }, delay);
  }, []);

  useEffect(() => {
    if (question.type === 'quick_choice') {
      startTest();
    }
  }, [startTest, question.type]);

  const handleClick = () => {
    if (showTarget) {
      const reactionTime = Date.now() - startTime;
      onAnswer(`click:${reactionTime}`);
      setReactionTimes(prev => [...prev, reactionTime]);
      setShowTarget(false);
      startTest();
      setClicks(prev => prev + 1);
    }
  };

  return (
    <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center cursor-pointer relative">
      <div 
        className="w-full h-full flex items-center justify-center"
        onClick={handleClick}
      >
        {showTarget ? (
          <div className="w-16 h-16 bg-red-500 rounded-full animate-pulse" />
        ) : (
          <span className="text-gray-400">Готовы? Ожидайте сигнал...</span>
        )}
      </div>
      <div className="absolute top-4 right-4 text-sm text-gray-500">
        Попыток: {clicks}
      </div>
      {reactionTimes.length > 0 && (
        <div className="absolute bottom-4 left-4 text-sm text-gray-500">
          Среднее время: {Math.round(reactionTimes.reduce((a,b) => a + b, 0)/reactionTimes.length)}ms
        </div>
      )}
    </div>
  );
};

const TestSession = () => {
  const { type: testType } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(300);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testId, setTestId] = useState('');

  useEffect(() => {
    const startTest = async () => {
      try {
        const response = await fetch('/api/tests/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ test_type: testType })
        });
        
        if (response.status === 429) {
          const data = await response.json();
          navigate('/tests', { state: { cooldown: data.retry_after } });
          return;
        }
        
        if (!response.ok) throw new Error('Failed to start test');
        
        const data = await response.json();
        setQuestions(data.questions);
        setTestId(data.test_id);
        setTimeLeft(data.time_limit);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start test');
      } finally {
        setLoading(false);
      }
    };

    startTest();
  }, [testType, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const submitTest = async () => {
    try {
      const response = await fetch('/api/tests/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          test_id: testId,
          answers: answers
        })
      });

      if (!response.ok) throw new Error('Submission failed');
      
      const result = await response.json();
      navigate(`/tests/results/${result.test_id}`, { state: { refresh: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission error');
    }
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'sequence':
        return (
          <SequenceMemory
            question={question}
            onAnswer={(answer) => handleAnswer(question.id, answer)}
          />
        );
      
      case 'quick_choice':
      case 'moving_target':
        return (
          <ReactionTest
            question={question}
            onAnswer={(answer) => handleAnswer(question.id, answer)}
          />
        );

      case 'image':
        return (
          <div className="grid grid-cols-2 gap-4">
            <img 
              src={question.question} 
              alt="Test visual" 
              className="rounded-lg shadow-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              {question.options?.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(question.id, option)}
                  className={`p-2 border rounded-lg transition-all ${
                    answers[question.id] === option 
                      ? 'border-blue-500 bg-blue-50 scale-105' 
                      : 'hover:border-gray-400 hover:scale-[1.02]'
                  }`}
                >
                  <img 
                    src={option} 
                    alt="Option" 
                    className="w-full h-auto rounded-md"
                  />
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return <p className="text-red-500">Unsupported question type</p>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">🌀</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md text-center">
          <XCircle className="mx-auto mb-4 text-red-600" size={32} />
          <h2 className="text-xl font-semibold mb-2">Ошибка загрузки теста</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            {testType === 'memory' && <List className="text-blue-600" size={28} />}
            {testType === 'reaction' && <Zap className="text-blue-600" size={28} />}
            <h1 className="text-2xl font-bold">
              {testType?.toUpperCase()} TEST
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
            <Clock className="text-gray-600" size={20} />
            <span className="font-medium">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-gray-500">Вопрос {index + 1}</span>
                <div className="flex-1 border-b border-dashed"></div>
              </div>
              {renderQuestion(question)}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            ← Назад к списку тестов
          </button>
          <button
            onClick={submitTest}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
              flex items-center gap-2 transition-colors"
          >
            <CheckCircle size={20} />
            Завершить тест
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestSession;