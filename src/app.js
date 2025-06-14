require('dotenv').config();

const { App, LogLevel } = require('@slack/bolt');

const GitHubService = require('./services/GitHubService');
const SlackMessageBuilder = require('./services/SlackMessageBuilder');

// Initialize Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel:
    process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
});

const githubService = new GitHubService(process.env.GITHUB_TOKEN);
const messageBuilder = new SlackMessageBuilder();

// Listen for GitHub PR URLs in messages
// IMPORTANT: For this to trigger, your bot must be a member of the channel
// where the message is posted.
app.message(
  /https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/,
  async ({ message, client, logger }) => {
    // Ignore messages from bots or with subtypes (e.g., channel_join) to prevent loops
    if (message.subtype || message.bot_id) {
      return;
    }

    try {
      const matches = message.text.match(
        /https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/
      );
      const [, owner, repo, pullNumber] = matches;

      logger.info('✅ GitHub PR link detected!');
      logger.info(`   - Repository: ${owner}/${repo}`);
      logger.info(`   - PR Number: #${pullNumber}`);
      logger.info(`   - Channel: ${message.channel}`);
      logger.info(`   - User: <@${message.user}>`);
      logger.info('   🔄 Fetching PR details from GitHub...');

      // Get PR details from GitHub
      const prData = await githubService.getPullRequest(
        owner,
        repo,
        pullNumber
      );

      logger.info('   ✅ Successfully fetched PR details.');

      // Build Slack message with approve button
      const blocks = messageBuilder.buildPRMessage(
        prData,
        owner,
        repo,
        pullNumber,
        message.channel,
        message.ts
      );

      logger.info('   🚀 Sending enhanced message to Slack...');

      // Post the enhanced message as a reply in a thread
      await client.chat.postMessage({
        channel: message.channel,
        thread_ts: message.ts,
        blocks,
        text: `GitHub PR: ${prData.title}`,
      });

      logger.info('   ✅ Message sent successfully!');
    } catch (error) {
      logger.error('❌ Error processing GitHub PR:', error);
      if (error.data) {
        logger.error('   Error Details:', error.data);
      }
    }
  }
);

// Handle approve button clicks
app.action('approve_pr', async ({ ack, body, client, logger }) => {
  await ack();

  try {
    const { owner, repo, pull_number } = JSON.parse(body.actions[0].value);
    const userId = body.user.id;

    // Get user info to show who approved
    const userInfo = await client.users.info({ user: userId });
    const userName = userInfo.user.real_name || userInfo.user.name;

    logger.info(
      `[APPROVAL] User ${userName} is approving PR: ${owner}/${repo}#${pull_number}`
    );

    await githubService.approvePullRequest(owner, repo, pull_number);

    logger.info(`[APPROVAL] Successfully approved PR on GitHub.`);

    // Get the original message blocks to update them
    const history = await client.conversations.history({
      channel: body.channel.id,
      latest: body.container.message_ts,
      inclusive: true,
      limit: 1,
    });
    const originalBlocks = history.messages[0].blocks;

    // Build the updated message blocks
    const updatedBlocks = messageBuilder.buildApprovedMessage(
      originalBlocks,
      userName
    );

    await client.chat.update({
      channel: body.channel.id,
      ts: body.container.message_ts,
      blocks: updatedBlocks,
      text: `GitHub PR approved by ${userName}`,
    });

    logger.info(`[APPROVAL] Updated original Slack message.`);
  } catch (error) {
    logger.error('❌ Error approving PR:', error);
    if (error.data) logger.error('   Error Details:', error.data);

    await client.chat.postEphemeral({
      channel: body.channel.id,
      user: body.user.id,
      text: `❌ Failed to approve PR. Error: ${error.message}. Check logs for details.`,
    });
  }
});

// Handle request changes button clicks
app.action('request_changes', async ({ ack, body, client, logger }) => {
  await ack();

  try {
    const { owner, repo, pull_number } = JSON.parse(body.actions[0].value);

    // Open a modal for requesting changes
    await client.views.open({
      trigger_id: body.trigger_id,
      view: messageBuilder.buildRequestChangesModal(
        owner,
        repo,
        pull_number,
        body.channel.id,
        body.container.message_ts
      ),
    });
  } catch (error) {
    logger.error('Error opening request changes modal:', error);
  }
});

// Handle request changes modal submission
app.view(
  'request_changes_modal',
  async ({ ack, body, view, client, logger }) => {
    await ack();

    try {
      const { owner, repo, pull_number, channel_id, message_ts } = JSON.parse(
        view.private_metadata
      );
      const comment = view.state.values.comment_block.comment_input.value;
      const userId = body.user.id;

      // Get user info
      const userInfo = await client.users.info({ user: userId });
      const userName = userInfo.user.real_name || userInfo.user.name;

      logger.info(
        `[CHANGES] User ${userName} is requesting changes for PR: ${owner}/${repo}#${pull_number}`
      );

      // Request changes on GitHub (submitting a review with comments)
      await githubService.requestChanges(
        owner,
        repo,
        pull_number,
        comment,
        userName
      );

      logger.info(`[CHANGES] Successfully submitted review to GitHub.`);

      // Update the original message
      const history = await client.conversations.history({
        channel: channel_id,
        latest: message_ts,
        limit: 1,
        inclusive: true,
      });
      const originalBlocks = history.messages[0].blocks;

      const updatedBlocks = messageBuilder.buildRequestChangesMessage(
        originalBlocks,
        userName,
        comment
      );

      await client.chat.update({
        channel: channel_id,
        ts: message_ts,
        blocks: updatedBlocks,
        text: `Changes requested on PR by ${userName}`,
      });
      logger.info(`[CHANGES] Updated original Slack message.`);
    } catch (error) {
      logger.error('❌ Error requesting changes:', error);
      if (error.data) logger.error('   Error Details:', error.data);
      // You might want to notify the user in the modal or via an ephemeral message
    }
  }
);

// Handle "View on GitHub" button clicks (no logic needed, it's just a link)
app.action('view_github', async ({ ack }) => {
  await ack();
});

// TEMPORARY DEBUGGING: Log all incoming raw message events
// app.event('message', async ({ event, logger }) => {
//   logger.info(
//     `(Debug) Received a message event: user ${event.user} in channel ${event.channel} said "${event.text}"`
//   );
// });

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ GitHub Approve Slack app is running!');
})();
