package com.dockerandroid.qemu;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * QemuModule - Native module for QEMU VM control
 * Provides React Native bridge to control Alpine Linux VM running Docker
 */
public class QemuModule extends ReactContextBaseJavaModule {
    private static final String TAG = "QemuModule";
    private static final String MODULE_NAME = "QemuModule";
    
    private final ReactApplicationContext reactContext;
    private QemuManager qemuManager;
    private boolean isInitialized = false;
    
    // Native JNI methods (implemented in qemu_jni.c)
    private static native long nativeInit(String dataDir, String[] args);
    private static native int nativeStart(long handle);
    private static native int nativeStop(long handle);
    private static native int nativeGetStatus(long handle);
    private static native String nativeGetLogs(long handle, int lines);
    private static native void nativeCleanup(long handle);
    private static native int nativeSendCommand(long handle, String command);
    
    // Load native library
    static {
        try {
            System.loadLibrary("qemu-jni");
            Log.d(TAG, "Native library qemu-jni loaded successfully");
        } catch (UnsatisfiedLinkError e) {
            Log.e(TAG, "Failed to load native library qemu-jni: " + e.getMessage());
        }
    }
    
    public QemuModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
        this.qemuManager = new QemuManager(context);
    }
    
    @Override
    @NonNull
    public String getName() {
        return MODULE_NAME;
    }
    
    /**
     * Send events to React Native
     */
    private void sendEvent(String eventName, WritableMap params) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
        }
    }
    
    /**
     * Initialize QEMU environment
     * - Creates QEMU directory structure
     * - Copies Alpine ISO from assets
     * - Creates virtual disk image
     */
    @ReactMethod
    public void initialize(Promise promise) {
        try {
            Log.d(TAG, "Initializing QEMU environment...");
            
            Context context = getReactApplicationContext();
            File dataDir = context.getFilesDir();
            
            // Create QEMU directory
            File qemuDir = new File(dataDir, "qemu");
            if (!qemuDir.exists()) {
                boolean created = qemuDir.mkdirs();
                if (!created) {
                    throw new IOException("Failed to create QEMU directory");
                }
            }
            
            // Copy Alpine ISO from assets if not exists
            File isoFile = new File(qemuDir, "alpine-virt.iso");
            if (!isoFile.exists()) {
                Log.d(TAG, "Copying Alpine ISO from assets...");
                copyAssetToFile(context, "alpine-virt.iso", isoFile);
            }
            
            // Create virtual disk image if not exists
            File diskFile = new File(qemuDir, "alpine-disk.qcow2");
            if (!diskFile.exists()) {
                Log.d(TAG, "Creating virtual disk image...");
                createQcow2Disk(diskFile.getAbsolutePath(), 10 * 1024); // 10GB
            }
            
            // Copy QEMU configuration
            File configFile = new File(qemuDir, "qemu-config.json");
            if (!configFile.exists()) {
                createDefaultConfig(configFile);
            }
            
            isInitialized = true;
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putString("qemuDir", qemuDir.getAbsolutePath());
            result.putString("isoPath", isoFile.getAbsolutePath());
            result.putString("diskPath", diskFile.getAbsolutePath());
            result.putString("configPath", configFile.getAbsolutePath());
            
            // Send initialization event
            WritableMap event = Arguments.createMap();
            event.putString("status", "initialized");
            sendEvent("vmStatus", event);
            
            promise.resolve(result);
            
        } catch (Exception e) {
            Log.e(TAG, "Initialization failed: " + e.getMessage(), e);
            promise.reject("INIT_ERROR", "Failed to initialize QEMU: " + e.getMessage());
        }
    }
    
    /**
     * Start the Alpine Linux VM
     * @param ramMB RAM allocation in MB
     * @param cpuCores Number of CPU cores
     */
    @ReactMethod
    public void startVM(int ramMB, int cpuCores, Promise promise) {
        try {
            if (!isInitialized) {
                promise.reject("NOT_INITIALIZED", "QEMU not initialized. Call initialize() first.");
                return;
            }
            
            Log.d(TAG, "Starting VM with " + ramMB + "MB RAM and " + cpuCores + " CPU cores");
            
            // Send starting event
            WritableMap startingEvent = Arguments.createMap();
            startingEvent.putString("status", "starting");
            sendEvent("vmStatus", startingEvent);
            
            // Start QEMU service
            Context context = getReactApplicationContext();
            Intent serviceIntent = new Intent(context, QemuService.class);
            serviceIntent.setAction(QemuService.ACTION_START);
            serviceIntent.putExtra(QemuService.EXTRA_RAM_MB, ramMB);
            serviceIntent.putExtra(QemuService.EXTRA_CPU_CORES, cpuCores);
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent);
            } else {
                context.startService(serviceIntent);
            }
            
            // Wait for VM to start (simplified - in production use proper callback)
            new Thread(() -> {
                try {
                    Thread.sleep(3000); // Wait for boot
                    
                    WritableMap runningEvent = Arguments.createMap();
                    runningEvent.putString("status", "running");
                    sendEvent("vmStatus", runningEvent);
                    
                } catch (InterruptedException e) {
                    Log.e(TAG, "Start wait interrupted", e);
                }
            }).start();
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putString("message", "VM starting...");
            
            promise.resolve(result);
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to start VM: " + e.getMessage(), e);
            
            WritableMap errorEvent = Arguments.createMap();
            errorEvent.putString("status", "error");
            errorEvent.putString("message", e.getMessage());
            sendEvent("vmError", errorEvent);
            
            promise.reject("START_ERROR", "Failed to start VM: " + e.getMessage());
        }
    }
    
    /**
     * Stop the running VM
     */
    @ReactMethod
    public void stopVM(Promise promise) {
        try {
            Log.d(TAG, "Stopping VM...");
            
            // Send stopping event
            WritableMap stoppingEvent = Arguments.createMap();
            stoppingEvent.putString("status", "stopping");
            sendEvent("vmStatus", stoppingEvent);
            
            // Stop QEMU service
            Context context = getReactApplicationContext();
            Intent serviceIntent = new Intent(context, QemuService.class);
            serviceIntent.setAction(QemuService.ACTION_STOP);
            context.startService(serviceIntent);
            
            // Send stopped event
            WritableMap stoppedEvent = Arguments.createMap();
            stoppedEvent.putString("status", "stopped");
            sendEvent("vmStatus", stoppedEvent);
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putString("message", "VM stopped");
            
            promise.resolve(result);
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to stop VM: " + e.getMessage(), e);
            promise.reject("STOP_ERROR", "Failed to stop VM: " + e.getMessage());
        }
    }
    
    /**
     * Get current VM status and stats
     */
    @ReactMethod
    public void getStatus(Promise promise) {
        try {
            WritableMap status = Arguments.createMap();
            
            boolean isRunning = qemuManager.isRunning();
            status.putString("status", isRunning ? "running" : "stopped");
            
            if (isRunning) {
                status.putDouble("uptime", qemuManager.getUptime());
                status.putDouble("cpuUsage", qemuManager.getCpuUsage());
                status.putDouble("memoryUsage", qemuManager.getMemoryUsage());
            } else {
                status.putDouble("uptime", 0);
                status.putDouble("cpuUsage", 0);
                status.putDouble("memoryUsage", 0);
            }
            
            promise.resolve(status);
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to get status: " + e.getMessage(), e);
            promise.reject("STATUS_ERROR", "Failed to get status: " + e.getMessage());
        }
    }
    
    /**
     * Send command to VM console
     */
    @ReactMethod
    public void sendCommand(String command, Promise promise) {
        try {
            Log.d(TAG, "Sending command: " + command);
            
            String output = qemuManager.executeCommand(command);
            
            WritableMap result = Arguments.createMap();
            result.putString("output", output);
            result.putBoolean("success", true);
            
            // Send log event
            WritableMap logEvent = Arguments.createMap();
            logEvent.putString("message", "$ " + command + "\n" + output);
            sendEvent("vmLog", logEvent);
            
            promise.resolve(result);
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to send command: " + e.getMessage(), e);
            promise.reject("COMMAND_ERROR", "Failed to send command: " + e.getMessage());
        }
    }
    
    /**
     * Get VM logs
     */
    @ReactMethod
    public void getLogs(int lines, Promise promise) {
        try {
            String logs = qemuManager.getLogs(lines);
            
            WritableMap result = Arguments.createMap();
            result.putString("logs", logs);
            
            promise.resolve(result);
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to get logs: " + e.getMessage(), e);
            promise.reject("LOGS_ERROR", "Failed to get logs: " + e.getMessage());
        }
    }
    
    /**
     * Copy asset file to internal storage
     */
    private void copyAssetToFile(Context context, String assetName, File destFile) throws IOException {
        try (InputStream in = context.getAssets().open(assetName);
             FileOutputStream out = new FileOutputStream(destFile)) {
            
            byte[] buffer = new byte[8192];
            int read;
            while ((read = in.read(buffer)) != -1) {
                out.write(buffer, 0, read);
            }
            out.flush();
        }
    }
    
    /**
     * Create QCOW2 disk image
     * In production, this would call QEMU tools or native code
     */
    private void createQcow2Disk(String path, int sizeMB) throws IOException {
        // Create a placeholder file
        // In production, use qemu-img or native code to create proper QCOW2
        File file = new File(path);
        try (FileOutputStream fos = new FileOutputStream(file)) {
            // Write QCOW2 header (simplified)
            byte[] header = new byte[512];
            header[0] = 'Q';
            header[1] = 'F';
            header[2] = 'I';
            header[3] = (byte) 0xfb;
            fos.write(header);
        }
        Log.d(TAG, "Created disk image: " + path);
    }
    
    /**
     * Create default QEMU configuration file
     */
    private void createDefaultConfig(File configFile) throws IOException {
        String config = "{\n" +
            "  \"machine\": \"q35\",\n" +
            "  \"cpu\": \"max\",\n" +
            "  \"memory\": 2048,\n" +
            "  \"smp\": 2,\n" +
            "  \"display\": \"none\",\n" +
            "  \"network\": {\n" +
            "    \"type\": \"user\",\n" +
            "    \"hostfwd\": [\n" +
            "      \"tcp::2375-:2375\",\n" +
            "      \"tcp::2222-:22\",\n" +
            "      \"tcp::8080-:8080\"\n" +
            "    ]\n" +
            "  },\n" +
            "  \"drives\": [\n" +
            "    {\n" +
            "      \"file\": \"alpine-disk.qcow2\",\n" +
            "      \"if\": \"virtio\",\n" +
            "      \"format\": \"qcow2\"\n" +
            "    },\n" +
            "    {\n" +
            "      \"file\": \"alpine-virt.iso\",\n" +
            "      \"media\": \"cdrom\"\n" +
            "    }\n" +
            "  ]\n" +
            "}";
        
        try (FileOutputStream fos = new FileOutputStream(configFile)) {
            fos.write(config.getBytes());
        }
        Log.d(TAG, "Created default config: " + configFile.getAbsolutePath());
    }
}
