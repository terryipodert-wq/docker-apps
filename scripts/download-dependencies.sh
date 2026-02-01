#!/bin/bash
# download-dependencies.sh
# Downloads external dependencies for Docker Android
# Run this locally or in CI to prepare build dependencies

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Configuration
ALPINE_VERSION="${ALPINE_VERSION:-3.19.1}"
ALPINE_ISO_URL="https://dl-cdn.alpinelinux.org/alpine/v3.19/releases/x86_64/alpine-virt-${ALPINE_VERSION}-x86_64.iso"
DISK_SIZE_GB="${DISK_SIZE_GB:-10}"

# Directories
DEPS_DIR="${PROJECT_DIR}/deps"
ASSETS_DIR="${PROJECT_DIR}/android/app/src/main/assets"
JNILIBS_DIR="${PROJECT_DIR}/android/app/src/main/jniLibs"

echo "================================================"
echo "Docker Android - Dependency Downloader"
echo "================================================"
echo ""
echo "Alpine Version: ${ALPINE_VERSION}"
echo "Disk Size: ${DISK_SIZE_GB}GB"
echo "Project Dir: ${PROJECT_DIR}"
echo ""

# Create directories
mkdir -p "${DEPS_DIR}"
mkdir -p "${ASSETS_DIR}"
mkdir -p "${JNILIBS_DIR}/arm64-v8a"
mkdir -p "${JNILIBS_DIR}/armeabi-v7a"

# Function: Download Alpine ISO
download_alpine_iso() {
    local ISO_FILE="${DEPS_DIR}/alpine-virt.iso"
    
    if [ -f "${ISO_FILE}" ]; then
        echo "[SKIP] Alpine ISO already exists"
        return 0
    fi
    
    echo "[DOWNLOAD] Alpine Linux v${ALPINE_VERSION}..."
    curl -L -o "${ISO_FILE}" "${ALPINE_ISO_URL}"
    
    # Verify download
    if [ -f "${ISO_FILE}" ] && [ -s "${ISO_FILE}" ]; then
        echo "[OK] Alpine ISO downloaded ($(du -h "${ISO_FILE}" | cut -f1))"
    else
        echo "[ERROR] Failed to download Alpine ISO"
        return 1
    fi
}

# Function: Create QCOW2 disk
create_disk_image() {
    local DISK_FILE="${DEPS_DIR}/alpine-disk.qcow2"
    
    if [ -f "${DISK_FILE}" ]; then
        echo "[SKIP] Disk image already exists"
        return 0
    fi
    
    # Check for qemu-img
    if ! command -v qemu-img &> /dev/null; then
        echo "[WARN] qemu-img not found, attempting to install..."
        
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y qemu-utils
        elif command -v brew &> /dev/null; then
            brew install qemu
        else
            echo "[ERROR] Cannot install qemu-img. Please install qemu-utils manually."
            return 1
        fi
    fi
    
    echo "[CREATE] QCOW2 disk image (${DISK_SIZE_GB}GB)..."
    qemu-img create -f qcow2 "${DISK_FILE}" "${DISK_SIZE_GB}G"
    
    if [ -f "${DISK_FILE}" ]; then
        echo "[OK] Disk image created ($(du -h "${DISK_FILE}" | cut -f1))"
    else
        echo "[ERROR] Failed to create disk image"
        return 1
    fi
}

