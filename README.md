# GitHub Approve Slack App

A Slack app that enhances GitHub PR links with interactive approve and request changes buttons, making code reviews more efficient directly from Slack.

## Features

- 🔗 **Auto-detect GitHub PR links** - Automatically detects when someone posts a GitHub PR URL
- 📋 **Rich PR details** - Shows PR title, description, author, branch info, and stats
- ✅ **One-click approval** - Approve PRs directly from Slack
- 🔄 **Request changes** - Request changes with custom comments
- 🎨 **Beautiful UI** - Clean, modern Slack Block Kit interface
- 🔒 **Secure** - Uses GitHub tokens for authentication

## Screenshots

When you paste a GitHub PR link like `https://github.com/owner/repo/pull/123`, the app will automatically show:

- PR title and description
- Author information with avatar
- Branch information (source → target)
- Code changes stats (+additions, -deletions, files changed)
- Merge status (ready to merge, conflicts, etc.)
- Interactive buttons for approval and requesting changes

## Setup

### 1. Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name your app (e.g., "GitHub Approve") and select your workspace
4. Go to "OAuth & Permissions" and add these Bot Token Scopes:
   - `chat:write`
   - `users:read`
   - `channels:history`
   - `groups:history`
   - `im:history`
   - `mpim:history`
5. Install the app to your workspace
6. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

### 2. Enable Socket Mode

1. Go to "Socket Mode" in your Slack app settings
2. Enable Socket Mode
3. Create an App-Level Token with `connections:write` scope
4. Copy the App-Level Token (starts with `xapp-`)

### 3. Configure Event Subscriptions

1. Go to "Event Subscriptions"
2. Enable Events
3. Subscribe to these Bot Events:
   - `message.channels`
   - `message.groups`
   - `message.im`
   - `message.mpim`

### 4. Configure Interactivity

1. Go to "Interactivity & Shortcuts"
2. Enable Interactivity
3. You don't need a Request URL since we're using Socket Mode

### 5. Get GitHub Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate a new token (classic) with these scopes:
   - `repo` (for private repos) or `public_repo` (for public repos only)
   - `read:user`
3. Copy the token

### 6. Install Dependencies

```bash
npm install
```

### 7. Configure Environment

1. Copy the environment template:
   ```bash
   cp env.example .env
   ```

2. Fill in your tokens in `.env`:
   ```env
   SLACK_BOT_TOKEN=xoxb-your-bot-token
   SLACK_SIGNING_SECRET=your-signing-secret
   SLACK_APP_TOKEN=xapp-your-app-token
   GITHUB_TOKEN=your-github-personal-access-token
   PORT=3000
   ```

### 8. Run the App

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## Usage

1. **Paste a GitHub PR link** in any Slack channel where the bot is present:
   ```
   https://github.com/owner/repo/pull/123
   ```

2. **The app will automatically respond** with a rich message showing:
   - PR details and stats
   - Approve and Request Changes buttons
   - Link to view on GitHub

3. **Click "✅ Approve"** to approve the PR on GitHub

4. **Click "🔄 Request Changes"** to open a modal where you can add comments and request changes

## Testing

Run the test suite:

```bash
npm test
```

The tests use Chai and Sinon as per your team's preferences.

## Architecture

```
src/
├── app.js                    # Main Slack app entry point
├── services/
│   ├── GitHubService.js      # GitHub API interactions
│   └── SlackMessageBuilder.js # Slack message formatting
└── test/
    └── services/
        └── GitHubService.test.js # Unit tests
```

## How It Works

1. **Message Detection**: The app listens for messages containing GitHub PR URLs using regex pattern matching
2. **GitHub API**: Fetches PR details using the GitHub REST API
3. **Rich Messages**: Builds interactive Slack messages using Block Kit
4. **Button Actions**: Handles approve/request changes button clicks
5. **GitHub Updates**: Posts reviews back to GitHub with appropriate status

## Permissions Required

### Slack Permissions
- Read messages to detect GitHub URLs
- Post messages to show PR details
- Read user info to attribute actions

### GitHub Permissions
- Read repository and PR information
- Create PR reviews (approve/request changes)
- Post comments on PRs

## Troubleshooting

### Common Issues

1. **"Failed to fetch PR details"**
   - Check your GitHub token has correct permissions
   - Ensure the repository is accessible with your token

2. **"Failed to approve PR"**
   - Make sure your GitHub token has write access to the repository
   - Check if the PR is still open and not already merged

3. **Bot doesn't respond to PR links**
   - Verify the bot is invited to the channel
   - Check the regex pattern matches your PR URL format
   - Look at console logs for errors

### Debug Mode

Set `NODE_ENV=development` for more detailed logging.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - feel free to use this in your own projects! 