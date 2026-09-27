#!/usr/bin/env bash
# Backwards-compatible entry point: the manifests were consolidated into a
# single kustomize tree (base/, components/, overlays/, addons/) deployed by
# deploy-all.sh. All arguments are passed through; see ./deploy-all.sh --help.
exec "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deploy-all.sh" "$@"
