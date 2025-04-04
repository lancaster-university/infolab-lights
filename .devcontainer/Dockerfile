FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Install Elixir and Erlang from Ubuntu repositories
RUN apt-get update && \
    apt-get install -y erlang elixir && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Docker CLI
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      docker.io && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Add user vscode to docker group
RUN usermod -aG docker vscode

# Install Rust for vscode user
USER vscode
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/home/vscode/.cargo/bin:${PATH}"

# Install cross for cross compilation
RUN cargo install cross

# Switch back to root for any additional setup
USER root