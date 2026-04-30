FROM rust:1.82 AS builder

RUN apt-get update -y && apt-get install -y --no-install-recommends \
    pkg-config \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cache dependencies separately from source
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo 'fn main() {}' > src/main.rs && \
    cargo build --release && \
    rm -rf src

COPY src ./src
# Touch main.rs so cargo knows to rebuild
RUN touch src/main.rs && cargo build --release


FROM debian:bookworm-slim

RUN apt-get update -y && apt-get install -y --no-install-recommends \
    ca-certificates \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/infolab-light-controller /usr/local/bin/infolab-light-controller

ENTRYPOINT ["/usr/local/bin/infolab-light-controller"]
