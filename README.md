# Git API CLI

A command-line interface for GitHub that uses the GitHub API instead of git binary.

## Quick Install

```bash
curl https://raw.githubusercontent.com/cheruvian/node-git/refs/heads/main/install.sh > ~/git-install.sh && source ~/git-install.sh
```

## Installation

The quick install command above will:
1. Create a `~/bin` directory if it doesn't exist
2. Download the CLI to `~/bin/git`
3. Make it executable
4. Add it to your PATH for the current session
5. Create a `git` alias for the current session

## Setup

1. Create a GitHub Personal Access Token with repo scope
2. Set the token as an environment variable:
   ```bash
   export GITHUB_TOKEN=your_token_here
   ```
   Or create a `.env` file with:
   ```
   GITHUB_TOKEN=your_token_here
   ```

## Commands

- `git-api init` - Initialize a new repository
- `git-api clone owner/repo` - Clone a repository
- `git-api push <message>` - Push changes with commit message
- `git-api status` - Show working tree status
- `git-api diff [filepath]` - Show changes
- `git-api reset [filepath]` - Reset to last snapshot
- `git-api remote add owner/repo` - Add remote repository
- `git-api remote show` - Show remote info
- `git-api submodule add owner/repo` - Add a submodule
- `git-api submodule status` - Show submodules status
- `git-api submodule push owner/repo` - Push submodule changes

## Features

- Uses GitHub API for operations
- Respects .gitignore patterns
- Supports basic git operations
- Colorized output
- Detailed error messages

## Requirements

- Node.js 16 or higher
- GitHub Personal Access Token
- GitHub account