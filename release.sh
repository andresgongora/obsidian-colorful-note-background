#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

##==================================================================================================
##	DEPENDENCY CHECKS
##==================================================================================================

requireCommand() { command -v "$1" >/dev/null 2>&1 || { printf "Abort: '%s' not found\n" "$1" >&2; exit 1; }; }

requireCommand npm
requireCommand git
requireCommand gh
requireCommand jq

##==================================================================================================
##	GLOBALS
##==================================================================================================

declare -r SCRIPT_NAME="${0##*/}"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
declare -r SCRIPT_DIR

declare -r MANIFEST_FILE="$SCRIPT_DIR/manifest.json"
declare -r CHANGELOG_FILE="$SCRIPT_DIR/CHANGELOG.md"

##==================================================================================================
##	UTILITIES
##==================================================================================================

die() { printf '%s: %s\n' "$SCRIPT_NAME" "$1" >&2; exit "${2:-1}"; } # Exit with message.

##==================================================================================================
##	CORE FUNCTIONS
##==================================================================================================

##--------------------------------------------------------------------------------------------------
## Preconditions
##--------------------------------------------------------------------------------------------------

## @brief Abort if the working tree has uncommitted changes.
requireCleanWorkingTree() {
    [[ -z "$(git -C "$SCRIPT_DIR" status --porcelain)" ]] || die "working tree has uncommitted changes"
}

##--------------------------------------------------------------------------------------------------
## Build and verify
##--------------------------------------------------------------------------------------------------

## @brief Install dependencies, lint, run tests when present, and build the plugin.
verifyAndBuild() {
    (cd "$SCRIPT_DIR" && npm install)
    (cd "$SCRIPT_DIR" && npm run lint)
    (cd "$SCRIPT_DIR" && npm run --if-present test)
    (cd "$SCRIPT_DIR" && npm run build)
}

##--------------------------------------------------------------------------------------------------
## Version and publish
##--------------------------------------------------------------------------------------------------

## @brief Bump the npm/manifest version (patch) via the project's own version script.
bumpVersion() {
    (cd "$SCRIPT_DIR" && npm version patch)
}

## @brief Push the current branch and its tags to origin.
pushRelease() {
    local current_branch
    current_branch="$(git -C "$SCRIPT_DIR" rev-parse --abbrev-ref HEAD)"
    git -C "$SCRIPT_DIR" push origin "$current_branch" --tags
}

## @brief Read the plugin version from manifest.json.
readManifestVersion() {
    jq -r '.version' "$MANIFEST_FILE"
}

## @brief Build the list of release assets that actually exist in the repo.
collectReleaseAssets() {
    local -a assets=()
    local candidate
    for candidate in "$MANIFEST_FILE" "$SCRIPT_DIR/main.js" "$SCRIPT_DIR/styles.css"; do
        [[ -f "$candidate" ]] && assets+=("$candidate")
    done
    printf '%s\n' "${assets[@]}"
}

## @brief Create the GitHub release for the given version with the discovered assets.
createGithubRelease() {
    local version="$1"
    local -a assets=()
    while IFS= read -r asset; do
        assets+=("$asset")
    done < <(collectReleaseAssets)

    [[ ${#assets[@]} -gt 0 ]] || die "no release assets found (expected manifest.json at minimum)"

    gh release create "$version" -F "$CHANGELOG_FILE" "${assets[@]}"
}

##==================================================================================================
##	MAIN
##==================================================================================================

main() {
    requireCleanWorkingTree
    verifyAndBuild
    bumpVersion
    pushRelease

    local version
    version="$(readManifestVersion)"
    createGithubRelease "$version"
}

##==================================================================================================
##	SCRIPT ENTRY POINT
##==================================================================================================

main
