# Android.mk - NDK Build configuration for QEMU JNI wrapper

LOCAL_PATH := $(call my-dir)

# Build qemu-jni shared library
include $(CLEAR_VARS)

LOCAL_MODULE := qemu-jni
LOCAL_SRC_FILES := qemu_jni.c

LOCAL_LDLIBS := -llog -landroid
LOCAL_CFLAGS := -Wall -Wextra -O2

include $(BUILD_SHARED_LIBRARY)
