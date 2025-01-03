# GitHub CLI

A command-line interface for GitHub that uses the GitHub API instead of git binary.

## Setup

1. Create a GitHub Personal Access Token with repo scope
2. Copy `.env.example` to `.env` and add your token and username
3. Install dependencies: `npm install`

## Commands

- `npm start clone owner/repo` - Clone a repository
- `npm start add [files...]` - Add files to staging
- `npm start remove [files...]` - Remove files from staging
- `npm start status` - Show working tree status
- `npm start commit <message>` - Commit staged changes
- `npm start diff [filepath]` - Show changes between working tree and staging

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