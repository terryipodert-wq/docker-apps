/**
 * QEMU JNI Wrapper
 * Native C code to interface with QEMU binary
 */

#include <jni.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <signal.h>
#include <android/log.h>

#define TAG "QemuJNI"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, TAG, __VA_ARGS__)
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, TAG, __VA_ARGS__)

// QEMU process state
typedef struct {
    pid_t pid;
    int running;
    char data_dir[512];
    int ram_mb;
    int cpu_cores;
    long start_time;
} QemuState;

static QemuState* qemu_state = NULL;

/**
 * Get current time in milliseconds
 */
static long get_current_time_ms() {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return ts.tv_sec * 1000 + ts.tv_nsec / 1000000;
}

/**
 * Initialize QEMU state
 * Returns handle (pointer) to state structure
 */
JNIEXPORT jlong JNICALL
Java_com_dockerandroid_qemu_QemuModule_nativeInit(
    JNIEnv *env,
    jobject thiz,
    jstring data_dir,
    jobjectArray args
) {
    LOGI("nativeInit called");
    
    // Allocate state
    if (qemu_state == NULL) {
        qemu_state = (QemuState*)calloc(1, sizeof(QemuState));
        if (qemu_state == NULL) {
            LOGE("Failed to allocate QEMU state");
            return 0;
        }
    }
    
    // Copy data directory
    const char* dir = (*env)->GetStringUTFChars(env, data_dir, NULL);
    strncpy(qemu_state->data_dir, dir, sizeof(qemu_state->data_dir) - 1);
    (*env)->ReleaseStringUTFChars(env, data_dir, dir);
    
    qemu_state->running = 0;
    qemu_state->pid = -1;
    
    LOGI("QEMU initialized with data_dir: %s", qemu_state->data_dir);
    
    return (jlong)(intptr_t)qemu_state;
}

/**
 * Start QEMU process
 */
JNIEXPORT jint JNICALL
Java_com_dockerandroid_qemu_QemuModule_nativeStart(
    JNIEnv *env,
    jobject thiz,
    jlong handle
) {
    LOGI("nativeStart called");
    
    QemuState* state = (QemuState*)(intptr_t)handle;
    if (state == NULL) {
        LOGE("Invalid handle");
        return -1;
    }
    
    if (state->running) {
        LOGD("QEMU already running");
        return 0;
    }
    
    // Fork and exec QEMU
    pid_t pid = fork();
    
    if (pid < 0) {
        LOGE("Fork failed");
        return -1;
    }
    
    if (pid == 0) {
        // Child process - execute QEMU
        char qemu_path[1024];
        char disk_path[1024];
        char iso_path[1024];
        char ram_str[32];
        char smp_str[32];
        
        snprintf(qemu_path, sizeof(qemu_path), "%s/../lib/libqemu-system-x86_64.so", state->data_dir);
        snprintf(disk_path, sizeof(disk_path), "%s/alpine-disk.qcow2", state->data_dir);
        snprintf(iso_path, sizeof(iso_path), "%s/alpine-virt.iso", state->data_dir);
        snprintf(ram_str, sizeof(ram_str), "%d", state->ram_mb > 0 ? state->ram_mb : 2048);
        snprintf(smp_str, sizeof(smp_str), "%d", state->cpu_cores > 0 ? state->cpu_cores : 2);
        
        // Execute QEMU with arguments
        execl(qemu_path, "qemu-system-x86_64",
            "-machine", "q35,accel=tcg",
            "-cpu", "max",
            "-m", ram_str,
            "-smp", smp_str,
            "-display", "none",
            "-serial", "stdio",
            "-drive", disk_path,
            "-cdrom", iso_path,
            "-netdev", "user,id=net0,hostfwd=tcp::2375-:2375,hostfwd=tcp::2222-:22,hostfwd=tcp::8080-:8080",
            "-device", "virtio-net-pci,netdev=net0",
            NULL
        );
        
        // If exec fails
        LOGE("Failed to execute QEMU");
        _exit(1);
    }
    
    // Parent process
    state->pid = pid;
    state->running = 1;
    state->start_time = get_current_time_ms();
    
    LOGI("QEMU started with PID: %d", pid);
    
    return 0;
}

/**
 * Stop QEMU process
 */
