import React from "react";
import { Brain, Heart, Moon, ArrowRight } from "lucide-react";
const TrainingCategory = ({
  icon: Icon,
  title,
  description,
  items
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  items: string[];
}) => <div className="bg-white rounded-lg p-6 shadow-sm">
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-lg bg-blue-50">
        <Icon className="text-blue-600" size={24} />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-500 mt-1">{description}</p>
        <ul className="mt-4 space-y-2">
          {items.map((item, index) => <li key={index} className="flex items-center gap-2 text-gray-600">
              <ArrowRight size={16} className="text-blue-500" />
              <span>{item}</span>
            </li>)}
        </ul>
      </div>
    </div>
  </div>;
export const Training = () => {
  const categories = [{
    icon: Heart,
    title: "Wellness Methods",
    description: "Techniques to maintain physical and mental well-being during flights",
    items: ["In-flight stretching exercises", "Stress management techniques", "Hydration and nutrition tips", "Quick recovery practices"]
  }, {
    icon: Brain,
    title: "Cognitive Exercises",
    description: "Mental exercises to maintain alertness and decision-making abilities",
    items: ["Memory enhancement activities", "Situational awareness training", "Decision-making scenarios", "Focus improvement exercises"]
  }, {
    icon: Moon,
    title: "Sleep Recommendations",
    description: "Guidelines for maintaining healthy sleep patterns despite varying schedules",
    items: ["Sleep schedule optimization", "Pre-sleep routines", "Managing jet lag", "Rest period best practices"]
  }];
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Training Hub</h1>
        <p className="text-gray-500 mt-1">
          Enhance your professional skills and well-being with our training
          resources
        </p>
      </div>
      <div className="grid gap-6">
        {categories.map((category, index) => <TrainingCategory key={index} {...category} />)}
      </div>
    </div>;
};