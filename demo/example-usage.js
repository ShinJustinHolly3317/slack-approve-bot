/**
 * Demo script showing how the GitHub Approve Slack app works
 * This is just for demonstration - the actual app runs via Slack events
 */

const GitHubService = require('../src/services/GitHubService');
const SlackMessageBuilder = require('../src/services/SlackMessageBuilder');

// Mock data for demonstration
const mockPRData = {
  id: 123456789,
  number: 42,
  title: 'Add awesome new feature',
  body: 'This PR adds a really cool new feature that will make our users happy!\n\n## Changes\n- Added new component\n- Updated tests\n- Fixed bug in existing code',
  state: 'open',
  draft: false,
  user: {
    login: 'developer123',
    avatar_url: 'https://avatars.githubusercontent.com/u/123456?v=4',
  },
  head: {
    ref: 'feature/awesome-feature',
    sha: 'abc123def456',
  },
  base: {
    ref: 'main',
  },
  html_url: 'https://github.com/myorg/myrepo/pull/42',
  created_at: '2023-12-01T10:00:00Z',
  updated_at: '2023-12-01T15:30:00Z',
  mergeable: true,
  mergeable_state: 'clean',
  additions: 150,
  deletions: 25,
  changed_files: 8,
  commits: 3,
  comments: 2,
  review_comments: 1,
};

function demonstrateSlackMessage() {
  console.log('🚀 GitHub Approve Slack App Demo\n');

  const messageBuilder = new SlackMessageBuilder();

  // Build the Slack message blocks
  const blocks = messageBuilder.buildPRMessage(
    mockPRData,
    'myorg',
    'myrepo',
    '42'
  );

  console.log('📱 Slack Message Blocks (JSON):');
  console.log(JSON.stringify(blocks, null, 2));

  console.log('\n📋 What users see in Slack:');
  console.log('━'.repeat(50));
  console.log(`🟢 ${mockPRData.title}`);
  console.log(`myorg/myrepo #42`);
  console.log(`👤 ${mockPRData.user.login}`);
  console.log('');
  console.log('Description:');
  console.log(mockPRData.body.substring(0, 100) + '...');
  console.log('');
  console.log(`Author: ${mockPRData.user.login}`);
  console.log(`Branch: ${mockPRData.head.ref} → ${mockPRData.base.ref}`);
  console.log(
    `Changes: +${mockPRData.additions} -${mockPRData.deletions} (${mockPRData.changed_files} files)`
  );
  console.log(`Status: ✅ Ready to merge`);
  console.log('');
  console.log('[✅ Approve] [🔄 Request Changes] [🔗 View on GitHub]');
  console.log('━'.repeat(50));

  console.log('\n✅ After approval:');
  console.log('━'.repeat(50));
  const approvedBlocks = messageBuilder.buildApprovedMessage(
    blocks,
    'John Doe'
  );
  console.log('✅ Approved by John Doe');
  console.log('━'.repeat(50));

  console.log('\n🔄 After requesting changes:');
  console.log('━'.repeat(50));
  const changesBlocks = messageBuilder.buildRequestedChangesMessage(
    blocks,
    'Jane Smith',
    'Please add more tests for the new feature'
  );
  console.log('🔄 Changes requested by Jane Smith');
  console.log('"Please add more tests for the new feature"');
  console.log('━'.repeat(50));
}

function demonstrateWorkflow() {
  console.log('\n🔄 Typical Workflow:');
  console.log('━'.repeat(50));
  console.log('1. Developer posts PR link in Slack:');
  console.log('   https://github.com/myorg/myrepo/pull/42');
  console.log('');
  console.log('2. Bot detects the link and fetches PR details from GitHub API');
  console.log('');
  console.log('3. Bot posts rich message with PR info and action buttons');
  console.log('');
  console.log('4. Reviewer clicks "✅ Approve" button');
  console.log('');
  console.log('5. Bot calls GitHub API to approve the PR');
  console.log('');
  console.log('6. Bot updates the Slack message to show approval status');
  console.log('');
  console.log('7. PR author gets notification on GitHub about the approval');
  console.log('━'.repeat(50));
}

function demonstrateFeatures() {
  console.log('\n🎯 Key Features:');
  console.log('━'.repeat(50));
  console.log('✅ Auto-detects GitHub PR URLs in messages');
  console.log('📊 Shows rich PR details (title, author, stats, status)');
  console.log('🎨 Beautiful Slack Block Kit UI');
  console.log('⚡ One-click approve directly from Slack');
  console.log('💬 Request changes with custom comments');
  console.log('🔒 Secure GitHub token authentication');
  console.log('🔄 Real-time message updates');
  console.log('👥 Shows who approved/requested changes');
  console.log('━'.repeat(50));
}

// Run the demo
if (require.main === module) {
  demonstrateSlackMessage();
  demonstrateWorkflow();
  demonstrateFeatures();

  console.log('\n🎉 Ready to enhance your code review workflow!');
  console.log('Follow the README.md setup instructions to get started.');
}
