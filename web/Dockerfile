ARG ALPINE_VERSION=3.11.6

FROM elixir:1.10.3-alpine AS builder

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
RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache \
    nodejs \
    yarn \
    git \
    build-base && \
    mix local.rebar --force && \
    mix local.hex --force

# This copies our app source code into the build container
COPY . .

RUN mix do deps.get, deps.compile, compile

# This step builds assets for the Phoenix app (if there is one)
# If you aren't building a Phoenix app, pass `--build-arg SKIP_PHOENIX=true`
# This is mostly here for demonstration purposes
RUN if [ ! "$SKIP_PHOENIX" = "true" ]; then \
    cd ${PHOENIX_SUBDIR}/assets && \
    yarn install && \
    yarn deploy && \
    cd - && \
    mix phx.digest; \
fi

RUN \
    mkdir -p /opt/built && \
    mix release

# From this line onwards, we're in a new image, which will be the image used in production
FROM alpine:${ALPINE_VERSION}

RUN apk update && \
    apk add --no-cache \
    bash \
    openssl-dev

WORKDIR /opt/app

COPY --from=builder /opt/app/_build .

CMD ["./prod/rel/infolab_light_games/bin/infolab_light_games", "start"]
