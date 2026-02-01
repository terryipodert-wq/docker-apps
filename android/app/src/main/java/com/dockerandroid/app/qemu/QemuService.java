package com.dockerandroid.app.qemu;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

/**
 * QemuService - Android Foreground Service for running QEMU
 * Keeps QEMU process alive even when app is in background
 */
public class QemuService extends Service {
    private static final String TAG = "QemuService";
    
    public static final String ACTION_START = "com.dockerandroid.qemu.START";
    public static final String ACTION_STOP = "com.dockerandroid.qemu.STOP";
    public static final String EXTRA_RAM_MB = "ram_mb";
    public static final String EXTRA_CPU_CORES = "cpu_cores";
    
    private static final String CHANNEL_ID = "qemu_service_channel";
    private static final int NOTIFICATION_ID = 1001;
    
    private Process qemuProcess;
    private PowerManager.WakeLock wakeLock;
    private boolean isRunning = false;
    private long startTime = 0;
    
    // Process output reader thread
    private Thread outputReaderThread;
    private StringBuilder logBuffer = new StringBuilder();
    
    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "QemuService created");
        createNotificationChannel();
        acquireWakeLock();
    }
    
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) {
            return START_NOT_STICKY;
        }
        
        String action = intent.getAction();
        
        if (ACTION_START.equals(action)) {
            int ramMB = intent.getIntExtra(EXTRA_RAM_MB, 2048);
            int cpuCores = intent.getIntExtra(EXTRA_CPU_CORES, 2);
            startQemu(ramMB, cpuCores);
        } else if (ACTION_STOP.equals(action)) {
            stopQemu();
        }
        
        return START_STICKY;
    }
    
    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        stopQemu();
        releaseWakeLock();
        Log.d(TAG, "QemuService destroyed");
    }
    
    /**
     * Start QEMU process
     */
    private void startQemu(int ramMB, int cpuCores) {
        if (isRunning) {
            Log.w(TAG, "QEMU is already running");
            return;
        }
        
        try {
            Log.d(TAG, "Starting QEMU with " + ramMB + "MB RAM and " + cpuCores + " CPU cores");
            
            // Start as foreground service
            Notification notification = createNotification("Starting VM...");
            startForeground(NOTIFICATION_ID, notification);
            
            // Build QEMU command
            List<String> command = buildQemuCommand(ramMB, cpuCores);
            
            // Start QEMU process
            ProcessBuilder pb = new ProcessBuilder(command);
            pb.directory(new File(getFilesDir(), "qemu"));
            pb.redirectErrorStream(true);
            
            qemuProcess = pb.start();
            isRunning = true;
            startTime = System.currentTimeMillis();
            
            // Start output reader thread
            startOutputReader();
            
            // Update notification
            updateNotification("Alpine Linux VM Running");
            
            Log.d(TAG, "QEMU process started successfully");
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to start QEMU: " + e.getMessage(), e);
            isRunning = false;
            stopSelf();
        }
    }
    
    /**
     * Stop QEMU process
     */
    private void stopQemu() {
        if (!isRunning) {
            return;
        }
        
        try {
            Log.d(TAG, "Stopping QEMU...");
            
            if (qemuProcess != null) {
                // Send SIGTERM first
                qemuProcess.destroy();
                
                // Wait for graceful shutdown
                try {
                    qemuProcess.waitFor();
                } catch (InterruptedException e) {
                    // Force kill if needed
                    qemuProcess.destroyForcibly();
                }
                
                qemuProcess = null;
            }
            
            isRunning = false;
            startTime = 0;
            
            // Stop output reader
            if (outputReaderThread != null) {
                outputReaderThread.interrupt();
                outputReaderThread = null;
            }
            
            stopForeground(true);
            stopSelf();
            
            Log.d(TAG, "QEMU stopped successfully");
            
        } catch (Exception e) {
            Log.e(TAG, "Error stopping QEMU: " + e.getMessage(), e);
        }
    }
    
    /**
     * Build QEMU command line arguments
     */
    private List<String> buildQemuCommand(int ramMB, int cpuCores) {
        File qemuDir = new File(getFilesDir(), "qemu");
        File qemuBinary = new File(getApplicationInfo().nativeLibraryDir, "libqemu-system-x86_64.so");
        
        List<String> cmd = new ArrayList<>();
        
        // Use bundled QEMU binary or system path
        if (qemuBinary.exists()) {
            cmd.add(qemuBinary.getAbsolutePath());
        } else {
            // Fallback for development - won't work without actual binary
            cmd.add("/system/bin/qemu-system-x86_64");
        }
        
        // Machine configuration
        cmd.add("-machine");
        cmd.add("q35,accel=tcg");
        
        // CPU
        cmd.add("-cpu");
        cmd.add("max");
        cmd.add("-smp");
        cmd.add(String.valueOf(cpuCores));
        
        // Memory
        cmd.add("-m");
        cmd.add(String.valueOf(ramMB));
        
        // No display (headless)
        cmd.add("-display");
        cmd.add("none");
        
        // Serial console for logs
        cmd.add("-serial");
        cmd.add("stdio");
        
        // Boot drive (Alpine disk)
        cmd.add("-drive");
        cmd.add("file=" + new File(qemuDir, "alpine-disk.qcow2").getAbsolutePath() + 
                ",if=virtio,format=qcow2");
        
        // CD-ROM (Alpine ISO for first boot)
        cmd.add("-cdrom");
        cmd.add(new File(qemuDir, "alpine-virt.iso").getAbsolutePath());
        
        // Network with port forwarding
        cmd.add("-netdev");
        cmd.add("user,id=net0," +
                "hostfwd=tcp::2375-:2375," +  // Docker API
                "hostfwd=tcp::2222-:22," +     // SSH
                "hostfwd=tcp::8080-:8080," +   // Web
                "hostfwd=tcp::8443-:443");     // HTTPS
        
        cmd.add("-device");
        cmd.add("virtio-net-pci,netdev=net0");
        
        // QMP monitor for control
        cmd.add("-qmp");
        cmd.add("unix:" + new File(qemuDir, "qmp.sock").getAbsolutePath() + ",server,nowait");
        
        // Daemon mode
        cmd.add("-daemonize");
        
        return cmd;
    }
    
    /**
     * Start thread to read QEMU output
     */
    private void startOutputReader() {
        outputReaderThread = new Thread(() -> {
            try {
                BufferedReader reader = new BufferedReader(
                    new InputStreamReader(qemuProcess.getInputStream()));
                
                String line;
                while ((line = reader.readLine()) != null && !Thread.interrupted()) {
                    Log.d(TAG, "QEMU: " + line);
                    synchronized (logBuffer) {
                        logBuffer.append(line).append("\n");
                        // Keep last 10000 chars
                        if (logBuffer.length() > 10000) {
                            logBuffer.delete(0, logBuffer.length() - 10000);
                        }
                    }
                }
            } catch (Exception e) {
                if (!Thread.interrupted()) {
                    Log.e(TAG, "Output reader error: " + e.getMessage());
                }
            }
        });
        outputReaderThread.start();
    }
    
    /**
     * Get logs from buffer
     */
    public String getLogs(int lines) {
        synchronized (logBuffer) {
            String[] allLines = logBuffer.toString().split("\n");
            int start = Math.max(0, allLines.length - lines);
            StringBuilder result = new StringBuilder();
            for (int i = start; i < allLines.length; i++) {
                result.append(allLines[i]).append("\n");
            }
            return result.toString();
        }
    }
    
    /**
     * Check if QEMU is running
     */
    public boolean isRunning() {
        return isRunning && qemuProcess != null && qemuProcess.isAlive();
    }
    
    /**
     * Get uptime in seconds
     */
    public long getUptime() {
        if (!isRunning || startTime == 0) {
            return 0;
        }
        return (System.currentTimeMillis() - startTime) / 1000;
    }
    
    /**
     * Create notification channel (required for Android O+)
     */
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "QEMU VM Service",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Keeps Alpine Linux VM running in background");
            channel.setShowBadge(false);
            
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }
    
    /**
     * Create notification for foreground service
     */
    private Notification createNotification(String text) {
        Intent notificationIntent = getPackageManager()
            .getLaunchIntentForPackage(getPackageName());
        
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        
        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Docker Android")
            .setContentText(text)
            .setSmallIcon(android.R.drawable.ic_menu_manage)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build();
    }
    
    /**
     * Update notification text
     */
    private void updateNotification(String text) {
        Notification notification = createNotification(text);
        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager != null) {
            manager.notify(NOTIFICATION_ID, notification);
        }
    }
    
    /**
     * Acquire wake lock to keep CPU running
     */
    private void acquireWakeLock() {
        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (pm != null) {
            wakeLock = pm.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                "DockerAndroid:QemuWakeLock"
            );
            wakeLock.acquire(10 * 60 * 60 * 1000L); // 10 hours max
        }
    }
    
    /**
     * Release wake lock
     */
    private void releaseWakeLock() {
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
    }
}
