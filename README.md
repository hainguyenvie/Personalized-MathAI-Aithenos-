# Tri Thức Vàng - Vietnamese Adaptive Learning Platform

A gamified educational platform featuring personalized learning paths, AI tutoring, and game show-style quizzes.

## Features

- **Adaptive Assessment**: Smart evaluation that creates personalized knowledge maps
- **Game Show Mode**: Interactive quiz game with AI hints and help options
- **Learning Paths**: Customized study routes based on assessment results
- **AI Integration**: OpenAI-powered chat assistant for learning support
- **Progress Tracking**: Visual progress indicators and achievement system

## Setup Instructions

### Prerequisites

- Node.js 16 or higher
- npm or yarn

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

#### For Windows Users:

Since Windows Command Prompt doesn't support Unix environment variable syntax, you have a few options:

**Option 1: Use PowerShell instead of Command Prompt**
```powershell
$env:NODE_ENV="development"; npx tsx server/index.ts
```

**Option 2: Use Git Bash (if you have Git installed)**
```bash
NODE_ENV=development npx tsx server/index.ts
```

**Option 3: Modify the command directly**
```bash
npx tsx server/index.ts
```
(The app will work without NODE_ENV set, defaulting to development mode)

#### For Mac/Linux Users:
```bash
npm run dev
```

### Alternative Development Server

If you encounter issues with the default setup, you can run the development server using:

```bash
# Start the backend server
npx tsx server/index.ts

# In a separate terminal, start the frontend (if needed)
# The current setup serves both frontend and backend from one server
```

### Environment Variables

Create a `.env` file in the root directory if you want to use OpenAI features:

```
OPENAI_API_KEY=your_openai_api_key_here
```

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── data/           # Mock data for demo
├── server/                 # Backend Express server
├── shared/                 # Shared types and schemas
└── README.md
```

## Available Pages

- **Home** (`/`) - Dashboard with learning progress
- **Assessment** (`/assessment`) - Smart knowledge evaluation
- **Learning** (`/learning`) - Adaptive learning content
- **Game Show** (`/gameshow`) - Interactive quiz game
- **Leaderboard** (`/leaderboard`) - Competition rankings

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, TypeScript
- **Database**: In-memory storage (for demo)
- **AI**: OpenAI GPT-4 integration
- **Build Tools**: Vite, TSX

## Demo Features

The current version includes:
- Complete assessment system with knowledge mapping
- Interactive game show with multiple help options
- AI-powered hints and explanations
- Progress tracking and achievements
- Mobile-responsive design
- Vietnamese language support

## Troubleshooting

### Common Issues

1. **Environment variable error on Windows**: Use one of the Windows-specific commands above
2. **Port already in use**: The server runs on port 5000 by default. Kill any process using that port or modify the port in `server/index.ts`
3. **Missing dependencies**: Run `npm install` again
4. **TypeScript errors**: Run `npm run check` to see detailed type errors

### Development Tips

- The application uses hot module replacement for fast development
- Changes to server files require a manual restart
- Frontend changes are automatically reflected in the browser
- Check the browser console for any runtime errors

## License

MIT License - feel free to use this code for educational purposes.