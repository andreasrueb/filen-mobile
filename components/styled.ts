import { withUniwind } from "uniwind"
import { SafeAreaView as RawSafeAreaView } from "react-native-safe-area-context"
import { BottomSheetView as RawBottomSheetView } from "@gorhom/bottom-sheet"

export const SafeAreaView = withUniwind(RawSafeAreaView)
export const BottomSheetView = withUniwind(RawBottomSheetView)
