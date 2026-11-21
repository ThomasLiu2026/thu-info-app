package com.unidy2002.thuinfo

import android.content.Intent
import android.content.pm.PackageManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class PouchSyncModule(private val reactCtx: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactCtx) {

    override fun getName(): String = "PouchSync"

    @ReactMethod
    fun syncCampusCard(payloadJson: String, promise: Promise) {
        try {
            val installed = try {
                reactCtx.packageManager.getPackageInfo(POUCH_PACKAGE, 0)
                true
            } catch (_: PackageManager.NameNotFoundException) {
                false
            }
            if (!installed) {
                promise.resolve(false)
                return
            }
            val intent = Intent(ACTION_SYNC_CAMPUS_CARD).apply {
                setPackage(POUCH_PACKAGE)
                putExtra(EXTRA_PAYLOAD_JSON, payloadJson)
                addFlags(Intent.FLAG_INCLUDE_STOPPED_PACKAGES)
            }
            reactCtx.sendBroadcast(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("POUCH_SYNC_ERROR", e.message, e)
        }
    }

    companion object {
        private const val POUCH_PACKAGE = "com.thomas.autoledger"
        private const val ACTION_SYNC_CAMPUS_CARD = "com.thomas.autoledger.ACTION_SYNC_CAMPUS_CARD"
        private const val EXTRA_PAYLOAD_JSON = "payload_json"
    }
}
