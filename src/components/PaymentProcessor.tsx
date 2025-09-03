import React, { useState } from 'react';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  recipient: string;
  purpose: string;
  status: string;
  timestamp: number;
}

interface PaymentProcessorProps {
  onPaymentProcessed: (payment: Payment) => void;
  walletAddress: string;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({ onPaymentProcessed, walletAddress }) => {
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('Telemedicine Consultation');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const simulateCircleLayerPayment = async (paymentData: any) => {
    console.log('💳 Circle Layer: Initiating USDC payment...');
    console.log('Payment details:', paymentData);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('💳 Circle Layer: Payment processed successfully');
    return {
      transactionId: `circle_${Date.now()}`,
      status: 'completed'
    };
  };

  const simulateCardamonCompliance = async (paymentData: any) => {
    console.log('⚖️ Cardamon.ai: Analyzing regulatory requirements...');
    
    // Simulate compliance analysis
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const splits = {
      provider: Math.round(parseFloat(paymentData.amount) * 0.8 * 100) / 100,
      compliance: Math.round(parseFloat(paymentData.amount) * 0.15 * 100) / 100,
      platform: Math.round(parseFloat(paymentData.amount) * 0.05 * 100) / 100
    };
    
    console.log('⚖️ Cardamon.ai: Payment split calculated:', splits);
    console.log('⚖️ Cardamon.ai: HIPAA compliance verified');
    console.log('⚖️ Cardamon.ai: GDPR compliance verified');
    
    return splits;
  };

  const handlePayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setIsProcessing(true);

    try {
      const paymentData = {
        amount: parseFloat(amount),
        currency: 'USDC',
        purpose,
        sender: walletAddress,
        recipient: 'healthcare_provider_wallet'
      };

      // Step 1: Process compliance splitting
      const complianceSplits = await simulateCardamonCompliance(paymentData);

      // Step 2: Process payment through Circle Layer
      const paymentResult = await simulateCircleLayerPayment(paymentData);

      // Step 3: Create payment record
      const newPayment: Payment = {
        id: paymentResult.transactionId,
        amount: parseFloat(amount),
        currency: 'USDC',
        recipient: 'Healthcare Provider',
        purpose,
        status: 'Completed',
        timestamp: Date.now()
      };

      onPaymentProcessed(newPayment);
      setShowSuccess(true);
      setAmount('');
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Payment Successful!</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Your payment has been processed and compliance requirements have been met.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Payment</h3>
        
        <form onSubmit={handlePayment} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (USDC)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="50"
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                title="Select payment purpose"
              >
                <option value="Telemedicine Consultation">Telemedicine Consultation</option>
                <option value="Insurance Claim">Insurance Claim</option>
                <option value="Lab Test Payment">Lab Test Payment</option>
                <option value="Prescription Payment">Prescription Payment</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Payment Processing Flow:</h4>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                <span>⚖️ Cardamon.ai analyzes regulatory requirements</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span>💳 Circle Layer processes USDC payment</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                <span>🔗 TRON blockchain records transaction</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing || !amount || parseFloat(amount) <= 0}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-400 transition duration-200"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </div>
            ) : (
              'Process Payment'
            )}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Demo Scenario</h4>
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-md">
            <h5 className="font-medium text-gray-900">Telemedicine Consultation</h5>
            <p className="text-sm text-gray-600 mt-1">
              Patient pays $50 USDC for virtual consultation. Payment is automatically split: 
              $40 to provider, $7.50 for compliance, $2.50 platform fee.
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <h5 className="font-medium text-gray-900">Insurance Claim</h5>
            <p className="text-sm text-gray-600 mt-1">
              Insurance processes $200 USDC claim with verified health records. 
              Regulatory splitting ensures compliance with local healthcare laws.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessor;
