.PHONY: help

APP_NAME ?= `grep 'app:' mix.exs | sed -e 's/\[//g' -e 's/ //g' -e 's/app://' -e 's/[:,]//g'`
APP_VSN ?= `grep 'version:' mix.exs | cut -d '"' -f2`
BUILD ?= `git rev-parse --short HEAD`

help:
	@echo "$(APP_NAME):$(APP_VSN)-$(BUILD)"
	@perl -nle'print $& if m{^[a-zA-Z_-]+:.*?## .*$$}' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Build the Docker image
	docker build --build-arg APP_VSN=$(APP_VSN) \
		-t $(APP_NAME):$(APP_VSN)-$(BUILD) \
		-t $(APP_NAME):latest .

run: ## Run the app in Docker
	docker run -e SECRET_KEY_BASE=${SECRET_KEY_BASE} -e ADMIN_PASS=${ADMIN_PASS} \
		--expose 4000 -p 4000:4000 \
	--rm -it $(APP_NAME):latest

release: ## Push to docker hub
	docker tag $(APP_NAME):latest simmsb/infolab_lights_web:latest
	docker tag $(APP_NAME):$(APP_VSN)-$(BUILD) simmsb/infolab_lights_web:$(APP_VSN)-$(BUILD)
	docker tag $(APP_NAME):latest ghcr.io/simmsb/infolab_lights_web:latest
	docker tag $(APP_NAME):$(APP_VSN)-$(BUILD) ghcr.io/simmsb/infolab_lights_web:$(APP_VSN)-$(BUILD)
	docker push ghcr.io/simmsb/infolab_lights_web
