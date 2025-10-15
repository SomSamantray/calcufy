import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

/**
 * Operation card data
 */
interface Operation {
  id: string;
  name: string;
  emoji: string;
  symbol: string;
  color: string;
  description: string;
}

const operations: Operation[] = [
  {
    id: 'add',
    name: 'Addition',
    emoji: '➕',
    symbol: '+',
    color: 'from-blue-500 to-blue-600',
    description: 'Add two numbers together',
  },
  {
    id: 'subtract',
    name: 'Subtraction',
    emoji: '➖',
    symbol: '-',
    color: 'from-purple-500 to-purple-600',
    description: 'Subtract one number from another',
  },
  {
    id: 'multiply',
    name: 'Multiplication',
    emoji: '✖️',
    symbol: '×',
    color: 'from-green-500 to-green-600',
    description: 'Multiply two numbers',
  },
  {
    id: 'divide',
    name: 'Division',
    emoji: '➗',
    symbol: '÷',
    color: 'from-orange-500 to-orange-600',
    description: 'Divide one number by another',
  },
];

/**
 * Calculator Carousel Widget Component
 */
function CalculatorCarousel() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (operation: Operation) => {
    setSelectedCard(operation.id);
    setLoading(true);

    try {
      // Call the select_operation tool via window.openai API
      if (window.openai && window.openai.callTool) {
        await window.openai.callTool('select_operation', {
          operation: operation.id,
        });
      } else {
        console.error('[Carousel] window.openai.callTool not available');
        alert(`Selected: ${operation.name}\n\nIn ChatGPT, this will trigger the input form.`);
      }
    } catch (error) {
      console.error('[Carousel] Error calling tool:', error);
      alert('Failed to proceed. Please try again.');
    } finally {
      setLoading(false);
      setSelectedCard(null);
    }
  };

  return (
    <div className="calculator-carousel">
      <div className="carousel-header">
        <h2 className="carousel-title">Calcufy Calculator 🧮</h2>
        <p className="carousel-subtitle">Select an operation to get started</p>
      </div>

      <div className="cards-grid">
        {operations.map((operation) => (
          <div
            key={operation.id}
            className={`operation-card ${selectedCard === operation.id ? 'selected' : ''}`}
          >
            <div className={`card-gradient bg-gradient-to-br ${operation.color}`}>
              <div className="card-emoji">{operation.emoji}</div>
              <h3 className="card-name">{operation.name}</h3>
              <div className="card-symbol">{operation.symbol}</div>
              <p className="card-description">{operation.description}</p>
              <button
                onClick={() => handleSelect(operation)}
                disabled={loading}
                className="select-button"
              >
                {loading && selectedCard === operation.id ? (
                  <span className="loading-spinner"></span>
                ) : (
                  'Select'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="carousel-footer">
        <p className="footer-text">Choose any operation to begin calculating</p>
      </div>
    </div>
  );
}

// Mount the widget when script loads
if (typeof document !== 'undefined') {
  const root = document.getElementById('root');
  if (root) {
    createRoot(root).render(<CalculatorCarousel />);
  }
}

export default CalculatorCarousel;
