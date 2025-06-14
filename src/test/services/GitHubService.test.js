const { expect } = require('chai');
const sinon = require('sinon');
const { Octokit } = require('@octokit/rest');

const GitHubService = require('../../services/GitHubService');

describe('GitHubService', () => {
  let githubService;
  let octokitStub;
  let pullsStub;
  let issuesStub;
  let reposStub;

  beforeEach(() => {
    // Create stubs for Octokit methods
    pullsStub = {
      get: sinon.stub(),
      listReviews: sinon.stub(),
      createReview: sinon.stub(),
    };

    issuesStub = {
      createComment: sinon.stub(),
    };

    reposStub = {
      get: sinon.stub(),
      getCollaboratorPermissionLevel: sinon.stub(),
    };

    octokitStub = {
      rest: {
        pulls: pullsStub,
        issues: issuesStub,
        repos: reposStub,
      },
    };

    // Stub the Octokit constructor
    sinon.stub(Octokit.prototype, 'constructor').returns(octokitStub);

    githubService = new GitHubService('fake-token');
    githubService.octokit = octokitStub;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getPullRequest', () => {
    it('should fetch PR details successfully', async () => {
      // arrange
      const mockPRData = {
        id: 123,
        number: 1,
        title: 'Test PR',
        body: 'Test description',
        state: 'open',
        draft: false,
        user: {
          login: 'testuser',
          avatar_url: 'https://avatar.url',
        },
        head: {
          ref: 'feature-branch',
          sha: 'abc123',
        },
        base: {
          ref: 'main',
        },
        html_url: 'https://github.com/owner/repo/pull/1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        mergeable: true,
        mergeable_state: 'clean',
        additions: 10,
        deletions: 5,
        changed_files: 2,
        commits: 1,
        comments: 0,
        review_comments: 0,
      };

      pullsStub.get.resolves({ data: mockPRData });

      // act
      const result = await githubService.getPullRequest('owner', 'repo', '1');

      // assert
      expect(pullsStub.get.calledOnce).to.equal(true);
      expect(
        pullsStub.get.calledWith({
          owner: 'owner',
          repo: 'repo',
          pull_number: 1,
        })
      ).to.equal(true);

      expect(result.id).to.equal(123);
      expect(result.title).to.equal('Test PR');
      expect(result.user.login).to.equal('testuser');
    });

    it('should throw error when PR fetch fails', async () => {
      // arrange
      const error = new Error('API Error');
      pullsStub.get.rejects(error);

      // act & assert
      try {
        await githubService.getPullRequest('owner', 'repo', '1');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('Failed to fetch PR details: API Error');
      }
    });
  });

  describe('approvePullRequest', () => {
    it('should approve PR successfully', async () => {
      // arrange
      const mockReviewData = {
        id: 456,
        state: 'APPROVED',
        body: 'Approved via Slack',
      };

      pullsStub.createReview.resolves({ data: mockReviewData });

      // act
      const result = await githubService.approvePullRequest(
        'owner',
        'repo',
        '1',
        'Test approval'
      );

      // assert
      expect(pullsStub.createReview.calledOnce).to.equal(true);
      expect(
        pullsStub.createReview.calledWith({
          owner: 'owner',
          repo: 'repo',
          pull_number: 1,
          event: 'APPROVE',
          body: 'Test approval',
        })
      ).to.equal(true);

      expect(result.id).to.equal(456);
      expect(result.state).to.equal('APPROVED');
    });

    it('should use default body when none provided', async () => {
      // arrange
      const mockReviewData = { id: 456, state: 'APPROVED' };
      pullsStub.createReview.resolves({ data: mockReviewData });

      // act
      await githubService.approvePullRequest('owner', 'repo', '1');

      // assert
      expect(
        pullsStub.createReview.calledWith({
          owner: 'owner',
          repo: 'repo',
          pull_number: 1,
          event: 'APPROVE',
          body: 'Approved via Slack',
        })
      ).to.equal(true);
    });

    it('should throw error when approval fails', async () => {
      // arrange
      const error = new Error('Approval failed');
      pullsStub.createReview.rejects(error);

      // act & assert
      try {
        await githubService.approvePullRequest('owner', 'repo', '1');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('Failed to approve PR: Approval failed');
      }
    });
  });

  describe('requestChanges', () => {
    it('should request changes successfully', async () => {
      // arrange
      const mockReviewData = {
        id: 789,
        state: 'CHANGES_REQUESTED',
        body: 'Please fix the tests',
      };

      pullsStub.createReview.resolves({ data: mockReviewData });

      // act
      const result = await githubService.requestChanges(
        'owner',
        'repo',
        '1',
        'Please fix the tests',
        'reviewer'
      );

      // assert
      expect(pullsStub.createReview.calledOnce).to.equal(true);
      expect(
        pullsStub.createReview.calledWith({
          owner: 'owner',
          repo: 'repo',
          pull_number: 1,
          event: 'REQUEST_CHANGES',
          body: 'Please fix the tests',
        })
      ).to.equal(true);

      expect(result.id).to.equal(789);
      expect(result.state).to.equal('CHANGES_REQUESTED');
    });

    it('should use default body when none provided', async () => {
      // arrange
      const mockReviewData = { id: 789, state: 'CHANGES_REQUESTED' };
      pullsStub.createReview.resolves({ data: mockReviewData });

      // act
      await githubService.requestChanges(
        'owner',
        'repo',
        '1',
        null,
        'reviewer'
      );

      // assert
      expect(
        pullsStub.createReview.calledWith({
          owner: 'owner',
          repo: 'repo',
          pull_number: 1,
          event: 'REQUEST_CHANGES',
          body: 'Changes requested via Slack by reviewer',
        })
      ).to.equal(true);
    });
  });

  describe('hasWriteAccess', () => {
    it('should return true for admin permission', async () => {
      // arrange
      reposStub.getCollaboratorPermissionLevel.resolves({
        data: { permission: 'admin' },
      });

      // act
      const result = await githubService.hasWriteAccess(
        'owner',
        'repo',
        'username'
      );

      // assert
      expect(result).to.equal(true);
      expect(
        reposStub.getCollaboratorPermissionLevel.calledWith({
          owner: 'owner',
          repo: 'repo',
          username: 'username',
        })
      ).to.equal(true);
    });

    it('should return true for write permission', async () => {
      // arrange
      reposStub.getCollaboratorPermissionLevel.resolves({
        data: { permission: 'write' },
      });

      // act
      const result = await githubService.hasWriteAccess(
        'owner',
        'repo',
        'username'
      );

      // assert
      expect(result).to.equal(true);
    });

    it('should return false for read permission', async () => {
      // arrange
      reposStub.getCollaboratorPermissionLevel.resolves({
        data: { permission: 'read' },
      });

      // act
      const result = await githubService.hasWriteAccess(
        'owner',
        'repo',
        'username'
      );

      // assert
      expect(result).to.equal(false);
    });

    it('should return false when permission check fails', async () => {
      // arrange
      reposStub.getCollaboratorPermissionLevel.rejects(
        new Error('Permission check failed')
      );

      // act
      const result = await githubService.hasWriteAccess(
        'owner',
        'repo',
        'username'
      );

      // assert
      expect(result).to.equal(false);
    });
  });
});