JNIEXPORT jint JNICALL
Java_com_dockerandroid_qemu_QemuModule_nativeStop(
    JNIEnv *env,
    jobject thiz,
    jlong handle
) {
    LOGI("nativeStop called");
    
    QemuState* state = (QemuState*)(intptr_t)handle;
    if (state == NULL) {
        LOGE("Invalid handle");
        return -1;
    }
    
    if (!state->running || state->pid <= 0) {
        LOGD("QEMU not running");
        return 0;
    }
    
    // Send SIGTERM first
    if (kill(state->pid, SIGTERM) != 0) {
        LOGE("Failed to send SIGTERM");
    }
    
    // Wait for process to exit (with timeout)
    int status;
    int wait_count = 0;
    while (wait_count < 50) { // 5 seconds timeout
        pid_t result = waitpid(state->pid, &status, WNOHANG);
        if (result == state->pid) {
            break;
        }
        if (result < 0) {
            break;
        }
        usleep(100000); // 100ms
        wait_count++;
    }
    
    // Force kill if still running
    if (wait_count >= 50) {
        LOGD("Force killing QEMU");
        kill(state->pid, SIGKILL);
        waitpid(state->pid, &status, 0);
    }
    
    state->running = 0;
    state->pid = -1;
    state->start_time = 0;
    
    LOGI("QEMU stopped");
    
    return 0;
}

/**
 * Get QEMU status
 * Returns: 0 = stopped, 1 = running, -1 = error
 */
JNIEXPORT jint JNICALL
Java_com_dockerandroid_qemu_QemuModule_nativeGetStatus(
    JNIEnv *env,
    jobject thiz,
    jlong handle
) {
    QemuState* state = (QemuState*)(intptr_t)handle;
    if (state == NULL) {
        return -1;
    }
    
    if (!state->running || state->pid <= 0) {
        return 0;
    }
    
    // Check if process is still alive
    int status;
    pid_t result = waitpid(state->pid, &status, WNOHANG);
    
    if (result == state->pid) {
        // Process has exited
        state->running = 0;
        state->pid = -1;
        return 0;
    }
    
    if (result < 0) {
        // Error or process doesn't exist
        state->running = 0;
        state->pid = -1;
        return 0;
    }
    
    return 1; // Running
}

/**
 * Get QEMU logs
 */
JNIEXPORT jstring JNICALL
Java_com_dockerandroid_qemu_QemuModule_nativeGetLogs(
    JNIEnv *env,
    jobject thiz,
    jlong handle,
    jint lines
) {
    QemuState* state = (QemuState*)(intptr_t)handle;
    if (state == NULL) {
        return (*env)->NewStringUTF(env, "");
    }
    
    // Read from log file
    char log_path[1024];
    snprintf(log_path, sizeof(log_path), "%s/vm.log", state->data_dir);
    
    FILE* f = fopen(log_path, "r");
    if (f == NULL) {
        return (*env)->NewStringUTF(env, "No logs available");
    }
    
    // Simple implementation - read entire file
    fseek(f, 0, SEEK_END);
    long size = ftell(f);
    fseek(f, 0, SEEK_SET);
    
    // Limit to last 10KB
    if (size > 10240) {
        fseek(f, size - 10240, SEEK_SET);
        size = 10240;
    }
    
    char* buffer = (char*)malloc(size + 1);
    if (buffer == NULL) {
        fclose(f);
        return (*env)->NewStringUTF(env, "Memory error");
    }
    
    size_t read = fread(buffer, 1, size, f);
    buffer[read] = '\0';
    fclose(f);
    
    jstring result = (*env)->NewStringUTF(env, buffer);
    free(buffer);
    
    return result;
}

/**
 * Send command to QEMU (via QMP or monitor)
 */
JNIEXPORT jint JNICALL
Java_com_dockerandroid_qemu_QemuModule_nativeSendCommand(
    JNIEnv *env,
    jobject thiz,
    jlong handle,
    jstring command
) {
    QemuState* state = (QemuState*)(intptr_t)handle;
    if (state == NULL || !state->running) {
        return -1;
    }
    
    const char* cmd = (*env)->GetStringUTFChars(env, command, NULL);
    LOGD("Sending command: %s", cmd);
    
    // In a real implementation, this would send to QMP socket
    // For now, just log it
    
    (*env)->ReleaseStringUTFChars(env, command, cmd);
    
    return 0;
}

/**
 * Cleanup QEMU state
 */
JNIEXPORT void JNICALL
Java_com_dockerandroid_qemu_QemuModule_nativeCleanup(
    JNIEnv *env,
    jobject thiz,
    jlong handle
) {
    LOGI("nativeCleanup called");
    
    QemuState* state = (QemuState*)(intptr_t)handle;
    if (state == NULL) {
        return;
    }
    
    // Stop if running
    if (state->running) {
        Java_com_dockerandroid_qemu_QemuModule_nativeStop(env, thiz, handle);
    }
    
    // Free state
    free(state);
    qemu_state = NULL;
    
    LOGI("QEMU cleanup complete");
}

/**
 * JNI_OnLoad - Called when native library is loaded
 */
JNIEXPORT jint JNI_OnLoad(JavaVM *vm, void *reserved) {
    LOGI("QemuJNI library loaded");
    return JNI_VERSION_1_6;
}
