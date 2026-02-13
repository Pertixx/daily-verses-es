import WidgetKit
import SwiftUI

@main
struct TitoWidgetBundle: WidgetBundle {
    @WidgetBundleBuilder
    var body: some Widget {
        TitoVerseWidget()
        if #available(iOS 16.0, *) {
            TitoLockScreenWidget()
        }
    }
}
