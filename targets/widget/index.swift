import WidgetKit
import SwiftUI

@main
struct MimoWidgetBundle: WidgetBundle {
    @WidgetBundleBuilder
    var body: some Widget {
        MimoAffirmationWidget()
        if #available(iOS 16.0, *) {
            MimoLockScreenWidget()
        }
    }
}
