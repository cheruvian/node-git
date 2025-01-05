mkdir -p ~/bin \
  && curl https://raw.githubusercontent.com/cheruvian/node-git/refs/heads/main/dist/cli.js > ~/bin/git \
  && chmod +x ~/bin/git \
  && alias git=~/bin/git
