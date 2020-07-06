.PHONY: help

APP_NAME ?= `grep 'app:' mix.exs | sed -e 's/\[//g' -e 's/ //g' -e 's/app://' -e 's/[:,]//g'`
APP_VSN ?= `grep 'version:' mix.exs | cut -d '"' -f2`
BUILD ?= `git rev-parse --short HEAD`

help:
	@echo "$(APP_NAME):$(APP_VSN)-$(BUILD)"
	@perl -nle'print $& if m{^[a-zA-Z_-]+:.*?## .*$$}' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Build the Docker image
	docker build --build-arg APP_NAME=$(APP_NAME) \
		--build-arg APP_VSN=$(APP_VSN) \
		-t $(APP_NAME):$(APP_VSN)-$(BUILD) \
		-t $(APP_NAME):latest .

run: ## Run the app in Docker
	docker run -e SECRET_KEY_BASE=${SECRET_KEY_BASE} \
		--expose 4000 -p 4000:4000 \
	--rm -it $(APP_NAME):latest

release:
	docker tag $(APP_NAME):latest docker.pkg.github.com/nitros12/something-secret/$(APP_NAME):latest
	docker tag $(APP_NAME):latest nitros12/infolab_lights_web:latest
	docker tag $(APP_NAME):$(APP_VSN)-$(BUILD) docker.pkg.github.com/nitros12/something-secret/$(APP_NAME):$(APP_VSN)-$(BUILD)
	docker push docker.pkg.github.com/nitros12/something-secret/$(APP_NAME):$(APP_VSN)-$(BUILD)
	docker push docker.pkg.github.com/nitros12/something-secret/$(APP_NAME):latest
	docker push nitros12/infolab_lights_web:latest
