// This file maps Slack User IDs to their GitHub Personal Access Tokens.
// IMPORTANT: Treat this file as a secret. Add it to your .gitignore.
// Do NOT commit this file to version control.

const userMap = {
  // Replace "YOUR_GITHUB_TOKEN_HERE" with your actual GitHub token.
  // To find a user's Slack ID, they can go to their profile, click the "..." menu,
  // and choose "Copy member ID".
  U07H3RSNQLD: process.env.GITHUB_TOKEN || 'YOUR_GITHUB_TOKEN_HERE',

  // --- Add more team members here ---
  // "ANOTHER_SLACK_ID": "ANOTHER_GITHUB_TOKEN",
  // "YET_ANOTHER_SLACK_ID": "YET_ANOTHER_GITHUB_TOKEN",
};

module.exports = userMap;
