import { z } from 'zod';
import { ToolDefinition, ToolResult, CalculationError } from './types';
import { getFullUrl } from '@/baseUrl';
import { calculate, getOperationName, getOperationSymbol, Operation } from '@/lib/calculator/operations';

/**
 * Tool 1: show_calculator
 * Displays the calculator carousel with 4 operation cards
 */

const showCalculatorInputSchema = z.object({
  // No input required - just shows the carousel
});

type ShowCalculatorInput = z.infer<typeof showCalculatorInputSchema>;

async function handleShowCalculator(args: ShowCalculatorInput): Promise<ToolResult> {
  return {
    content: [
      {
        type: 'text',
        text: 'Welcome to Calcufy! 🧮\n\nPlease select an operation from the cards below:',
      },
    ],
    structuredContent: {
      message: 'Select an operation to begin',
      operations: ['add', 'subtract', 'multiply', 'divide'],
    },
    _meta: {
      'openai/outputTemplate': getFullUrl('/widgets/calculator-carousel.html'),
    },
  };
}

export const showCalculatorTool: ToolDefinition<ShowCalculatorInput> = {
  name: 'show_calculator',
  description: 'Display the Calcufy calculator interface with operation selection cards (Add, Subtract, Multiply, Divide)',
  inputSchema: showCalculatorInputSchema,
  handler: handleShowCalculator,
  metadata: {
    'openai/outputTemplate': getFullUrl('/widgets/calculator-carousel.html'),
    category: 'Calculator',
    tags: ['calculator', 'math', 'arithmetic'],
  },
};

/**
 * Tool 2: select_operation
 * Handles operation selection and shows input form
 */

const selectOperationInputSchema = z.object({
  operation: z.enum(['add', 'subtract', 'multiply', 'divide']).describe('The operation to perform'),
});

type SelectOperationInput = z.infer<typeof selectOperationInputSchema>;

async function handleSelectOperation(args: SelectOperationInput): Promise<ToolResult> {
  const { operation } = args;
  const operationName = getOperationName(operation as Operation);

  return {
    content: [
      {
        type: 'text',
        text: `${operationName} selected! Please enter two numbers.`,
      },
    ],
    structuredContent: {
      operation,
      operationName,
      message: 'Please enter two numbers',
    },
    _meta: {
      'openai/outputTemplate': getFullUrl('/widgets/calculator-input.html'),
    },
  };
}

export const selectOperationTool: ToolDefinition<SelectOperationInput> = {
  name: 'select_operation',
  description: 'Select a calculator operation and display the input form for two numbers',
  inputSchema: selectOperationInputSchema,
  handler: handleSelectOperation,
  metadata: {
    'openai/outputTemplate': getFullUrl('/widgets/calculator-input.html'),
    category: 'Calculator',
    tags: ['calculator', 'operation', 'input'],
  },
};

/**
 * Tool 3: calculate
 * Performs the calculation and displays the result
 */

const calculateInputSchema = z.object({
  operation: z.enum(['add', 'subtract', 'multiply', 'divide']).describe('The operation to perform'),
  num1: z.number().describe('The first number'),
  num2: z.number().describe('The second number'),
});

type CalculateInput = z.infer<typeof calculateInputSchema>;

async function handleCalculate(args: CalculateInput): Promise<ToolResult> {
  const { operation, num1, num2 } = args;

  try {
    // Perform calculation
    const calculationResult = calculate(operation as Operation, num1, num2);
    const operationName = getOperationName(operation as Operation);

    // Format text response
    const textResponse = `${calculationResult.expression} = ${calculationResult.result}`;

    return {
      content: [
        {
          type: 'text',
          text: textResponse,
        },
        {
          type: 'structured',
          data: calculationResult,
        },
      ],
      structuredContent: {
        ...calculationResult,
        num1,
        num2,
        operationName,
      },
      _meta: {
        'openai/outputTemplate': getFullUrl('/widgets/result-card.html'),
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Calculation failed';

    throw new CalculationError(errorMessage, {
      operation,
      num1,
      num2,
    });
  }
}

export const calculateTool: ToolDefinition<CalculateInput> = {
  name: 'calculate',
  description: 'Perform a calculation with two numbers using the selected operation and display the result',
  inputSchema: calculateInputSchema,
  handler: handleCalculate,
  metadata: {
    'openai/outputTemplate': getFullUrl('/widgets/result-card.html'),
    category: 'Calculator',
    tags: ['calculator', 'math', 'result'],
  },
};

/**
 * All calculator tools
 */
export const calculatorTools = [
  showCalculatorTool,
  selectOperationTool,
  calculateTool,
];
