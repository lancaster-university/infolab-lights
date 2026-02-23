ARG ELIXIR_VERSION=1.15.6
ARG OTP_VERSION=26.1
ARG DEBIAN_VERSION=bookworm-20230612-slim

ARG BUILDER_IMAGE="hexpm/elixir:${ELIXIR_VERSION}-erlang-${OTP_VERSION}-debian-${DEBIAN_VERSION}"
ARG RUNNER_IMAGE="debian:${DEBIAN_VERSION}"

FROM rust:1.82 as rust
# install build dependencies
RUN apt-get update -y && apt-get install -y build-essential git \
    && apt-get clean && rm -f /var/lib/apt/lists/*_*

WORKDIR /app
COPY native/matrix ./
RUN cargo rustc --release

FROM ${BUILDER_IMAGE} as builder

RUN apt-get update -y && apt-get install -y --no-install-recommends build-essential git \
  && apt-get clean && rm -f /var/lib/apt/lists/*_*

# install node
# https://github.com/nodejs/docker-node/blob/230b9852645e170167a2aac1cfa246d069c23cc3/20/bookworm-slim/Dockerfile

ENV NODE_VERSION 20.8.0

RUN ARCH= && dpkgArch="$(dpkg --print-architecture)" \
    && case "${dpkgArch##*-}" in \
      amd64) ARCH='x64';; \
      ppc64el) ARCH='ppc64le';; \
      s390x) ARCH='s390x';; \
      arm64) ARCH='arm64';; \
      armhf) ARCH='armv7l';; \
      i386) ARCH='x86';; \
      *) echo "unsupported architecture"; exit 1 ;; \
    esac \
    && set -ex \
    # libatomic1 for arm
    && apt-get update && apt-get install -y ca-certificates curl wget xz-utils libatomic1 --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-$ARCH.tar.xz" \
    && curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt" \
    && grep " node-v$NODE_VERSION-linux-$ARCH.tar.xz\$" SHASUMS256.txt | sha256sum -c - \
    && tar -xJf "node-v$NODE_VERSION-linux-$ARCH.tar.xz" -C /usr/local --strip-components=1 --no-same-owner \
    && rm "node-v$NODE_VERSION-linux-$ARCH.tar.xz" SHASUMS256.txt \
    && apt-mark auto '.*' > /dev/null \
    && find /usr/local -type f -executable -exec ldd '{}' ';' \
      | awk '/=>/ { so = $(NF-1); if (index(so, "/usr/local/") == 1) { next }; gsub("^/(usr/)?", "", so); print so }' \
      | sort -u \
      | xargs -r dpkg-query --search \
      | cut -d: -f1 \
      | sort -u \
      | xargs -r apt-mark manual \
    && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
    && ln -s /usr/local/bin/node /usr/local/bin/nodejs \
    # smoke tests
    && node --version \
    && npm --version

ENV YARN_VERSION 1.22.19

RUN set -ex \
  && savedAptMark="$(apt-mark showmanual)" \
  && apt-get update && apt-get install -y ca-certificates curl wget gnupg dirmngr --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && curl -fsSL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --import \
  && curl -fsSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz" \
  && curl -fsSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz.asc" \
  && gpg --batch --verify yarn-v$YARN_VERSION.tar.gz.asc yarn-v$YARN_VERSION.tar.gz \
  && mkdir -p /opt \
  && tar -xzf yarn-v$YARN_VERSION.tar.gz -C /opt/ \
  && ln -s /opt/yarn-v$YARN_VERSION/bin/yarn /usr/local/bin/yarn \
  && ln -s /opt/yarn-v$YARN_VERSION/bin/yarnpkg /usr/local/bin/yarnpkg \
  && rm yarn-v$YARN_VERSION.tar.gz.asc yarn-v$YARN_VERSION.tar.gz \
  && apt-mark auto '.*' > /dev/null \
  && { [ -z "$savedAptMark" ] || apt-mark manual $savedAptMark > /dev/null; } \
  && find /usr/local -type f -executable -exec ldd '{}' ';' \
    | awk '/=>/ { so = $(NF-1); if (index(so, "/usr/local/") == 1) { next }; gsub("^/(usr/)?", "", so); print so }' \
    | sort -u \
    | xargs -r dpkg-query --search \
    | cut -d: -f1 \
    | sort -u \
    | xargs -r apt-mark manual \
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  # smoke test
  && yarn --version

# The version of the application we are building (required)
ARG APP_VSN
# The environment to build with
ARG MIX_ENV=prod
# Set this to true if this release is not a Phoenix app
ARG SKIP_PHOENIX=false
# If you are using an umbrella project, you can change this
# argument to the directory the Phoenix app is in so that the assets
# can be built
ARG PHOENIX_SUBDIR=.

ENV SKIP_PHOENIX=${SKIP_PHOENIX} \
    APP_VSN=${APP_VSN} \
    MIX_ENV=${MIX_ENV}

# By convention, /opt is typically used for applications
WORKDIR /opt/app

# This step installs all the build tools we'll need
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        git \
        python3 \
        build-essential \
        && \
    mix local.rebar --force && \
    mix local.hex --force && \
    rm -rf /var/lib/apt/lists/*;

RUN apt-get update; \
    apt-get install -y --no-install-recommends \
        ca-certificates \
    && update-ca-certificates

# This copies our app source code into the build container
COPY mix.exs mix.lock .

COPY --from=rust /app/target/release/libmatrix.so priv/native/libmatrix.so
RUN mix do deps.get, deps.compile

COPY assets/ assets/
COPY config/ config/
COPY native/ native/
COPY rel/ rel/
COPY lib/ lib/
COPY priv/ priv/

RUN mix compile

# This step builds assets for the Phoenix app (if there is one)
# If you aren't building a Phoenix app, pass `--build-arg SKIP_PHOENIX=true`
# This is mostly here for demonstration purposes
RUN if [ ! "$SKIP_PHOENIX" = "true" ]; then \
    cd ${PHOENIX_SUBDIR}/assets && \
    yarn install && \
    yarn deploy && \
    cd - && \
    mix phx.digest; \
    mix phx.swagger.generate; \
fi

RUN \
    mkdir -p /opt/built && \
    mix release

# From this line onwards, we're in a new image, which will be the image used in production
FROM ${RUNNER_IMAGE}
LABEL org.opencontainers.image.source https://github.com/lancaster-university/infolab-lights

ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        libssl-dev \
        locales \
        && \
    rm -rf /var/lib/apt/lists/*;

WORKDIR /opt/app/_build

COPY --from=builder /opt/app/_build .

COPY --from=denoland/deno:bin-1.16.3 /deno /usr/local/bin/deno

RUN rm prod/lib/exile/priv && \
    mkdir prod/lib/exile/priv/ && \
    cp prod/rel/infolab_light_games/lib/exile-0.11.0/priv/spawner prod/lib/exile/priv/spawner

CMD ["./prod/rel/infolab_light_games/bin/infolab_light_games", "start"]
