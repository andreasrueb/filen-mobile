import ExpoModulesCore

public class FilenSdkBridgeModule: Module {
    private var bridge: FilenMobileSdkBridge?

    public func definition() -> ModuleDefinition {
        Name("FilenSdkBridge")

        Function("initialize") {
            if self.bridge == nil {
                self.bridge = FilenMobileSdkBridge()
            }
        }

        AsyncFunction("login") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.login(paramsJson: paramsJson)
        }

        AsyncFunction("register") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.register(paramsJson: paramsJson)
        }

        AsyncFunction("reinitSDK") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.reinitSdk(paramsJson: paramsJson)
        }

        AsyncFunction("resendConfirmation") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.resendConfirmation(paramsJson: paramsJson)
        }

        AsyncFunction("forgotPassword") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.forgotPassword(paramsJson: paramsJson)
        }
    }

    private func getBridge() throws -> FilenMobileSdkBridge {
        guard let bridge = self.bridge else {
            throw NSError(domain: "FilenSdkBridge", code: 1, userInfo: [
                NSLocalizedDescriptionKey: "FilenSdkBridge not initialized. Call initialize() first."
            ])
        }
        return bridge
    }
}
