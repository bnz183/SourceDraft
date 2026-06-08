# Dev Container image — same toolchain as the repository Dockerfile.
# Build context: repository root (see devcontainer.json).

FROM node:22-bookworm-slim

ENV PNPM_HOME=/pnpm
ENV PATH="${PNPM_HOME}:${PATH}"
ENV PLAYWRIGHT_BROWSERS_PATH=/home/node/.cache/ms-playwright

RUN corepack enable \
  && corepack prepare pnpm@11.1.2 --activate

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    gnupg \
  && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
  && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
    > /etc/apt/sources.list.d/github-cli.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends gh \
  && rm -rf /var/lib/apt/lists/*

RUN npx --yes playwright@1.55.0 install-deps chromium

WORKDIR /workspace

RUN mkdir -p /home/node/.cache \
  && chown -R node:node /workspace /home/node

USER node

EXPOSE 5173 8787

CMD ["bash"]
