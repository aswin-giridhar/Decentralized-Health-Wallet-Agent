import React, { useState } from 'react';
import CryptoJS from 'crypto-js';

interface HealthRecord {
  id: string;
  name: string;
  type: string;
  content: string;
  encrypted: boolean;
  timestamp: number;
}

interface HealthRecordUploadProps {
  onRecordAdded: (record: HealthRecord) => void;
  onClose: () => void;
}

const HealthRecordUpload: React.FC<HealthRecordUploadProps> = ({ onRecordAdded, onClose }) => {
  const [recordName, setRecordName] = useState('');
  const [recordType, setRecordType] = useState('Lab Report');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const encryptData = (data: string): string => {
    const secretKey = 'health-wallet-secret-key-2024';
    return CryptoJS.AES.encrypt(data, secretKey).toString();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!recordName) {
        setRecordName(selectedFile.name.split('.')[0]);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!recordName || !file) return;

    setIsUploading(true);

    try {
      // Read file content
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      // Create encrypted health record
      const encryptedContent = encryptData(fileContent);
      
      const newRecord: HealthRecord = {
        id: Date.now().toString(),
        name: recordName,
        type: recordType,
        content: encryptedContent,
        encrypted: true,
        timestamp: Date.now()
      };

      // Simulate Kite AI processing
      console.log('🤖 Kite AI: Processing health document...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('🤖 Kite AI: Document processed and categorized');

      onRecordAdded(newRecord);
      onClose();
    } catch (error) {
      console.error('Error uploading record:', error);
      alert('Error uploading health record');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add Health Record</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Record Name
            </label>
            <input
              type="text"
              value={recordName}
              onChange={(e) => setRecordName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Blood Test Results"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Record Type
            </label>
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Select record type"
            >
              <option value="Lab Report">Lab Report</option>
              <option value="Imaging">Imaging</option>
              <option value="Prescription">Prescription</option>
              <option value="Consultation Notes">Consultation Notes</option>
              <option value="Insurance Document">Insurance Document</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".txt,.pdf,.doc,.docx,.jpg,.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: TXT, PDF, DOC, DOCX, JPG, PNG
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
              <span className="text-sm text-blue-700">
                🔒 Your file will be encrypted using AES-256 encryption
              </span>
            </div>
            <div className="flex items-center mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-green-700">
                🤖 Kite AI will process and categorize your document
              </span>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !recordName || !file}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition duration-200"
            >
              {isUploading ? 'Uploading...' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HealthRecordUpload;
