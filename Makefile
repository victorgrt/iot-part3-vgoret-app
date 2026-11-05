IMAGE ?= vgoret/webapp
VERSION ?=
TAG = v$(VERSION)

.PHONY: check-version build push release

check-version:
	@printf '%s\n' "$(VERSION)" | grep -Eq '^[0-9]+(\.[0-9]+){1,2}$$' || { \
		echo "Set VERSION to a numeric version such as 2.3 or 2.3.0 (without the v prefix)." >&2; \
		exit 1; \
	}

build: check-version
	docker build --build-arg APP_VERSION="$(VERSION)" --tag "$(IMAGE):$(TAG)" .

push: build
	docker push "$(IMAGE):$(TAG)"

release: push
	sed -i -E 's#(^[[:space:]]*image: ).*#\1$(IMAGE):$(TAG)#' dev/deployment.yaml