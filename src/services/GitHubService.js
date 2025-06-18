const { Octokit } = require('@octokit/rest');

class GitHubService {
  constructor(token) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  /**
   * Get pull request details
   */
  async getPullRequest(owner, repo, pullNumber) {
    try {
      const { data } = await this.octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: parseInt(pullNumber),
      });

      return {
        id: data.id,
        number: data.number,
        title: data.title,
        body: data.body,
        state: data.state,
        draft: data.draft,
        user: {
          login: data.user.login,
          avatar_url: data.user.avatar_url,
        },
        head: {
          ref: data.head.ref,
          sha: data.head.sha,
        },
        base: {
          ref: data.base.ref,
        },
        html_url: data.html_url,
        created_at: data.created_at,
        updated_at: data.updated_at,
        mergeable: data.mergeable,
        mergeable_state: data.mergeable_state,
        additions: data.additions,
        deletions: data.deletions,
        changed_files: data.changed_files,
        commits: data.commits,
        comments: data.comments,
        review_comments: data.review_comments,
      };
    } catch (error) {
      console.error('Error fetching PR:', error);
      throw new Error(`Failed to fetch PR details: ${error.message}`);
    }
  }

  /**
   * Get PR reviews
   */
  async getPullRequestReviews(owner, repo, pullNumber) {
    try {
      const { data } = await this.octokit.rest.pulls.listReviews({
        owner,
        repo,
        pull_number: parseInt(pullNumber),
      });

      return data.map((review) => ({
        id: review.id,
        user: {
          login: review.user.login,
          avatar_url: review.user.avatar_url,
        },
        state: review.state,
        body: review.body,
        submitted_at: review.submitted_at,
      }));
    } catch (error) {
      console.error('Error fetching PR reviews:', error);
      return [];
    }
  }

  /**
   * Approve a pull request
   */
  async approvePullRequest(owner, repo, pullNumber) {
    try {
      const { data } = await this.octokit.rest.pulls.createReview({
        owner,
        repo,
        pull_number: parseInt(pullNumber),
        event: 'APPROVE',
      });

      return data;
    } catch (error) {
      console.error('Error approving PR:', error);
      throw new Error(`Failed to approve PR: ${error.message}`);
    }
  }

  /**
   * Request changes on a pull request
   */
  async requestChanges(owner, repo, pullNumber, body) {
    try {
      const { data } = await this.octokit.rest.pulls.createReview({
        owner,
        repo,
        pull_number: parseInt(pullNumber),
        event: 'REQUEST_CHANGES',
        body: body,
      });

      return data;
    } catch (error) {
      console.error('Error requesting changes:', error);
      throw new Error(`Failed to request changes: ${error.message}`);
    }
  }

  /**
   * Add a comment to a pull request
   */
  async addComment(owner, repo, pullNumber, body) {
    try {
      const { data } = await this.octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: parseInt(pullNumber),
        body,
      });

      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error(`Failed to add comment: ${error.message}`);
    }
  }

  /**
   * Check if user has write access to repository
   */
  async hasWriteAccess(owner, repo, username) {
    try {
      const { data } =
        await this.octokit.rest.repos.getCollaboratorPermissionLevel({
          owner,
          repo,
          username,
        });

      return ['admin', 'write'].includes(data.permission);
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  /**
   * Get repository information
   */
  async getRepository(owner, repo) {
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner,
        repo,
      });

      return {
        id: data.id,
        name: data.name,
        full_name: data.full_name,
        private: data.private,
        description: data.description,
        html_url: data.html_url,
        default_branch: data.default_branch,
      };
    } catch (error) {
      console.error('Error fetching repository:', error);
      throw new Error(`Failed to fetch repository: ${error.message}`);
    }
  }
}

module.exports = GitHubService;
