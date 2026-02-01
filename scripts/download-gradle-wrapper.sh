#!/bin/bash
# Script to download gradle-wrapper.jar for Gradle 8.5
set -e

WRAPPER_DIR="$(cd "$(dirname "$0")/../android/gradle/wrapper" && pwd)"
GRADLE_VERSION="8.5"
ZIP_URL="https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-all.zip"
TMP_DIR="/tmp/gradle-wrapper-download-$$"

mkdir -p "$TMP_DIR"
echo "Downloading Gradle $GRADLE_VERSION..."
curl -L "$ZIP_URL" -o "$TMP_DIR/gradle.zip"


# Extract only gradle-wrapper.jar from the zip
unzip -j "$TMP_DIR/gradle.zip" "gradle-*/bin/gradle/wrapper/gradle-wrapper.jar" -d "$WRAPPER_DIR" >/dev/null

if [ -f "$WRAPPER_DIR/gradle-wrapper.jar" ]; then
  echo "gradle-wrapper.jar copied to $WRAPPER_DIR"
else
  echo "gradle-wrapper.jar not found in the downloaded zip!"
  exit 1
fi

rm -rf "$TMP_DIR"
echo "Done."
