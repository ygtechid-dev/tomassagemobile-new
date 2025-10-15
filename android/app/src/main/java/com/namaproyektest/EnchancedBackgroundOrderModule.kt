package com.tomassagemitra
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.graphics.PixelFormat
import android.media.AudioManager
import android.media.MediaPlayer
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.*
import kotlinx.coroutines.*
import okhttp3.Call
import okhttp3.Callback
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import org.json.JSONObject
import java.io.IOException
import java.text.NumberFormat
import java.util.*
import java.util.concurrent.TimeUnit

class EnhancedBackgroundOrderModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        private const val TAG = "BackgroundOrder"
        private const val CHANNEL_ID = "ORDER_CHANNEL"
    }
    
    private val httpClient: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(10, TimeUnit.SECONDS)
            .build()
    }
    
    private val sharedPrefs: SharedPreferences by lazy {
        reactContext.getSharedPreferences("BackgroundOrderPrefs", Context.MODE_PRIVATE)
    }
    
    private var windowManager: WindowManager? = null
    private var overlayView: View? = null
    private var notificationPlayer: MediaPlayer? = null
    private var countdownHandler: Handler? = null
    private var pollingJob: Job? = null
    private var countdownTime = 30
    
    private var apiUrl: String? = null
    private var userId: String? = null
    private var userLatitude: Double = 0.0
    private var userLongitude: Double = 0.0
    
    init {
        createNotificationChannel()
        initializeNotificationSound()
    }
    
    override fun getName(): String = "EnhancedBackgroundOrderModule"
    
    @ReactMethod
    fun setConfig(config: ReadableMap, promise: Promise) {
        try {
            config.getString("apiUrl")?.let { 
                apiUrl = it
                sharedPrefs.edit().putString("apiUrl", it).apply()
            }
            
            config.getString("userId")?.let { 
                userId = it
                sharedPrefs.edit().putString("userId", it).apply()
            }
            
            if (config.hasKey("latitude")) {
                userLatitude = config.getDouble("latitude")
                sharedPrefs.edit().putFloat("latitude", userLatitude.toFloat()).apply()
            }
            
            if (config.hasKey("longitude")) {
                userLongitude = config.getDouble("longitude")
                sharedPrefs.edit().putFloat("longitude", userLongitude.toFloat()).apply()
            }
            
            Log.d(TAG, "Config set - API: $apiUrl, User: $userId")
            promise.resolve("Config updated successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error setting config: ${e.message}")
            promise.reject("CONFIG_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun startBackgroundService(promise: Promise) {
        try {
            loadSavedConfig()
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && 
                !Settings.canDrawOverlays(reactApplicationContext)) {
                promise.reject("OVERLAY_PERMISSION", "Overlay permission required")
                return
            }
            
            if (apiUrl == null || userId == null) {
                promise.reject("CONFIG_MISSING", "API URL and User ID must be set before starting service")
                return
            }
            
            startPolling()
            promise.resolve("Background service started")
            Log.d(TAG, "Background service started successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error starting background service: ${e.message}")
            promise.reject("ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun stopBackgroundService(promise: Promise) {
        try {
            pollingJob?.cancel()
            dismissOverlay()
            stopNotificationSound()
            promise.resolve("Background service stopped")
            Log.d(TAG, "Background service stopped")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping background service: ${e.message}")
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getServiceStatus(promise: Promise) {
        try {
            val status = Arguments.createMap().apply {
                putBoolean("isRunning", pollingJob?.isActive == true)
                putString("apiUrl", apiUrl ?: "")
                putString("userId", userId ?: "")
                putDouble("latitude", userLatitude)
                putDouble("longitude", userLongitude)
                putString("lastProcessedOrderId", sharedPrefs.getString("current_order_id", null))
            }
            promise.resolve(status)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting service status: ${e.message}")
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun clearCurrentOrderId(promise: Promise) {
        try {
            val oldId = sharedPrefs.getString("current_order_id", "none")
            sharedPrefs.edit().remove("current_order_id").apply()
            Log.d(TAG, "✓ Current order ID cleared. Old ID was: $oldId")
            promise.resolve("Order ID cleared: $oldId")
        } catch (e: Exception) {
            Log.e(TAG, "Error clearing order ID: ${e.message}")
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getCurrentOrderId(promise: Promise) {
        try {
            val currentId = sharedPrefs.getString("current_order_id", "none")
            Log.d(TAG, "Current order ID in SharedPrefs: $currentId")
            promise.resolve(currentId)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting current order ID: ${e.message}")
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun showTestOrderModal(orderData: ReadableMap, promise: Promise) {
        try {
            val jsonObject = convertReadableMapToJson(orderData)
            
            // Clear current order ID untuk test
            sharedPrefs.edit().remove("current_order_id").apply()
            
            Handler(Looper.getMainLooper()).post {
                try {
                    showOrderOverlay(jsonObject)
                    playNotificationSound()
                    showNotification(jsonObject)
                    promise.resolve("Test modal shown successfully")
                } catch (e: Exception) {
                    Log.e(TAG, "Error showing test modal: ${e.message}")
                    promise.reject("TEST_MODAL_ERROR", e.message)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error processing test order data: ${e.message}")
            promise.reject("TEST_DATA_ERROR", e.message)
        }
    }

    private fun convertReadableMapToJson(readableMap: ReadableMap): JSONObject {
        val jsonObject = JSONObject()
        
        try {
            val iterator = readableMap.keySetIterator()
            while (iterator.hasNextKey()) {
                val key = iterator.nextKey()
                val value = readableMap.getDynamic(key)
                
                when (value.type) {
                    ReadableType.String -> jsonObject.put(key, value.asString())
                    ReadableType.Number -> jsonObject.put(key, value.asDouble())
                    ReadableType.Boolean -> jsonObject.put(key, value.asBoolean())
                    ReadableType.Null -> jsonObject.put(key, JSONObject.NULL)
                    ReadableType.Map -> {
                        jsonObject.put(key, value.asMap().toString())
                    }
                    ReadableType.Array -> {
                        jsonObject.put(key, value.asArray().toString())
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error converting ReadableMap to JSONObject: ${e.message}")
            throw e
        }
        
        return jsonObject
    }
    
    @ReactMethod
    fun requestOverlayPermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (!Settings.canDrawOverlays(reactApplicationContext)) {
                    val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION).apply {
                        data = Uri.parse("package:${reactApplicationContext.packageName}")
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    reactApplicationContext.startActivity(intent)
                    promise.resolve("Permission request sent")
                } else {
                    promise.resolve("Permission already granted")
                }
            } else {
                promise.resolve("Permission not required for this Android version")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
    
    private fun loadSavedConfig() {
        apiUrl = sharedPrefs.getString("apiUrl", null)
        userId = sharedPrefs.getString("userId", null)
        userLatitude = sharedPrefs.getFloat("latitude", 0f).toDouble()
        userLongitude = sharedPrefs.getFloat("longitude", 0f).toDouble()
    }
    
    private fun initializeNotificationSound() {
        try {
            notificationPlayer?.release()
            notificationPlayer = null
            
            val soundResId = reactApplicationContext.resources.getIdentifier(
                "notification", "raw", reactApplicationContext.packageName
            )
            
            if (soundResId != 0) {
                notificationPlayer = MediaPlayer.create(reactApplicationContext, soundResId)?.apply {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        setAudioAttributes(
                            android.media.AudioAttributes.Builder()
                                .setUsage(android.media.AudioAttributes.USAGE_ALARM)
                                .setContentType(android.media.AudioAttributes.CONTENT_TYPE_SONIFICATION)
                                .build()
                        )
                    } else {
                        @Suppress("DEPRECATION")
                        setAudioStreamType(AudioManager.STREAM_ALARM)
                    }
                    isLooping = true
                    setVolume(1.0f, 1.0f)
                }
                Log.d(TAG, "Notification sound initialized successfully")
            } else {
                Log.e(TAG, "Notification sound file not found!")
                createFallbackSound()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing notification sound: ${e.message}")
            createFallbackSound()
        }
    }
    
    private fun createFallbackSound() {
        try {
            val defaultSoundUri = Settings.System.DEFAULT_NOTIFICATION_URI
            notificationPlayer = MediaPlayer().apply {
                setDataSource(reactApplicationContext, defaultSoundUri)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    setAudioAttributes(
                        android.media.AudioAttributes.Builder()
                            .setUsage(android.media.AudioAttributes.USAGE_ALARM)
                            .setContentType(android.media.AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build()
                    )
                } else {
                    @Suppress("DEPRECATION")
                    setAudioStreamType(AudioManager.STREAM_ALARM)
                }
                prepare()
                isLooping = true
                setVolume(1.0f, 1.0f)
            }
            Log.d(TAG, "Fallback notification sound initialized")
        } catch (e: Exception) {
            Log.e(TAG, "Error creating fallback sound: ${e.message}")
        }
    }
    
    private fun playNotificationSound() {
        try {
            val audioManager = reactApplicationContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
            val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM)
            audioManager.setStreamVolume(AudioManager.STREAM_ALARM, maxVolume, 0)
            
            notificationPlayer?.let { player ->
                if (!player.isPlaying) {
                    player.start()
                    Log.d(TAG, "Notification sound started playing")
                }
            } ?: run {
                Log.w(TAG, "Notification player is null, reinitializing...")
                initializeNotificationSound()
                notificationPlayer?.start()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error playing notification sound: ${e.message}")
        }
    }
    
    private fun stopNotificationSound() {
        try {
            notificationPlayer?.let { player ->
                if (player.isPlaying) {
                    player.pause()
                    player.seekTo(0)
                    Log.d(TAG, "Notification sound stopped")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping notification sound: ${e.message}")
        }
    }
    
    private fun startPolling() {
        pollingJob?.cancel()
        
        pollingJob = CoroutineScope(Dispatchers.IO).launch {
            while (isActive) {
                checkForNewOrdersFromAPI()
                delay(10000)
            }
        }
        
        Log.d(TAG, "Polling started with API: $apiUrl for user: $userId")
    }
    
    private fun checkForNewOrdersFromAPI() {
        if (apiUrl == null || userId == null) {
            Log.w(TAG, "API URL or User ID not set, skipping API call")
            return
        }
        
        val url = "$apiUrl/mitras/$userId/pending-orders" +
                "?latitude=$userLatitude" +
                "&longitude=$userLongitude" +
                "&_t=${System.currentTimeMillis()}"
        
        val request = Request.Builder()
            .url(url)
            .build()
        
        httpClient.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e(TAG, "API call failed: ${e.message}")
            }
            
            override fun onResponse(call: Call, response: Response) {
                if (response.isSuccessful) {
                    val responseBody = response.body?.string()
                    Log.d(TAG, "API Response received")
                    
                    try {
                        val jsonResponse = JSONObject(responseBody ?: "")
                        val success = jsonResponse.optBoolean("success", false)
                        
                        if (success && jsonResponse.has("data")) {
                            val dataArray = jsonResponse.getJSONArray("data")
                            
                            if (dataArray.length() > 0) {
                                val orderData = dataArray.getJSONObject(0)
                                
                                val currentOrderId = sharedPrefs.getString("current_order_id", "")
                                val newOrderId = orderData.optString("id", "")
                                
                                Log.d(TAG, "=================================")
                                Log.d(TAG, "Current Order ID: '$currentOrderId'")
                                Log.d(TAG, "New Order ID: '$newOrderId'")
                                Log.d(TAG, "Are different? ${newOrderId != currentOrderId}")
                                Log.d(TAG, "=================================")
                                
                                if (newOrderId != currentOrderId && newOrderId.isNotEmpty()) {
                                    Log.d(TAG, "✓ NEW ORDER DETECTED - SHOWING OVERLAY")
                                    
                                    sharedPrefs.edit().putString("current_order_id", newOrderId).apply()
                                    
                                    Handler(Looper.getMainLooper()).post {
                                        try {
                                            showOrderOverlay(orderData)
                                            playNotificationSound()
                                            showNotification(orderData)
                                        } catch (e: Exception) {
                                            Log.e(TAG, "Error in main thread: ${e.message}")
                                            Log.e(TAG, "Stack trace: ", e)
                                        }
                                    }
                                } else {
                                    Log.d(TAG, "✗ Order already processed, skipping")
                                }
                            } else {
                                Log.d(TAG, "No pending orders")
                            }
                        }
                    } catch (e: Exception) {
                        Log.e(TAG, "Error parsing API response: ${e.message}")
                        Log.e(TAG, "Stack trace: ", e)
                    }
                } else {
                    Log.w(TAG, "API call unsuccessful: ${response.code}")
                }
                response.close()
            }
        })
    }
    
    private fun showOrderOverlay(orderData: JSONObject) {
        try {
            Log.d(TAG, "=== START showOrderOverlay ===")
            Log.d(TAG, "Order data: ${orderData.toString()}")
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val canDraw = Settings.canDrawOverlays(reactApplicationContext)
                Log.d(TAG, "Can draw overlays: $canDraw")
                if (!canDraw) {
                    Log.e(TAG, "✗ OVERLAY PERMISSION NOT GRANTED!")
                    return
                }
            }
            
            overlayView?.let { 
                Log.d(TAG, "Dismissing existing overlay")
                dismissOverlay() 
            }
            
            windowManager = reactApplicationContext.getSystemService(Context.WINDOW_SERVICE) as WindowManager
            Log.d(TAG, "✓ WindowManager obtained")
            
            val inflater = LayoutInflater.from(reactApplicationContext)
            
            val layoutResId = reactApplicationContext.resources.getIdentifier(
                "order_overlay", "layout", reactApplicationContext.packageName
            )
            
            Log.d(TAG, "Layout resource ID: $layoutResId")
            
            if (layoutResId == 0) {
                Log.e(TAG, "✗ Layout 'order_overlay' NOT FOUND!")
                Log.e(TAG, "Package: ${reactApplicationContext.packageName}")
                Log.e(TAG, "Make sure android/app/src/main/res/layout/order_overlay.xml exists!")
                return
            }
            
            overlayView = inflater.inflate(layoutResId, null)
            Log.d(TAG, "✓ Layout inflated successfully")
            
            val params = WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) 
                    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY 
                else 
                    WindowManager.LayoutParams.TYPE_PHONE,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                PixelFormat.TRANSLUCENT
            )
            
            Log.d(TAG, "Populating order data...")
            populateOrderData(orderData)
            
            Log.d(TAG, "Adding view to WindowManager...")
            windowManager?.addView(overlayView, params)
            Log.d(TAG, "✓ VIEW ADDED SUCCESSFULLY!")
            
            setupButtonListeners(orderData)
            startCountdown()
            
            Log.d(TAG, "=== END showOrderOverlay SUCCESS ===")
        } catch (e: Exception) {
            Log.e(TAG, "✗ ERROR showing overlay: ${e.message}")
            Log.e(TAG, "Stack trace: ", e)
        }
    }
    
    private fun populateOrderData(orderData: JSONObject) {
        try {
            overlayView?.let { view ->
                view.findViewById<TextView>(reactApplicationContext.resources.getIdentifier("orderIdText", "id", reactApplicationContext.packageName))?.text = "ID #${orderData.optString("id", "")}"
                view.findViewById<TextView>(reactApplicationContext.resources.getIdentifier("customerNameText", "id", reactApplicationContext.packageName))?.text = orderData.optString("nama_customer", "")
                view.findViewById<TextView>(reactApplicationContext.resources.getIdentifier("serviceText", "id", reactApplicationContext.packageName))?.text = orderData.optString("nama_service", "")
                view.findViewById<TextView>(reactApplicationContext.resources.getIdentifier("priceText", "id", reactApplicationContext.packageName))?.text = formatCurrency(orderData.optDouble("harga", 0.0))
                view.findViewById<TextView>(reactApplicationContext.resources.getIdentifier("alamatText", "id", reactApplicationContext.packageName))?.text = orderData.optString("alamat", "")
                view.findViewById<TextView>(reactApplicationContext.resources.getIdentifier("durasiText", "id", reactApplicationContext.packageName))?.text = orderData.optString("durasi", "")
                view.findViewById<TextView>(reactApplicationContext.resources.getIdentifier("metodeBayarText", "id", reactApplicationContext.packageName))?.text = orderData.optString("metode_bayar", "")
                Log.d(TAG, "✓ Order data populated")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error populating order data: ${e.message}")
        }
    }
    
    private fun startCountdown() {
        countdownTime = 30
        val countdownTextId = reactApplicationContext.resources.getIdentifier("countdownText", "id", reactApplicationContext.packageName)
        val countdownText = overlayView?.findViewById<TextView>(countdownTextId)
        
        countdownHandler = Handler(Looper.getMainLooper())
        
        val countdownRunnable = object : Runnable {
            override fun run() {
                if (countdownTime > 0) {
                    countdownText?.text = countdownTime.toString()
                    countdownTime--
                    countdownHandler?.postDelayed(this, 1000)
                } else {
                    dismissOverlay()
                    stopNotificationSound()
                    openMainApp()
                }
            }
        }
        
        countdownHandler?.post(countdownRunnable)
        Log.d(TAG, "✓ Countdown started")
    }
    
    private fun setupButtonListeners(orderData: JSONObject) {
        overlayView?.let { view ->
            val acceptButtonId = reactApplicationContext.resources.getIdentifier("acceptButton", "id", reactApplicationContext.packageName)
            val rejectButtonId = reactApplicationContext.resources.getIdentifier("rejectButton", "id", reactApplicationContext.packageName)
            
            val acceptButton = view.findViewById<Button>(acceptButtonId)
            val rejectButton = view.findViewById<Button>(rejectButtonId)
            
            acceptButton?.setOnClickListener {
                Log.d(TAG, "Accept button clicked")
                acceptButton.isEnabled = false
                rejectButton?.isEnabled = false
                handleAcceptOrder(orderData)
            }
            
            rejectButton?.setOnClickListener {
                Log.d(TAG, "Reject button clicked")
                acceptButton?.isEnabled = false
                rejectButton.isEnabled = false
                handleRejectOrder(orderData)
            }
            
            Log.d(TAG, "✓ Button listeners setup")
        }
    }
    
    private fun sendEvent(eventName: String, params: WritableMap) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    private fun handleAcceptOrder(orderData: JSONObject) {
        stopNotificationSound()
        
        val orderId = orderData.optString("id", "")
        val url = "$apiUrl/bookings/$orderId/accept"
        
        Log.d(TAG, "=== ACCEPTING ORDER ===")
        Log.d(TAG, "Order ID: $orderId")
        Log.d(TAG, "URL: $url")
        Log.d(TAG, "Mitra ID: $userId")
        
        val requestBody = JSONObject().apply {
            put("mitraId", userId)
        }
        
        Log.d(TAG, "Request body: ${requestBody.toString()}")
        
        val body = requestBody.toString().toRequestBody("application/json".toMediaType())
        val request = Request.Builder()
            .url(url)
            .post(body)
            .build()
        
        httpClient.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e(TAG, "✗ Accept order API FAILED: ${e.message}")
                Log.e(TAG, "Stack trace: ", e)
                
                Handler(Looper.getMainLooper()).post {
                    // Show error in React Native
                    val params = Arguments.createMap().apply {
                        putString("type", "ACCEPT_FAILED")
                        putString("orderId", orderId)
                        putString("error", e.message)
                    }
                    sendEvent("EnhancedBackgroundOrderEvent", params)
                    
                    dismissOverlay()
                    openMainApp()
                }
            }
            
            override fun onResponse(call: Call, response: Response) {
                val responseBody = response.body?.string()
                
                Log.d(TAG, "Accept API Response Code: ${response.code}")
                Log.d(TAG, "Accept API Response Body: $responseBody")
                
                Handler(Looper.getMainLooper()).post {
                    if (response.isSuccessful) {
                        Log.d(TAG, "✓✓✓ ORDER ACCEPTED SUCCESSFULLY ✓✓✓")
                        
                        val params = Arguments.createMap().apply {
                            putString("type", "ACCEPT_SUCCESS")
                            putString("orderId", orderId)
                            putString("response", responseBody ?: "")
                        }
                        sendEvent("EnhancedBackgroundOrderEvent", params)
                    } else {
                        Log.w(TAG, "✗ Accept order failed with code: ${response.code}")
                        Log.w(TAG, "Response body: $responseBody")
                        
                        val params = Arguments.createMap().apply {
                            putString("type", "ACCEPT_FAILED")
                            putString("orderId", orderId)
                            putString("error", "HTTP ${response.code}: $responseBody")
                        }
                        sendEvent("EnhancedBackgroundOrderEvent", params)
                    }
                    
                    dismissOverlay()
                    openMainApp()
                }
                
                response.close()
            }
        })
    }
    
    private fun handleRejectOrder(orderData: JSONObject) {
        stopNotificationSound()
        
        val orderId = orderData.optString("id", "")
        val url = "$apiUrl/bookings/$orderId/decline"
        
        Log.d(TAG, "Rejecting order $orderId")
        
        val requestBody = JSONObject().apply {
            put("mitraId", userId)
        }
        
        val body = requestBody.toString().toRequestBody("application/json".toMediaType())
        val request = Request.Builder()
            .url(url)
            .post(body)
            .build()
        
        httpClient.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e(TAG, "Reject order failed: ${e.message}")
            }
            
            override fun onResponse(call: Call, response: Response) {
                Log.d(TAG, "✓ Order rejected")
                
                Handler(Looper.getMainLooper()).post {
                    val params = Arguments.createMap().apply {
                        putString("type", "DECLINE")
                        putString("orderId", orderId)
                    }
                    sendEvent("EnhancedBackgroundOrderEvent", params)
                }
                
                response.close()
            }
        })
        
        dismissOverlay()
        openMainApp()
    }
    
    private fun openMainApp() {
        try {
            val intent = reactApplicationContext.packageManager
                .getLaunchIntentForPackage(reactApplicationContext.packageName)
            
            intent?.let {
                it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or 
                           Intent.FLAG_ACTIVITY_CLEAR_TOP or 
                           Intent.FLAG_ACTIVITY_SINGLE_TOP)
                reactApplicationContext.startActivity(it)
                Log.d(TAG, "Main app opened")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error opening main app: ${e.message}")
        }
    }
    
    private fun dismissOverlay() {
        try {
            overlayView?.let { view ->
                windowManager?.removeView(view)
                overlayView = null
                Log.d(TAG, "✓ Overlay dismissed")
            }
            
            countdownHandler?.removeCallbacksAndMessages(null)
            sharedPrefs.edit().remove("current_order_id").apply()
        } catch (e: Exception) {
            Log.e(TAG, "Error dismissing overlay: ${e.message}")
        }
    }
    
    private fun showNotification(orderData: JSONObject) {
        val notificationManager = reactApplicationContext
            .getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        val intent = reactApplicationContext.packageManager
            .getLaunchIntentForPackage(reactApplicationContext.packageName)
        
        intent?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or 
                        Intent.FLAG_ACTIVITY_CLEAR_TOP or 
                        Intent.FLAG_ACTIVITY_SINGLE_TOP)
        
        val pendingIntent = PendingIntent.getActivity(
            reactApplicationContext, 0, intent, 
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        val customerName = orderData.optString("nama_customer", "Customer")
        val serviceName = orderData.optString("nama_service", "Service")
        val alamat = orderData.optString("alamat", "")
        
        val iconResId = reactApplicationContext.resources.getIdentifier(
            "ic_notification", "drawable", reactApplicationContext.packageName
        )
        
        val builder = NotificationCompat.Builder(reactApplicationContext, CHANNEL_ID)
            .setSmallIcon(if (iconResId != 0) iconResId else android.R.drawable.ic_dialog_info)
            .setContentTitle("Order Baru dari $customerName")
            .setContentText("$serviceName di $alamat")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setVibrate(longArrayOf(1000, 1000, 1000, 1000, 1000))
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setFullScreenIntent(pendingIntent, true)
        
        notificationManager.notify(1, builder.build())
        Log.d(TAG, "✓ Notification shown")
    }
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Order Notifications"
            val descriptionText = "Notifications for new orders"
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
            }
            
            val notificationManager = reactApplicationContext
                .getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    private fun formatCurrency(amount: Double): String {
        val formatter = NumberFormat.getCurrencyInstance(Locale("id", "ID"))
        return formatter.format(amount)
    }
    
    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        notificationPlayer?.release()
        notificationPlayer = null
        pollingJob?.cancel()
    }
}