package com.dockerandroid.app.utils;

import android.content.Context;
import android.util.Log;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.security.MessageDigest;
import java.util.zip.GZIPInputStream;

/**
 * FileUtils - File operation utilities
 */
public class FileUtils {
    private static final String TAG = "FileUtils";
    private static final int BUFFER_SIZE = 8192;
    
    /**
     * Copy file from assets to internal storage
     */
    public static boolean copyAsset(Context context, String assetName, File destFile) {
        try (InputStream in = context.getAssets().open(assetName);
             OutputStream out = new FileOutputStream(destFile)) {
            
            byte[] buffer = new byte[BUFFER_SIZE];
            int read;
            while ((read = in.read(buffer)) != -1) {
                out.write(buffer, 0, read);
            }
            out.flush();
            
            Log.d(TAG, "Copied asset " + assetName + " to " + destFile.getAbsolutePath());
            return true;
            
        } catch (IOException e) {
            Log.e(TAG, "Failed to copy asset: " + e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Copy file
     */
    public static boolean copyFile(File src, File dest) {
        try (InputStream in = new BufferedInputStream(new FileInputStream(src));
             OutputStream out = new BufferedOutputStream(new FileOutputStream(dest))) {
            
            byte[] buffer = new byte[BUFFER_SIZE];
            int read;
            while ((read = in.read(buffer)) != -1) {
                out.write(buffer, 0, read);
            }
            out.flush();
            
            return true;
            
        } catch (IOException e) {
            Log.e(TAG, "Failed to copy file: " + e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Extract gzipped file
     */
    public static boolean extractGzip(File gzFile, File destFile) {
        try (GZIPInputStream gzis = new GZIPInputStream(new FileInputStream(gzFile));
             FileOutputStream fos = new FileOutputStream(destFile)) {
            
            byte[] buffer = new byte[BUFFER_SIZE];
            int len;
            while ((len = gzis.read(buffer)) > 0) {
                fos.write(buffer, 0, len);
            }
            
            return true;
            
        } catch (IOException e) {
            Log.e(TAG, "Failed to extract gzip: " + e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Delete directory recursively
     */
    public static boolean deleteDirectory(File dir) {
        if (dir == null || !dir.exists()) {
            return true;
        }
        
        if (dir.isDirectory()) {
            File[] children = dir.listFiles();
            if (children != null) {
                for (File child : children) {
                    if (!deleteDirectory(child)) {
                        return false;
                    }
                }
            }
        }
        
        return dir.delete();
    }
    
    /**
     * Get file MD5 hash
     */
    public static String getMD5(File file) {
        try (FileInputStream fis = new FileInputStream(file)) {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] buffer = new byte[BUFFER_SIZE];
            int read;
            while ((read = fis.read(buffer)) != -1) {
                md.update(buffer, 0, read);
            }
            
            byte[] digest = md.digest();
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to compute MD5: " + e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Get file size in human readable format
     */
    public static String formatFileSize(long bytes) {
        if (bytes < 1024) {
            return bytes + " B";
        } else if (bytes < 1024 * 1024) {
            return String.format("%.1f KB", bytes / 1024.0);
        } else if (bytes < 1024 * 1024 * 1024) {
            return String.format("%.1f MB", bytes / (1024.0 * 1024));
        } else {
            return String.format("%.1f GB", bytes / (1024.0 * 1024 * 1024));
        }
    }
    
    /**
     * Get available disk space
     */
    public static long getAvailableSpace(File path) {
        return path.getUsableSpace();
    }
    
    /**
     * Check if there's enough space for a file
     */
    public static boolean hasEnoughSpace(File path, long requiredBytes) {
        return getAvailableSpace(path) >= requiredBytes;
    }
    
    /**
     * Make file executable
     */
    public static boolean makeExecutable(File file) {
        try {
            return file.setExecutable(true, false);
        } catch (Exception e) {
            Log.e(TAG, "Failed to make executable: " + e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Read file as string
     */
    public static String readFile(File file) {
        try (FileInputStream fis = new FileInputStream(file)) {
            byte[] data = new byte[(int) file.length()];
            fis.read(data);
            return new String(data);
        } catch (IOException e) {
            Log.e(TAG, "Failed to read file: " + e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Write string to file
     */
    public static boolean writeFile(File file, String content) {
        try (FileOutputStream fos = new FileOutputStream(file)) {
            fos.write(content.getBytes());
            return true;
        } catch (IOException e) {
            Log.e(TAG, "Failed to write file: " + e.getMessage(), e);
            return false;
        }
    }
}
