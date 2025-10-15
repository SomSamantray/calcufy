/**
 * Calculator operations
 * Implements the four basic arithmetic operations
 */

export type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

export interface CalculationResult {
  result: number;
  expression: string;
  operation: Operation;
}

/**
 * Add two numbers
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * Subtract two numbers
 */
export function subtract(a: number, b: number): number {
  return a - b;
}

/**
 * Multiply two numbers
 */
export function multiply(a: number, b: number): number {
  return a * b;
}

/**
 * Divide two numbers
 * Throws error if dividing by zero
 */
export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a / b;
}

/**
 * Execute calculation based on operation type
 */
export function calculate(operation: Operation, num1: number, num2: number): CalculationResult {
  let result: number;
  let operatorSymbol: string;

  switch (operation) {
    case 'add':
      result = add(num1, num2);
      operatorSymbol = '+';
      break;
    case 'subtract':
      result = subtract(num1, num2);
      operatorSymbol = '-';
      break;
    case 'multiply':
      result = multiply(num1, num2);
      operatorSymbol = '×';
      break;
    case 'divide':
      result = divide(num1, num2);
      operatorSymbol = '÷';
      break;
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return {
    result,
    expression: `${num1} ${operatorSymbol} ${num2}`,
    operation,
  };
}

/**
 * Get operation display name
 */
export function getOperationName(operation: Operation): string {
  const names: Record<Operation, string> = {
    add: 'Addition',
    subtract: 'Subtraction',
    multiply: 'Multiplication',
    divide: 'Division',
  };
  return names[operation];
}

/**
 * Get operation symbol
 */
export function getOperationSymbol(operation: Operation): string {
  const symbols: Record<Operation, string> = {
    add: '+',
    subtract: '-',
    multiply: '×',
    divide: '÷',
  };
  return symbols[operation];
}

/**
 * Get operation emoji
 */
export function getOperationEmoji(operation: Operation): string {
  const emojis: Record<Operation, string> = {
    add: '➕',
    subtract: '➖',
    multiply: '✖️',
    divide: '➗',
  };
  return emojis[operation];
}
