# Weekly Diary Mentor System (Agent 2)

A sophisticated AI mentor system that collects daily diary entries and generates personalized weekly mentor letters with different personality types.

## Features

### 📝 Daily Diary Collection

- Users can write one diary entry per day
- Entries are stored and tracked by user ID
- System prevents duplicate entries for the same date
- Tracks progress toward weekly completion

### ❓ Daily Reflection Questions

- Generates unique, thought-provoking questions each day
- AI-powered question generation with 10 different categories
- Avoids repetition by tracking used questions
- Provides gentle prompts to inspire meaningful reflection
- Fallback questions available if AI generation fails

### 🌟 Opening Message & Introduction

- Welcomes new users to their personal journal system
- Explains the weekly diary mentor process
- Provides the first daily question to get started
- Sets a warm, supportive tone for the journey
- AI-generated personalized introductions

### 💌 Weekly Mentor Letters

- Analyzes all diary entries from the week
- Generates personalized mentor letters with:
  - Warm, personal greetings
  - Insights from diary patterns
  - Relevant quotes from famous thinkers
  - Historical context and examples
  - Practical advice and perspectives
  - Encouragement for the week ahead

### 🎭 Multiple Mentor Personalities

The system includes 5 different mentor personalities:

1. **Wise Elder** - Grandfatherly figure with timeless wisdom
2. **Life Coach** - Motivational and action-oriented guidance
3. **Philosopher** - Deep intellectual exploration of life's questions
4. **Spiritual Guide** - Contemplative and meaning-focused guidance
5. **Practical Advisor** - Straightforward, real-world solutions

### 🧠 Intelligent Mentor Selection

- Orchestrator analyzes diary entries to determine the best mentor personality
- Considers emotional patterns, expressed needs, and writing style
- Automatically selects the most appropriate mentor for each user

## API Usage

### Chat Endpoint: `/api/chat-agent2`

#### Regular Chat

```javascript
POST /api/chat-agent2
{
  "history": [
    { "role": "user", "content": "Hello, I'd like to start my diary" },
    { "role": "assistant", "content": "Welcome! I'm here to help..." }
  ]
}
```

#### Add Diary Entry

```javascript
POST /api/chat-agent2
{
  "action": "add_diary_entry",
  "userId": "user123",
  "date": "2024-01-15",
  "entry": "Today I felt overwhelmed with work...",
  "history": []
}
```

#### Get Weekly Letter

```javascript
POST /api/chat-agent2
{
  "action": "get_weekly_letter",
  "userId": "user123",
  "mentorPersonality": "wise_elder", // optional
  "history": []
}
```

#### Get Diary Entries

```javascript
POST /api/chat-agent2
{
  "action": "get_diary_entries",
  "userId": "user123",
  "history": []
}
```

#### Clear Diary (New Week)

```javascript
POST /api/chat-agent2
{
  "action": "clear_diary",
  "userId": "user123",
  "history": []
}
```

#### Get Daily Question

```javascript
POST /api/chat-agent2
{
  "action": "get_daily_question",
  "userId": "user123",
  "history": []
}
```

#### Get Opening Message

```javascript
POST /api/chat-agent2
{
  "action": "get_opening_message",
  "userId": "user123",
  "history": []
}
```

## Natural Language Interactions

The system recognizes natural language patterns:

### Diary Entry Triggers

- "Today I..."
- "Dear diary..."
- "Diary entry..."
- "I want to write about..."

### Daily Question Triggers

- "Give me a question for today"
- "What should I write about?"
- "Daily question"
- "Prompt me"
- "Question for today"

### Opening Message Triggers

- "Start journal"
- "Begin journal"
- "New journal"
- "Introduce yourself"
- "Hello"
- "Hi"

### Mentor Letter Triggers

- "Generate my weekly letter"
- "I want my mentor letter"
- "Show me my weekly letter"
- "Create my mentor response"

### Mentor Selection Triggers

- "Which mentor should I use?"
- "What mentor personality..."
- "Show me mentor options"

## Example Workflow

1. **Day 1**: User writes "Today I felt stressed about work..."
2. **Day 2**: User writes "I had a great conversation with a friend..."
3. **Day 3-7**: Continue daily entries...
4. **End of Week**: User requests "Generate my weekly letter"
5. **System**: Analyzes entries, selects appropriate mentor, generates personalized letter
6. **New Week**: User can clear entries and start fresh

## Technical Implementation

### Agent2 Class

- `addDiaryEntry(userId, entry, date)` - Store diary entry
- `getDiaryEntries(userId)` - Retrieve all entries for user
- `generateWeeklyLetter(userId, mentorPersonality)` - Generate mentor letter
- `clearDiaryEntries(userId)` - Clear entries for new week

### Orchestrator2 Class

- `handleDiaryEntry(contents)` - Process diary entry input
- `handleMentorLetter(contents)` - Generate weekly letter
- `handleMentorSelection(contents)` - Show mentor options
- `selectMentorPersonality(entries)` - AI-powered mentor selection

## Testing

Run the test script to see the system in action:

```bash
node src/lib/agents/agent2/test-diary-system.js
```

This will demonstrate:

- Adding sample diary entries
- Generating letters with different mentor personalities
- Testing the orchestrator's mentor selection
- Clearing entries for a new week

## Mentor Personality Details

### Wise Elder

- Warm, grandfatherly tone
- Draws from ancient wisdom and personal experience
- Focuses on life lessons and timeless insights
- Uses metaphors from nature and history

### Life Coach

- Motivational and encouraging
- Provides concrete strategies and frameworks
- Action-oriented guidance
- Focuses on personal development and growth

### Philosopher

- Deep intellectual exploration
- Explores the 'why' behind experiences
- Draws from philosophy and psychology
- Helps understand deeper meanings

### Spiritual Guide

- Contemplative and reflective
- Focuses on meaning and purpose
- Draws from spiritual traditions
- Emphasizes inner peace and understanding

### Practical Advisor

- Straightforward and no-nonsense
- Real-world solutions and advice
- Focuses on work, relationships, health
- Provides actionable guidance

## Future Enhancements

- Persistent storage (database integration)
- User authentication and profiles
- Mentor personality customization
- Letter templates and formatting
- Analytics and insights dashboard
- Multi-language support