# Function: Download QEMU binary
download_qemu_binary() {
    local QEMU_FILE="${DEPS_DIR}/libqemu-system-x86_64.so"
    
    if [ -f "${QEMU_FILE}" ] && [ -s "${QEMU_FILE}" ]; then
        echo "[SKIP] QEMU binary already exists"
        return 0
    fi
    
    echo "[DOWNLOAD] QEMU binary for Android..."
    
    # Try Limbo Emulator release
    local LIMBO_RELEASES="https://api.github.com/repos/nicholasopuni31/limbo-android/releases/latest"
    local APK_URL=$(curl -s "${LIMBO_RELEASES}" | grep -o '"browser_download_url": *"[^"]*\.apk"' | head -1 | cut -d'"' -f4)
    
    if [ -n "${APK_URL}" ]; then
        echo "  Found Limbo APK: ${APK_URL}"
        
        local TMP_APK="/tmp/limbo-temp.apk"
        curl -L -o "${TMP_APK}" "${APK_URL}"
        
        if [ -f "${TMP_APK}" ]; then
            # Extract QEMU binary from APK
            local EXTRACT_DIR="/tmp/limbo-extract"
            mkdir -p "${EXTRACT_DIR}"
            unzip -q -o "${TMP_APK}" -d "${EXTRACT_DIR}" 2>/dev/null || true
            
            # Find and copy QEMU binary
            local FOUND_QEMU=$(find "${EXTRACT_DIR}" -name "libqemu-system-x86_64.so" | head -1)
            
            if [ -n "${FOUND_QEMU}" ] && [ -f "${FOUND_QEMU}" ]; then
                cp "${FOUND_QEMU}" "${QEMU_FILE}"
                echo "[OK] QEMU binary extracted"
            fi
            
            # Cleanup
            rm -rf "${TMP_APK}" "${EXTRACT_DIR}"
        fi
    fi
    
    # Check if we got the binary
    if [ ! -f "${QEMU_FILE}" ] || [ ! -s "${QEMU_FILE}" ]; then
        echo "[WARN] Could not download QEMU binary automatically."
        echo ""
        echo "Please manually download QEMU binary from one of these sources:"
        echo "  1. Limbo Emulator: https://github.com/nicholasopuni31/limbo-android/releases"
        echo "  2. Build from source using the build-qemu workflow"
        echo ""
        echo "Place the binary at: ${QEMU_FILE}"
        
        # Create placeholder
        touch "${QEMU_FILE}"
        return 1
    fi
}

# Function: Copy to Android project
copy_to_android() {
    echo ""
    echo "[COPY] Dependencies to Android project..."
    
    # Copy ISO
    if [ -f "${DEPS_DIR}/alpine-virt.iso" ]; then
        cp "${DEPS_DIR}/alpine-virt.iso" "${ASSETS_DIR}/"
        echo "  ✓ alpine-virt.iso -> assets/"
    fi
    
    # Copy disk
    if [ -f "${DEPS_DIR}/alpine-disk.qcow2" ]; then
        cp "${DEPS_DIR}/alpine-disk.qcow2" "${ASSETS_DIR}/"
        echo "  ✓ alpine-disk.qcow2 -> assets/"
    fi
    
    # Copy QEMU binary
    if [ -f "${DEPS_DIR}/libqemu-system-x86_64.so" ] && [ -s "${DEPS_DIR}/libqemu-system-x86_64.so" ]; then
        cp "${DEPS_DIR}/libqemu-system-x86_64.so" "${JNILIBS_DIR}/arm64-v8a/"
        echo "  ✓ libqemu-system-x86_64.so -> jniLibs/arm64-v8a/"
    fi
    
    echo ""
    echo "Android assets:"
    ls -lh "${ASSETS_DIR}/" 2>/dev/null || echo "  (empty)"
    echo ""
    echo "Android jniLibs:"
    ls -lh "${JNILIBS_DIR}/arm64-v8a/" 2>/dev/null || echo "  (empty)"
}

# Function: Verify setup
verify_setup() {
    echo ""
    echo "================================================"
    echo "Verification"
    echo "================================================"
    
    local ALL_OK=true
    
    if [ -f "${ASSETS_DIR}/alpine-virt.iso" ]; then
        echo "✓ Alpine ISO ready"
    else
        echo "✗ Alpine ISO missing"
        ALL_OK=false
    fi
    
    if [ -f "${ASSETS_DIR}/alpine-disk.qcow2" ]; then
        echo "✓ Disk image ready"
    else
        echo "✗ Disk image missing"
        ALL_OK=false
    fi
    
    if [ -f "${JNILIBS_DIR}/arm64-v8a/libqemu-system-x86_64.so" ] && \
       [ -s "${JNILIBS_DIR}/arm64-v8a/libqemu-system-x86_64.so" ]; then
        echo "✓ QEMU binary ready"
    else
        echo "✗ QEMU binary missing or empty"
        ALL_OK=false
    fi
    
    echo ""
    
    if [ "${ALL_OK}" = true ]; then
        echo "All dependencies ready! You can now build the APK."
    else
        echo "Some dependencies are missing. Please resolve before building."
        return 1
    fi
}

# Main
main() {
    echo "Starting dependency download..."
    echo ""
    
    download_alpine_iso
    create_disk_image
    download_qemu_binary
    copy_to_android
    verify_setup
    
    echo ""
    echo "Done!"
}

# Run
main "$@"