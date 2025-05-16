module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer', // Analyzes commit messages
    '@semantic-release/release-notes-generator', // Generates release notes
    '@semantic-release/changelog', // Updates the CHANGELOG.md file
    ['@semantic-release/npm', { npmPublish: true, pkgRoot: '.' }], // Publishes to npm, pkgRoot may need adjustment for monorepos
    [
      '@semantic-release/github',
      {
        assets: [
          { path: 'dist/**', label: 'Distribution' }, // Example: adjust if you have artifacts to attach
          { path: 'CHANGELOG.md', label: 'Changelog' },
        ],
      },
    ], // Creates GitHub releases
    [
      '@semantic-release/git',
      {
        // Commits version bump and changelog
        assets: ['package.json', 'pnpm-lock.yaml', 'CHANGELOG.md'], // Adjust if your lockfile is named differently
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
};
