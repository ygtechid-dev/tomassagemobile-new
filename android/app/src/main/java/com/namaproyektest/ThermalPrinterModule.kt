package com.tomassagemitra

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothSocket
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.bridge.*
import kotlinx.coroutines.*
import java.io.IOException
import java.io.OutputStream
import java.util.*
import java.util.concurrent.Executors

class ThermalPrinterModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        private const val MODULE_NAME = "ThermalPrinter"
        private const val TAG = "ThermalPrinter"
        private val SPP_UUID: UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")
        
        // ESC/POS Commands
        private val ESC_ALIGN_LEFT = byteArrayOf(0x1B, 0x61, 0x00)
        private val ESC_ALIGN_CENTER = byteArrayOf(0x1B, 0x61, 0x01)
        private val ESC_ALIGN_RIGHT = byteArrayOf(0x1B, 0x61, 0x02)
        private val ESC_BOLD_ON = byteArrayOf(0x1B, 0x45, 0x01)
        private val ESC_BOLD_OFF = byteArrayOf(0x1B, 0x45, 0x00)
        private val ESC_UNDERLINE_ON = byteArrayOf(0x1B, 0x2D, 0x01)
        private val ESC_UNDERLINE_OFF = byteArrayOf(0x1B, 0x2D, 0x00)
        private val ESC_DOUBLE_HEIGHT_ON = byteArrayOf(0x1B, 0x21, 0x10)
        private val ESC_DOUBLE_WIDTH_ON = byteArrayOf(0x1B, 0x21, 0x20)
        private val ESC_NORMAL_SIZE = byteArrayOf(0x1B, 0x21, 0x00)
        private val ESC_CUT_PAPER = byteArrayOf(0x1D, 0x56, 0x42, 0x00)
        private val ESC_INIT = byteArrayOf(0x1B, 0x40)
        private val LINE_FEED = byteArrayOf(0x0A)
    }
    
    private var bluetoothAdapter: BluetoothAdapter? = null
    private var bluetoothSocket: BluetoothSocket? = null
    private var outputStream: OutputStream? = null
    private val mainHandler = Handler(Looper.getMainLooper())
    private val executorService = Executors.newSingleThreadExecutor()
    private var isConnected = false
    private var connectedDeviceAddress = ""
    
    init {
        bluetoothAdapter = BluetoothAdapter.getDefaultAdapter()
    }
    
    override fun getName(): String = MODULE_NAME
    
    @ReactMethod
    fun isBluetoothEnabled(promise: Promise) {
        try {
            val enabled = bluetoothAdapter?.isEnabled ?: false
            promise.resolve(enabled)
        } catch (e: Exception) {
            promise.reject("BLUETOOTH_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun enableBluetooth(promise: Promise) {
        try {
            bluetoothAdapter?.let { adapter ->
                if (!adapter.isEnabled) {
                    val enableBtIntent = Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    reactApplicationContext.startActivity(enableBtIntent)
                }
                promise.resolve(true)
            } ?: promise.reject("NO_BLUETOOTH", "Bluetooth not supported")
        } catch (e: Exception) {
            promise.reject("ENABLE_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun scanDevices(promise: Promise) {
        try {
            bluetoothAdapter?.let { adapter ->
                if (!adapter.isEnabled) {
                    promise.reject("BLUETOOTH_DISABLED", "Bluetooth is not enabled")
                    return
                }
                
                val deviceArray = Arguments.createArray()
                
                // Get paired devices
                val pairedDevices = adapter.bondedDevices
                pairedDevices?.forEach { device ->
                    val deviceMap = Arguments.createMap().apply {
                        putString("name", device.name ?: "Unknown Device")
                        putString("address", device.address)
                        putString("type", "paired")
                    }
                    deviceArray.pushMap(deviceMap)
                }
                
                promise.resolve(deviceArray)
            } ?: promise.reject("NO_BLUETOOTH", "Bluetooth not supported")
        } catch (e: Exception) {
            promise.reject("SCAN_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun connectToDevice(deviceAddress: String, promise: Promise) {
        executorService.execute {
            try {
                // Close existing connection
                cleanupConnection()
                
                bluetoothAdapter?.let { adapter ->
                    val device = adapter.getRemoteDevice(deviceAddress)
                    
                    // Try multiple connection methods
                    var socket: BluetoothSocket? = null
                    var connected = false
                    
                    // Method 1: Standard RFCOMM connection
                    try {
                        socket = device.createRfcommSocketToServiceRecord(SPP_UUID)
                        adapter.cancelDiscovery()
                        socket.connect()
                        connected = true
                        Log.d(TAG, "Connected using standard RFCOMM")
                    } catch (e: Exception) {
                        Log.w(TAG, "Standard RFCOMM failed, trying fallback method")
                        socket?.close()
                        
                        // Method 2: Fallback connection using reflection
                        try {
                            val method = device.javaClass.getMethod("createRfcommSocket", Int::class.javaPrimitiveType)
                            socket = method.invoke(device, 1) as BluetoothSocket
                            adapter.cancelDiscovery()
                            socket.connect()
                            connected = true
                            Log.d(TAG, "Connected using fallback method")
                        } catch (e2: Exception) {
                            Log.e(TAG, "Both connection methods failed", e2)
                            socket?.close()
                        }
                    }
                    
                    if (connected && socket != null) {
                        bluetoothSocket = socket
                        outputStream = socket.outputStream
                        isConnected = true
                        connectedDeviceAddress = deviceAddress
                        
                        // Initialize printer with delay
                        Thread.sleep(500) // Wait for connection to stabilize
                        outputStream?.write(ESC_INIT)
                        outputStream?.flush()
                        Thread.sleep(200)
                        
                        mainHandler.post {
                            promise.resolve(true)
                        }
                    } else {
                        mainHandler.post {
                            promise.reject("CONNECTION_FAILED", "Unable to connect to device")
                        }
                    }
                } ?: mainHandler.post {
                    promise.reject("NO_BLUETOOTH", "Bluetooth not supported")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Connection failed", e)
                cleanupConnection()
                mainHandler.post {
                    promise.reject("CONNECTION_FAILED", e.message)
                }
            }
        }
    }
    
    @ReactMethod
    fun disconnect(promise: Promise) {
        executorService.execute {
            try {
                cleanupConnection()
                mainHandler.post {
                    promise.resolve(true)
                }
            } catch (e: Exception) {
                mainHandler.post {
                    promise.reject("DISCONNECT_ERROR", e.message)
                }
            }
        }
    }
    
    @ReactMethod
    fun isConnected(promise: Promise) {
        val connected = isConnected && bluetoothSocket?.isConnected == true
        promise.resolve(connected)
    }
    
    private fun cleanupConnection() {
        try {
            outputStream?.close()
            bluetoothSocket?.close()
        } catch (e: Exception) {
            Log.w(TAG, "Error during cleanup", e)
        } finally {
            outputStream = null
            bluetoothSocket = null
            isConnected = false
            connectedDeviceAddress = ""
        }
    }
    
    private fun checkConnectionAndReconnect(): Boolean {
        if (!isConnected || bluetoothSocket?.isConnected != true) {
            Log.w(TAG, "Connection lost, attempting reconnect...")
            cleanupConnection()
            return false
        }
        return true
    }
    
    @ReactMethod
    fun printText(text: String, promise: Promise) {
        if (!checkConnectionAndReconnect()) {
            promise.reject("NOT_CONNECTED", "Printer not connected")
            return
        }
        
        executorService.execute {
            try {
                val data = text.toByteArray(Charsets.UTF_8)
                outputStream?.write(data)
                outputStream?.flush()
                
                // Small delay to ensure data is sent
                Thread.sleep(100)
                
                mainHandler.post {
                    promise.resolve(true)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Print failed", e)
                if (e.message?.contains("Broken pipe") == true || e.message?.contains("socket closed") == true) {
                    cleanupConnection()
                }
                mainHandler.post {
                    promise.reject("PRINT_FAILED", "Print failed: ${e.message}")
                }
            }
        }
    }
    
    @ReactMethod
    fun printRawBytes(options: ReadableMap, promise: Promise) {
        if (!checkConnectionAndReconnect()) {
            promise.reject("NOT_CONNECTED", "Printer not connected")
            return
        }
        
        executorService.execute {
            try {
                outputStream?.let { stream ->
                    // Alignment
                    when (options.getString("align")) {
                        "center" -> stream.write(ESC_ALIGN_CENTER)
                        "right" -> stream.write(ESC_ALIGN_RIGHT)
                        else -> stream.write(ESC_ALIGN_LEFT)
                    }
                    
                    // Text formatting
                    if (options.hasKey("bold") && options.getBoolean("bold")) {
                        stream.write(ESC_BOLD_ON)
                    }
                    
                    if (options.hasKey("underline") && options.getBoolean("underline")) {
                        stream.write(ESC_UNDERLINE_ON)
                    }
                    
                    if (options.hasKey("doubleHeight") && options.getBoolean("doubleHeight")) {
                        stream.write(ESC_DOUBLE_HEIGHT_ON)
                    }
                    
                    if (options.hasKey("doubleWidth") && options.getBoolean("doubleWidth")) {
                        stream.write(ESC_DOUBLE_WIDTH_ON)
                    }
                    
                    // Print text
                    options.getString("text")?.let { text ->
                        val textBytes = text.toByteArray(Charsets.UTF_8)
                        stream.write(textBytes)
                    }
                    
                    // Reset formatting
                    stream.write(ESC_NORMAL_SIZE)
                    stream.write(ESC_BOLD_OFF)
                    stream.write(ESC_UNDERLINE_OFF)
                    stream.write(ESC_ALIGN_LEFT)
                    
                    // Line feed
                    if (options.hasKey("lineFeed") && options.getBoolean("lineFeed")) {
                        stream.write(LINE_FEED)
                    }
                    
                    stream.flush()
                    
                    // Small delay between commands
                    Thread.sleep(50)
                }
                
                mainHandler.post {
                    promise.resolve(true)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Raw print failed", e)
                if (e.message?.contains("Broken pipe") == true || e.message?.contains("socket closed") == true) {
                    cleanupConnection()
                }
                mainHandler.post {
                    promise.reject("RAW_PRINT_FAILED", "Print failed: ${e.message}")
                }
            }
        }
    }
    
    @ReactMethod
    fun cutPaper(promise: Promise) {
        if (!checkConnectionAndReconnect()) {
            promise.reject("NOT_CONNECTED", "Printer not connected")
            return
        }
        
        executorService.execute {
            try {
                outputStream?.write(ESC_CUT_PAPER)
                outputStream?.flush()
                Thread.sleep(200) // Wait for cut command to complete
                
                mainHandler.post {
                    promise.resolve(true)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Cut paper failed", e)
                if (e.message?.contains("Broken pipe") == true || e.message?.contains("socket closed") == true) {
                    cleanupConnection()
                }
                mainHandler.post {
                    promise.reject("CUT_FAILED", "Cut failed: ${e.message}")
                }
            }
        }
    }
    
    @ReactMethod
    fun feedPaper(lines: Int, promise: Promise) {
        if (!checkConnectionAndReconnect()) {
            promise.reject("NOT_CONNECTED", "Printer not connected")
            return
        }
        
        executorService.execute {
            try {
                outputStream?.let { stream ->
                    repeat(lines) {
                        stream.write(LINE_FEED)
                        Thread.sleep(20) // Small delay between line feeds
                    }
                    stream.flush()
                }
                
                mainHandler.post {
                    promise.resolve(true)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Feed paper failed", e)
                if (e.message?.contains("Broken pipe") == true || e.message?.contains("socket closed") == true) {
                    cleanupConnection()
                }
                mainHandler.post {
                    promise.reject("FEED_FAILED", "Feed failed: ${e.message}")
                }
            }
        }
    }
    
    @ReactMethod
    fun addListener(eventName: String) {
        // Required for EventEmitter
    }
    
    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for EventEmitter
    }
    
    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        cleanupConnection()
        executorService.shutdown()
    }
}