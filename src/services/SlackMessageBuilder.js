class SlackMessageBuilder {
  /**
   * Build a rich message for a GitHub PR with approve/request changes buttons
   */
  buildPRMessage(prData, owner, repo, pullNumber) {
    const statusEmoji = this.getStatusEmoji(prData.state, prData.draft);
    const mergeableEmoji = this.getMergeableEmoji(prData.mergeable_state);

    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${statusEmoji} <${prData.html_url}|${prData.title}>*\n${owner}/${repo} #${pullNumber}`,
        },
        accessory: {
          type: 'image',
          image_url: prData.user.avatar_url,
          alt_text: prData.user.login,
        },
      },
    ];

    // Add PR description if available
    if (prData.body && prData.body.trim()) {
      const truncatedBody =
        prData.body.length > 300
          ? prData.body.substring(0, 300) + '...'
          : prData.body;

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Description:*\n${truncatedBody}`,
        },
      });
    }

    // Add PR stats
    blocks.push({
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Author:*\n${prData.user.login}`,
        },
        {
          type: 'mrkdwn',
          text: `*Branch:*\n${prData.head.ref} → ${prData.base.ref}`,
        },
        {
          type: 'mrkdwn',
          text: `*Changes:*\n+${prData.additions} -${prData.deletions} (${prData.changed_files} files)`,
        },
        {
          type: 'mrkdwn',
          text: `*Status:*\n${mergeableEmoji} ${this.getMergeableText(
            prData.mergeable_state
          )}`,
        },
      ],
    });

    // Add action buttons (only for open PRs)
    if (prData.state === 'open' && !prData.draft) {
      blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '✅ Approve',
            },
            style: 'primary',
            action_id: 'approve_pr',
            value: JSON.stringify({
              owner,
              repo,
              pull_number: pullNumber,
            }),
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '🔄 Request Changes',
            },
            style: 'danger',
            action_id: 'request_changes',
            value: JSON.stringify({
              owner,
              repo,
              pull_number: pullNumber,
            }),
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '🔗 View on GitHub',
            },
            url: prData.html_url,
            action_id: 'view_github',
          },
        ],
      });
    }

    // Add divider
    blocks.push({
      type: 'divider',
    });

    return blocks;
  }

  /**
   * Build approved message (update existing message)
   */
  buildApprovedMessage(originalBlocks, approverName) {
    const blocks = [...originalBlocks];

    // Remove the actions block
    const actionsIndex = blocks.findIndex((block) => block.type === 'actions');
    if (actionsIndex !== -1) {
      blocks.splice(actionsIndex, 1);
    }

    // Add approval status
    blocks.splice(-1, 0, {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `✅ *Approved by ${approverName}*`,
      },
    });

    return blocks;
  }

  /**
   * Build requested changes message (update existing message)
   */
  buildRequestedChangesMessage(originalBlocks, reviewerName, comment) {
    const blocks = [...originalBlocks];

    // Remove the actions block
    const actionsIndex = blocks.findIndex((block) => block.type === 'actions');
    if (actionsIndex !== -1) {
      blocks.splice(actionsIndex, 1);
    }

    // Add changes requested status
    const statusText = comment
      ? `🔄 *Changes requested by ${reviewerName}*\n_"${comment}"_`
      : `🔄 *Changes requested by ${reviewerName}*`;

    blocks.splice(-1, 0, {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: statusText,
      },
    });

    return blocks;
  }

  /**
   * Build modal for requesting changes
   */
  buildRequestChangesModal(owner, repo, pullNumber) {
    return {
      type: 'modal',
      callback_id: 'request_changes_modal',
      title: {
        type: 'plain_text',
        text: 'Request Changes',
      },
      submit: {
        type: 'plain_text',
        text: 'Submit',
      },
      close: {
        type: 'plain_text',
        text: 'Cancel',
      },
      private_metadata: JSON.stringify({
        owner,
        repo,
        pull_number: pullNumber,
      }),
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Requesting changes for:*\n${owner}/${repo} #${pullNumber}`,
          },
        },
        {
          type: 'input',
          block_id: 'comment_block',
          element: {
            type: 'plain_text_input',
            action_id: 'comment_input',
            multiline: true,
            placeholder: {
              type: 'plain_text',
              text: 'Please describe what changes are needed...',
            },
          },
          label: {
            type: 'plain_text',
            text: 'Comment',
          },
        },
      ],
    };
  }

  /**
   * Get status emoji based on PR state
   */
  getStatusEmoji(state, isDraft) {
    if (isDraft) return '🚧';

    switch (state) {
      case 'open':
        return '🟢';
      case 'closed':
        return '🔴';
      case 'merged':
        return '🟣';
      default:
        return '⚪';
    }
  }

  /**
   * Get mergeable emoji
   */
  getMergeableEmoji(mergeableState) {
    switch (mergeableState) {
      case 'clean':
        return '✅';
      case 'dirty':
        return '❌';
      case 'unstable':
        return '⚠️';
      case 'blocked':
        return '🚫';
      default:
        return '❓';
    }
  }

  /**
   * Get mergeable text
   */
  getMergeableText(mergeableState) {
    switch (mergeableState) {
      case 'clean':
        return 'Ready to merge';
      case 'dirty':
        return 'Merge conflicts';
      case 'unstable':
        return 'Checks failing';
      case 'blocked':
        return 'Blocked';
      case 'unknown':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

module.exports = SlackMessageBuilder;
