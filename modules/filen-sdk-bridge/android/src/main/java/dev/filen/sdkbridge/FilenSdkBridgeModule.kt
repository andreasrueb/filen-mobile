package dev.filen.sdkbridge

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import uniffi.filen_mobile_sdk_bridge.FilenMobileSdkBridge

class FilenSdkBridgeModule : Module() {
    private var bridge: FilenMobileSdkBridge? = null

    override fun definition() = ModuleDefinition {
        Name("FilenSdkBridge")

        Function("initialize") {
            if (bridge == null) {
                bridge = FilenMobileSdkBridge()
            }
        }

        AsyncFunction("login") { paramsJson: String ->
            getBridge().login(paramsJson)
        }

        AsyncFunction("register") { paramsJson: String ->
            getBridge().register(paramsJson)
        }

        AsyncFunction("reinitSDK") { paramsJson: String ->
            getBridge().reinitSdk(paramsJson)
        }

        AsyncFunction("resendConfirmation") { paramsJson: String ->
            getBridge().resendConfirmation(paramsJson)
        }

        AsyncFunction("forgotPassword") { paramsJson: String ->
            getBridge().forgotPassword(paramsJson)
        }
    }

    private fun getBridge(): FilenMobileSdkBridge {
        return bridge ?: throw IllegalStateException("FilenSdkBridge not initialized. Call initialize() first.")
    }
}
