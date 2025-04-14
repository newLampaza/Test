import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Brain, List, Zap, Clock, AlertCircle, BookOpen } from "lucide-react";

interface TestCategory {
  id: string;
  type: 'attention' | 'memory' | 'reaction';
  title: string;
  description: string;
  icon: JSX.Element;
  status: 'available' | 'locked' | 'cooldown';
  lastScore?: number;
  required?: boolean;
  cooldown?: number;
}

export const Tests = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [testCategories, setTestCategories] = useState<TestCategory[]>([]);
  const [error, setError] = useState("");
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCooldowns(prev => {
        const updated = {...prev};
        Object.keys(updated).forEach(key => {
          if(updated[key] > 0) updated[key] -= 1;
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      setRefreshKey(prev => prev + 1);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchTestStatus = async () => {
      try {
        const response = await fetch('/api/cognitive-tests', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to load tests');
        
        const tests = await response.json();
        
        const categories = ['attention', 'memory', 'reaction'].map(type => ({
          id: type,
          type: type as 'attention' | 'memory' | 'reaction',
          title: type === 'attention' ? 'Тест на внимание' 
            : type === 'memory' ? 'Тест на память' 
            : 'Тест на реакцию',
          description: type === 'attention' ? 'Проверка концентрации и поиска различий' 
            : type === 'memory' ? 'Оценка кратковременной и зрительной памяти' 
            : 'Измерение скорости реакции и координации',
          icon: type === 'attention' ? <Brain className="w-6 h-6" /> 
            : type === 'memory' ? <List className="w-6 h-6" /> 
            : <Zap className="w-6 h-6" />,
          status: 'available' as const,
          lastScore: tests.find((t: any) => t.test_type === type)?.score,
          required: true,
          cooldown: 0
        }));

        setTestCategories(categories);
      } catch (err) {
        setError("Ошибка загрузки данных тестов");
      } finally {
        setLoading(false);
      }
    };

    fetchTestStatus();
  }, [refreshKey]);

  const handleStartTest = async (testType: string) => {
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
        setCooldowns(prev => ({
          ...prev,
          [testType]: data.retry_after
        }));
        return;
      }
      
      if (!response.ok) throw new Error('Failed to start test');
      
      navigate(`session/${testType}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка запуска теста');
    }
  };

  const updatedTests = testCategories.map(test => ({
    ...test,
    status: (cooldowns[test.type] > 0 ? 'cooldown' : test.status) as TestCategory['status'],
    cooldown: cooldowns[test.type] || 0
  }));

  const isTestSession = location.pathname.includes('/tests/session');
  const isTestResults = location.pathname.includes('/tests/results');

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin text-4xl">🌀</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg mx-4">
        <AlertCircle className="inline mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {!isTestSession && !isTestResults && (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Когнитивные тесты</h1>
            <p className="text-gray-600 mt-2">
              Обязательные регулярные проверки ваших когнитивных способностей
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {updatedTests.map((test) => (
              <div
                key={test.id}
                className={`bg-white rounded-lg p-6 shadow-sm border ${
                  test.status === 'available' 
                    ? 'hover:shadow-md cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                } transition-all`}
                onClick={() => test.status === 'available' && handleStartTest(test.type)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    {test.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-lg font-semibold">{test.title}</h3>
                      {test.required && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          Обязательный
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{test.description}</p>
                    
                    {test.lastScore && (
                      <div className="mt-4 flex items-center gap-2 text-sm">
                        <span className="font-medium">Последний результат:</span>
                        <span
                          className={`px-2 py-1 rounded-full ${
                            test.lastScore >= 75 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {test.lastScore}%
                        </span>
                      </div>
                    )}
                    
                    {test.status === 'cooldown' && (
                      <div className="mt-2 text-sm text-orange-600">
                        Следующая попытка через: 
                        {Math.floor(test.cooldown / 60)}:
                        {String(test.cooldown % 60).padStart(2, '0')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <BookOpen className="text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Рекомендации по тестированию</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Проводите тесты в тихой обстановке без отвлекающих факторов</li>
                  <li>Используйте устройство с сенсорным экраном или мышью</li>
                  <li>Выполняйте тесты в период наивысшей активности</li>
                  <li>Повторяйте тесты еженедельно для отслеживания динамики</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      <div className={isTestSession || isTestResults ? "mt-8" : ""}>
        <Outlet />
      </div>
    </div>
  );
};