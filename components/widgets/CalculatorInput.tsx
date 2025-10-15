import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

/**
 * Calculator Input Widget Component
 */
function CalculatorInput() {
  const [operation, setOperation] = useState('add');
  const [operationName, setOperationName] = useState('Addition');
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get data from window.openai.toolOutput
    if (window.openai && window.openai.toolOutput) {
      const output = window.openai.toolOutput.structuredContent || window.openai.toolOutput;
      console.log('[Input] Received tool output:', output);

      if (output.operation) {
        setOperation(output.operation);
      }
      if (output.operationName) {
        setOperationName(output.operationName);
      }
    }
  }, []);

  const getOperationEmoji = () => {
    const emojis: Record<string, string> = {
      add: '➕',
      subtract: '➖',
      multiply: '✖️',
      divide: '➗',
    };
    return emojis[operation] || '🔢';
  };

  const getOperationColor = () => {
    const colors: Record<string, string> = {
      add: 'from-blue-500 to-blue-600',
      subtract: 'from-purple-500 to-purple-600',
      multiply: 'from-green-500 to-green-600',
      divide: 'from-orange-500 to-orange-600',
    };
    return colors[operation] || 'from-gray-500 to-gray-600';
  };

  const validateInputs = (): boolean => {
    setError('');

    if (num1 === '' || num2 === '') {
      setError('Please enter both numbers');
      return false;
    }

    const n1 = parseFloat(num1);
    const n2 = parseFloat(num2);

    if (isNaN(n1) || isNaN(n2)) {
      setError('Please enter valid numbers');
      return false;
    }

    if (operation === 'divide' && n2 === 0) {
      setError('Cannot divide by zero');
      return false;
    }

    return true;
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const n1 = parseFloat(num1);
      const n2 = parseFloat(num2);

      // Call the calculate tool via window.openai API
      if (window.openai && window.openai.callTool) {
        await window.openai.callTool('calculate', {
          operation,
          num1: n1,
          num2: n2,
        });
      } else {
        console.error('[Input] window.openai.callTool not available');
        alert(`Calculate: ${n1} ${operation} ${n2}\n\nIn ChatGPT, this will show the result.`);
      }
    } catch (error) {
      console.error('[Input] Error calling tool:', error);
      setError('Failed to calculate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="calculator-input">
      <div className={`input-header bg-gradient-to-br ${getOperationColor()}`}>
        <div className="header-emoji">{getOperationEmoji()}</div>
        <h2 className="header-title">{operationName}</h2>
        <p className="header-subtitle">Enter two numbers to calculate</p>
      </div>

      <form onSubmit={handleCalculate} className="input-form">
        <div className="form-group">
          <label htmlFor="num1" className="form-label">
            First Number
          </label>
          <input
            type="number"
            id="num1"
            value={num1}
            onChange={(e) => setNum1(e.target.value)}
            className="form-input"
            placeholder="Enter first number"
            step="any"
            autoFocus
            disabled={loading}
          />
        </div>

        <div className="operation-symbol">{getOperationEmoji()}</div>

        <div className="form-group">
          <label htmlFor="num2" className="form-label">
            Second Number
          </label>
          <input
            type="number"
            id="num2"
            value={num2}
            onChange={(e) => setNum2(e.target.value)}
            className="form-input"
            placeholder="Enter second number"
            step="any"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`calculate-button bg-gradient-to-br ${getOperationColor()}`}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Calculating...
            </>
          ) : (
            <>Calculate</>
          )}
        </button>
      </form>
    </div>
  );
}

// Mount the widget when script loads
if (typeof document !== 'undefined') {
  const root = document.getElementById('root');
  if (root) {
    createRoot(root).render(<CalculatorInput />);
  }
}

export default CalculatorInput;
