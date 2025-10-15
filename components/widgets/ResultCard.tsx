import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

/**
 * Result data interface
 */
interface ResultData {
  result: number;
  expression: string;
  operation: string;
  num1: number;
  num2: number;
  operationName: string;
}

/**
 * Result Card Widget Component
 */
function ResultCard() {
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [animateResult, setAnimateResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Get data from window.openai.toolOutput
    if (window.openai && window.openai.toolOutput) {
      const output = window.openai.toolOutput.structuredContent || window.openai.toolOutput;
      console.log('[Result] Received tool output:', output);
      setData(output);
      setLoading(false);

      // Trigger animations
      setTimeout(() => setAnimateResult(true), 100);
      setTimeout(() => setShowConfetti(true), 300);
      setTimeout(() => setShowConfetti(false), 2000);
    } else {
      console.error('[Result] No tool output found');
      setLoading(false);
    }
  }, []);

  const getOperationEmoji = () => {
    if (!data) return '🔢';

    const emojis: Record<string, string> = {
      add: '➕',
      subtract: '➖',
      multiply: '✖️',
      divide: '➗',
    };
    return emojis[data.operation] || '🔢';
  };

  const getOperationColor = () => {
    if (!data) return 'from-gray-500 to-gray-600';

    const colors: Record<string, string> = {
      add: 'from-blue-500 to-blue-600',
      subtract: 'from-purple-500 to-purple-600',
      multiply: 'from-green-500 to-green-600',
      divide: 'from-orange-500 to-orange-600',
    };
    return colors[data.operation] || 'from-gray-500 to-gray-600';
  };

  const handleCalculateAgain = async () => {
    try {
      // Call the show_calculator tool to restart
      if (window.openai && window.openai.callTool) {
        await window.openai.callTool('show_calculator', {});
      } else {
        console.log('[Result] window.openai.callTool not available');
        alert('In ChatGPT, this will show the calculator again.');
      }
    } catch (error) {
      console.error('[Result] Error calling tool:', error);
    }
  };

  if (loading) {
    return (
      <div className="result-card loading">
        <div className="loading-spinner large"></div>
        <p>Calculating...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="result-card error">
        <p>❌ Failed to load result</p>
      </div>
    );
  }

  return (
    <div className="result-card">
      {showConfetti && <div className="confetti-container">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="confetti" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)]
          }}></div>
        ))}
      </div>}

      <div className={`result-header bg-gradient-to-br ${getOperationColor()}`}>
        <div className="result-emoji">{getOperationEmoji()}</div>
        <h2 className="result-operation-name">{data.operationName}</h2>
      </div>

      <div className="result-body">
        <div className="expression-display">
          <span className="expression-text">{data.expression}</span>
        </div>

        <div className="equals-symbol">=</div>

        <div className={`result-display ${animateResult ? 'animate' : ''}`}>
          <div className="result-value">{data.result}</div>
        </div>

        <div className="result-details">
          <div className="detail-box">
            <span className="detail-label">First Number</span>
            <span className="detail-value">{data.num1}</span>
          </div>
          <div className="detail-box">
            <span className="detail-label">Second Number</span>
            <span className="detail-value">{data.num2}</span>
          </div>
        </div>

        <button
          onClick={handleCalculateAgain}
          className={`again-button bg-gradient-to-br ${getOperationColor()}`}
        >
          ✨ Calculate Again
        </button>
      </div>

      <div className="result-footer">
        <p className="footer-badge">✅ Calculation Complete!</p>
      </div>
    </div>
  );
}

// Mount the widget when script loads
if (typeof document !== 'undefined') {
  const root = document.getElementById('root');
  if (root) {
    createRoot(root).render(<ResultCard />);
  }
}

export default ResultCard;
