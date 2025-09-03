import React, { useState } from 'react';

interface DemoScenarioProps {
  onScenarioComplete: (scenario: string) => void;
}

const DemoScenario: React.FC<DemoScenarioProps> = ({ onScenarioComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('telemedicine');

  const telemedicineSteps = [
    {
      title: "Patient uploads health records",
      description: "Encrypted medical history and current symptoms",
      icon: "📄",
      duration: 2000
    },
    {
      title: "Kite AI processes documents",
      description: "AI extracts key medical information and categorizes records",
      icon: "🤖",
      duration: 3000
    },
    {
      title: "Payment initiated",
      description: "Patient pays $50 USDC for telemedicine consultation",
      icon: "💳",
      duration: 2000
    },
    {
      title: "Cardamon.ai compliance check",
      description: "Regulatory requirements analyzed and payment split calculated",
      icon: "⚖️",
      duration: 2500
    },
    {
      title: "Circle Layer processes payment",
      description: "USDC payment processed through Circle Layer infrastructure",
      icon: "🔄",
      duration: 3000
    },
    {
      title: "TRON blockchain records transaction",
      description: "Transaction recorded on TRON network with audit trail",
      icon: "🔗",
      duration: 2000
    },
    {
      title: "Doctor receives payment & records",
      description: "Healthcare provider gets $40, compliance reserve $7.50, platform $2.50",
      icon: "👨‍⚕️",
      duration: 1500
    }
  ];

  const insuranceSteps = [
    {
      title: "Patient submits insurance claim",
      description: "Treatment records and receipts uploaded securely",
      icon: "📋",
      duration: 2000
    },
    {
      title: "Kite AI extracts claim data",
      description: "AI automatically processes and validates claim information",
      icon: "🤖",
      duration: 3000
    },
    {
      title: "Cardamon.ai validates compliance",
      description: "Insurance regulations checked across jurisdictions",
      icon: "⚖️",
      duration: 2500
    },
    {
      title: "Smart contract verification",
      description: "TRON smart contract validates claim authenticity",
      icon: "📜",
      duration: 2000
    },
    {
      title: "Insurance payment processed",
      description: "$200 USDC claim processed through Circle Layer",
      icon: "💰",
      duration: 3000
    },
    {
      title: "Regulatory splitting applied",
      description: "Payment split according to local healthcare regulations",
      icon: "🔄",
      duration: 2000
    },
    {
      title: "Patient receives reimbursement",
      description: "Instant settlement with full audit trail and compliance",
      icon: "✅",
      duration: 1500
    }
  ];

  const steps = selectedScenario === 'telemedicine' ? telemedicineSteps : insuranceSteps;

  const runDemo = async () => {
    setIsRunning(true);
    setCurrentStep(0);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, steps[i].duration));
    }

    setCurrentStep(steps.length);
    setTimeout(() => {
      setIsRunning(false);
      onScenarioComplete(selectedScenario);
    }, 1000);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setIsRunning(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">🎬 Demo Scenarios</h3>
        
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setSelectedScenario('telemedicine')}
            className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
              selectedScenario === 'telemedicine'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🏥 Telemedicine Consultation
          </button>
          <button
            onClick={() => setSelectedScenario('insurance')}
            className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
              selectedScenario === 'insurance'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🛡️ Insurance Claim
          </button>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={runDemo}
            disabled={isRunning}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400 transition duration-200"
          >
            {isRunning ? 'Running Demo...' : 'Start Demo'}
          </button>
          <button
            onClick={resetDemo}
            disabled={isRunning}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400 transition duration-200"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center p-4 rounded-lg border-2 transition-all duration-500 ${
              index < currentStep
                ? 'border-green-500 bg-green-50'
                : index === currentStep && isRunning
                ? 'border-blue-500 bg-blue-50 animate-pulse'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex-shrink-0 mr-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                  index < currentStep
                    ? 'bg-green-500 text-white'
                    : index === currentStep && isRunning
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {index < currentStep ? '✓' : step.icon}
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{step.title}</h4>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
            {index === currentStep && isRunning && (
              <div className="flex-shrink-0 ml-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {currentStep === steps.length && !isRunning && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Demo Complete!</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  {selectedScenario === 'telemedicine' 
                    ? 'Telemedicine consultation completed with full compliance and instant payment processing.'
                    : 'Insurance claim processed with automated compliance checking and instant settlement.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">🏆 Bounty Integration Highlights:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-700">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
            <span><strong>TRON:</strong> Blockchain infrastructure & smart contracts</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span><strong>Circle Layer:</strong> USDC payment processing</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
            <span><strong>Kite AI:</strong> Document processing & analysis</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
            <span><strong>Cardamon.ai:</strong> Regulatory compliance & splitting</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoScenario;
