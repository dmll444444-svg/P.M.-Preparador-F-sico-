package com.ppfpro.healthbridge

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import androidx.lifecycle.lifecycleScope
import androidx.webkit.WebViewAssetLoader
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.temporal.ChronoUnit

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private val providerPackage = "com.google.android.apps.healthdata"
    private var pendingAthlete: String = ""

    private val requestedPermissions: Set<String> by lazy {
        setOf(
            HealthPermission.getReadPermission(StepsRecord::class),
            HealthPermission.getReadPermission(HeartRateRecord::class),
            HealthPermission.getReadPermission(SleepSessionRecord::class),
            HealthPermission.getReadPermission(ExerciseSessionRecord::class)
        )
    }

    private val permissionLauncher = registerForActivityResult(
        PermissionController.createRequestPermissionResultContract(providerPackage)
    ) { granted ->
        lifecycleScope.launch {
            emitPermissionState(pendingAthlete, granted)
            if (pendingAthlete.isNotBlank()) syncHealth(pendingAthlete)
        }
    }

    @SuppressLint("SetJavaScriptEnabled", "JavascriptInterface")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.databaseEnabled = true
        webView.settings.allowFileAccess = false
        webView.settings.allowContentAccess = false
        webView.webChromeClient = WebChromeClient()

        // LAB Alpha 2.1: serve the bundled P.P.F web directly from Android assets.
        // This keeps GitHub Pages/GOLD untouched while preserving an HTTPS-like origin
        // for WebView storage and relative web resources.
        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()
        val labUrl = "https://appassets.androidplatform.net/assets/ppf/index.html"

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest?): WebResourceResponse? {
                return request?.url?.let { assetLoader.shouldInterceptRequest(it) }
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url ?: return false
                return if (url.host == "appassets.androidplatform.net") false else {
                    startActivity(Intent(Intent.ACTION_VIEW, url))
                    true
                }
            }
        }
        webView.addJavascriptInterface(AndroidHealthBridge(), "AndroidHealthBridge")
        webView.loadUrl(labUrl)
    }

    override fun onBackPressed() {
        if (::webView.isInitialized && webView.canGoBack()) webView.goBack() else super.onBackPressed()
    }

    inner class AndroidHealthBridge {
        @JavascriptInterface
        fun requestPermissions(athlete: String) {
            pendingAthlete = athlete.trim()
            runOnUiThread {
                when (HealthConnectClient.getSdkStatus(this@MainActivity, providerPackage)) {
                    HealthConnectClient.SDK_AVAILABLE -> lifecycleScope.launch {
                        val client = HealthConnectClient.getOrCreate(this@MainActivity, providerPackage)
                        val granted = client.permissionController.getGrantedPermissions()
                        if (granted.containsAll(requestedPermissions)) {
                            emitPermissionState(pendingAthlete, granted)
                            syncHealth(pendingAthlete)
                        } else {
                            permissionLauncher.launch(requestedPermissions)
                        }
                    }
                    HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> openHealthConnectStore()
                    else -> toast("Health Connect no está disponible en este Android.")
                }
            }
        }

        @JavascriptInterface
        fun sync(athlete: String) {
            val id = athlete.trim()
            runOnUiThread { lifecycleScope.launch { syncHealth(id) } }
        }

        @JavascriptInterface
        fun openPermissions(athlete: String) {
            pendingAthlete = athlete.trim()
            runOnUiThread {
                try {
                    startActivity(Intent(HealthConnectClient.ACTION_HEALTH_CONNECT_SETTINGS))
                } catch (_: Exception) {
                    openHealthConnectStore()
                }
            }
        }
    }

    private suspend fun syncHealth(athlete: String) {
        if (athlete.isBlank()) {
            toast("P.P.F. no ha podido identificar al deportista conectado.")
            return
        }
        if (HealthConnectClient.getSdkStatus(this, providerPackage) != HealthConnectClient.SDK_AVAILABLE) {
            toast("Health Connect no está disponible.")
            return
        }

        val client = HealthConnectClient.getOrCreate(this, providerPackage)
        val granted = client.permissionController.getGrantedPermissions()
        val records = JSONArray()
        val now = Instant.now()
        val zone = ZoneId.systemDefault()
        val todayStart = LocalDate.now(zone).atStartOfDay(zone).toInstant()

        if (granted.contains(HealthPermission.getReadPermission(StepsRecord::class))) {
            // Diagnóstico Alpha 2 · fase 2:
            // 1) repetir una ventana amplia de 7 días, igual que la Toolbox,
            // 2) comparar lectura RAW vs AGGREGATE,
            // 3) mantener separada la ventana real de HOY para no mezclar días.
            val diagnosticStart = now.minus(7, ChronoUnit.DAYS)

            val raw7d = client.readRecords(
                ReadRecordsRequest(
                    recordType = StepsRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(diagnosticStart, now),
                    ascendingOrder = true
                )
            )
            val raw7dTotal = raw7d.records.sumOf { it.count }

            val aggregate7d = client.aggregate(
                AggregateRequest(
                    metrics = setOf(StepsRecord.COUNT_TOTAL),
                    timeRangeFilter = TimeRangeFilter.between(diagnosticStart, now)
                )
            )
            val aggregate7dTotal = aggregate7d[StepsRecord.COUNT_TOTAL] ?: 0L

            val rawToday = client.readRecords(
                ReadRecordsRequest(
                    recordType = StepsRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(todayStart, now),
                    ascendingOrder = true
                )
            )
            val rawTodayTotal = rawToday.records.sumOf { it.count }

            val aggregateToday = client.aggregate(
                AggregateRequest(
                    metrics = setOf(StepsRecord.COUNT_TOTAL),
                    timeRangeFilter = TimeRangeFilter.between(todayStart, now)
                )
            )
            val aggregateTodayTotal = aggregateToday[StepsRecord.COUNT_TOTAL] ?: 0L

            // Toast diagnóstico temporal. Nos dirá si P.P.F. puede ver datos de Toolbox
            // en ventana amplia y/o únicamente mediante aggregate().
            toast(
                "Steps DIAG · 7d RAW ${raw7d.records.size}/$raw7dTotal · " +
                        "7d AGG $aggregate7dTotal · HOY RAW ${rawToday.records.size}/$rawTodayTotal · " +
                        "HOY AGG $aggregateTodayTotal"
            )

            // Para P.P.F. usamos el agregado oficial del día, que es la vía recomendada
            // para un tipo acumulativo como StepsRecord y evita doble conteo entre fuentes.
            if (aggregateTodayTotal > 0L) {
                records.put(
                    record(
                        athlete, "steps", todayStart, now, aggregateTodayTotal, "count",
                        "health_connect", "Android",
                        externalId = "healthconnect:steps:${LocalDate.now(zone)}"
                    )
                )
            }
        }

        if (granted.contains(HealthPermission.getReadPermission(HeartRateRecord::class))) {
            val response = client.readRecords(
                ReadRecordsRequest(
                    recordType = HeartRateRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(now.minus(24, ChronoUnit.HOURS), now),
                    ascendingOrder = true
                )
            )
            response.records.forEach { hr ->
                hr.samples.forEach { sample ->
                    records.put(
                        record(
                            athlete, "heart_rate", sample.time, sample.time,
                            sample.beatsPerMinute, "bpm", "health_connect",
                            hr.metadata.dataOrigin.packageName
                        )
                    )
                }
            }
        }

        if (granted.contains(HealthPermission.getReadPermission(SleepSessionRecord::class))) {
            val response = client.readRecords(
                ReadRecordsRequest(
                    recordType = SleepSessionRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(now.minus(48, ChronoUnit.HOURS), now),
                    ascendingOrder = true
                )
            )
            response.records.forEach { sleep ->
                val minutes = ChronoUnit.MINUTES.between(sleep.startTime, sleep.endTime)
                records.put(
                    record(
                        athlete, "sleep", sleep.startTime, sleep.endTime,
                        minutes, "minutes", "health_connect", sleep.metadata.dataOrigin.packageName
                    )
                )
            }
        }

        if (granted.contains(HealthPermission.getReadPermission(ExerciseSessionRecord::class))) {
            val response = client.readRecords(
                ReadRecordsRequest(
                    recordType = ExerciseSessionRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(todayStart, now),
                    ascendingOrder = true
                )
            )
            response.records.forEach { workout ->
                val metadata = JSONObject()
                    .put("exercise_type", workout.exerciseType)
                    .put("title", workout.title ?: "")
                records.put(
                    record(
                        athlete, "workout", workout.startTime, workout.endTime,
                        workout.exerciseType.toString(), "", "health_connect",
                        workout.metadata.dataOrigin.packageName, metadata
                    )
                )
            }
        }

        val payload = JSONObject()
            .put("athlete_id", athlete)
            .put("source", "health_connect")
            .put("device_source", "Android Health Connect")
            .put("transport", "android-native-bridge")
            .put("permission_scope", JSONArray(permissionScope(granted)))
            .put("records", records)

        injectPayload(payload)
        toast("P.P.F. Health Bridge: sincronización completada")
    }

    private suspend fun emitPermissionState(athlete: String, granted: Set<String>) {
        if (athlete.isBlank()) return
        val payload = JSONObject()
            .put("athlete_id", athlete)
            .put("source", "health_connect")
            .put("device_source", "Android Health Connect")
            .put("transport", "android-native-bridge")
            .put("permission_scope", JSONArray(permissionScope(granted)))
            .put("records", JSONArray())
        injectPayload(payload)
    }

    private fun permissionScope(granted: Set<String>): List<String> {
        val scope = mutableListOf<String>()
        if (granted.contains(HealthPermission.getReadPermission(SleepSessionRecord::class))) scope += "sleep"
        if (granted.contains(HealthPermission.getReadPermission(HeartRateRecord::class))) scope += "heart_rate"
        if (granted.contains(HealthPermission.getReadPermission(StepsRecord::class))) scope += "steps"
        if (granted.contains(HealthPermission.getReadPermission(ExerciseSessionRecord::class))) scope += "workout"
        return scope
    }

    private fun record(
        athlete: String,
        metric: String,
        start: Instant,
        end: Instant,
        value: Any,
        unit: String,
        source: String,
        deviceSource: String,
        metadata: JSONObject = JSONObject(),
        externalId: String = ""
    ): JSONObject = JSONObject()
        .put("athlete_id", athlete)
        .put("metric_type", metric)
        .put("start_time", start.toString())
        .put("end_time", end.toString())
        .put("value", value)
        .put("unit", unit)
        .put("source", source)
        .put("device_source", deviceSource)
        .put("external_id", externalId)
        .put("metadata", metadata)
        .put("recorded_at", end.toString())

    private fun injectPayload(payload: JSONObject) {
        val quoted = JSONObject.quote(payload.toString())
        runOnUiThread {
            webView.evaluateJavascript(
                "window.PPF_HEALTH_BRIDGE && window.PPF_HEALTH_BRIDGE.ingest(JSON.parse($quoted));",
                null
            )
        }
    }

    private fun openHealthConnectStore() {
        val uri = Uri.parse("market://details?id=$providerPackage&url=healthconnect%3A%2F%2Fonboarding")
        try {
            startActivity(Intent(Intent.ACTION_VIEW, uri).apply { setPackage("com.android.vending") })
        } catch (_: Exception) {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=$providerPackage")))
        }
    }

    private fun toast(message: String) = runOnUiThread {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }
}