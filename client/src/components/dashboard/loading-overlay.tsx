import { CheckCircle, Loader2, Clock } from "lucide-react";

interface LoadingOverlayProps {
  isVisible: boolean;
  progress: number;
}

export function LoadingOverlay({ isVisible, progress }: LoadingOverlayProps) {
  if (!isVisible) return null;

  const getProgressSteps = () => {
    const steps = [
      { label: "Analyzing job requirements", threshold: 30 },
      { label: "Tailoring resume content", threshold: 65 },
      { label: "Writing cover letter", threshold: 90 },
    ];

    return steps.map((step, index) => {
      const isCompleted = progress >= step.threshold;
      const isActive = progress >= (steps[index - 1]?.threshold || 0) && progress < step.threshold;

      return {
        ...step,
        isCompleted,
        isActive,
        isPending: progress < (steps[index - 1]?.threshold || 0),
      };
    });
  };

  const progressSteps = getProgressSteps();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-white text-primary rounded-full flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Generating Your Materials
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Our AI is crafting your tailored resume and cover letter...
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* Progress Steps */}
          <div className="space-y-3 mb-6">
            {progressSteps.map((step, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className={`flex-1 text-left ${
                  step.isCompleted ? 'text-green-600' : 
                  step.isActive ? 'text-primary font-medium' : 
                  'text-gray-400'
                }`}>
                  {step.label}
                </span>
                <div className="ml-2">
                  {step.isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : step.isActive ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Time Estimate */}
          <div className="flex items-center justify-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            <span>Usually takes 15-30 seconds</span>
          </div>

          {/* Progress Percentage */}
          <div className="mt-2 text-xs font-medium text-primary">
            {Math.round(progress)}% Complete
          </div>
        </div>
      </div>
    </div>
  );
}
