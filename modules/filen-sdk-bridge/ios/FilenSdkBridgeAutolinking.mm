#import <Foundation/Foundation.h>
#import <NitroModules/HybridObjectRegistry.hpp>

#include "HybridFilenSdkBridge.hpp"

@interface FilenSdkBridgeAutolinking : NSObject
@end

@implementation FilenSdkBridgeAutolinking

+ (void)load {
    using namespace margelo::nitro;
    using namespace margelo::nitro::filensdk;

    HybridObjectRegistry::registerHybridObjectConstructor(
        "FilenSdkBridge",
        []() -> std::shared_ptr<HybridObject> {
            return std::make_shared<HybridFilenSdkBridge>();
        }
    );
}

@end
