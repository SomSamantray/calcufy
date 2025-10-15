# Calcufy 🧮

A beautiful calculator application built with Next.js and the Model Context Protocol (MCP) for seamless ChatGPT integration.

## 🌟 Features

- **Interactive Calculator Carousel**: Swipeable cards for 4 operations (Add, Subtract, Multiply, Divide)
- **Smart Input Forms**: Validated number inputs with real-time feedback
- **Animated Results**: Beautiful result displays with confetti effects
- **MCP Integration**: Full ChatGPT Apps SDK integration
- **Responsive Design**: Works perfectly on mobile and desktop

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager

### Installation

```bash
# Install dependencies
npm install

# Build widgets
npm run build:widgets

# Start development server
npm run dev
```

The server will start at `http://localhost:3000`

## 📖 How to Use

### 1. Local Development

1. Start the dev server: `npm run dev`
2. Open `http://localhost:3000`
3. Test the MCP endpoint: `curl http://localhost:3000/mcp`

### 2. Test MCP Tools

```bash
# Test show_calculator
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool_name": "show_calculator", "arguments": {}}'

# Test calculate
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool_name": "calculate", "arguments": {"operation": "add", "num1": 45, "num2": 30}}'
```

### 3. Connect to ChatGPT

#### Using MCP Inspector
```bash
npx @modelcontextprotocol/inspector
```
Then connect to: `http://localhost:3000/mcp`

## 🏗️ Project Structure

```
calcufy/
├── app/
│   ├── mcp/route.ts              # MCP server endpoint
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── components/
│   └── widgets/                  # Widget components
├── lib/
│   ├── mcp/                      # MCP server code
│   └── calculator/               # Calculator logic
├── public/widgets/               # Built widget files
├── baseUrl.ts                    # URL configuration
└── middleware.ts                 # CORS handling
```

## 🔧 Available MCP Tools

### 1. `show_calculator`
Displays the calculator carousel with operation selection cards.

### 2. `select_operation`
Handles operation selection and displays input form.

### 3. `calculate`
Performs calculation and displays result.

## 📝 User Flow

1. User: "I want to use Calcufy"
2. User clicks "Select" on an operation card
3. User enters two numbers
4. Result displays with animation

## 🚢 Deployment

Deploy to Vercel: [Vercel Platform](https://vercel.com/new)

Set environment variable:
```
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

## 📚 Technical Stack

- Next.js 15+ with App Router
- TypeScript 5+
- MCP SDK
- Tailwind CSS
- Vite (for widgets)

---

Built with ❤️ using MCP and Next.js
