import { CheckCircle } from "lucide-react";

interface ProgressStepsProps {
  currentStep: number;
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const steps = [
    { number: 1, title: "Company & Role", completed: currentStep > 1 },
    { number: 2, title: "Resume Input", completed: currentStep > 2 },
    { number: 3, title: "Generate", completed: false },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-4 sm:space-x-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.completed 
                    ? 'bg-primary text-white' 
                    : currentStep >= step.number
                    ? 'bg-primary text-white'
                    : 'bg-gray-300 text-gray-500'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.number ? 'text-primary' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 ml-4 ${
                  currentStep > step.number ? 'bg-primary' : 'bg-gray-300'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
