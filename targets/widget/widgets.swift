import WidgetKit
import SwiftUI

// MARK: - Colors

let lightBackground = Color(red: 0.96, green: 0.94, blue: 0.91) // #F5F0E8
let darkBackground = Color(red: 0.1, green: 0.1, blue: 0.1)   // #1A1A1A

// MARK: - Data Models

struct Affirmation: Codable, Identifiable {
    let id: String
    let text: String
}

// MARK: - Data Provider

struct AffirmationDataProvider {
    static let appGroupID = "group.com.startnode.tito"
    static let affirmationsKey = "widgetAffirmations"

    static func loadAffirmations() -> [Affirmation] {
        guard let userDefaults = UserDefaults(suiteName: appGroupID),
              let jsonString = userDefaults.string(forKey: affirmationsKey),
              let jsonData = jsonString.data(using: .utf8),
              let affirmations = try? JSONDecoder().decode([Affirmation].self, from: jsonData),
              !affirmations.isEmpty else {
            return getDefaultAffirmations()
        }
        return affirmations
    }

    static func getDefaultAffirmations() -> [Affirmation] {
        [
            Affirmation(id: "default1", text: "Todo lo puedo en Cristo que me fortalece — Filipenses 4:13"),
            Affirmation(id: "default2", text: "El Señor es mi pastor, nada me falta — Salmos 23:1"),
            Affirmation(id: "default3", text: "Porque yo sé los planes que tengo para ustedes — Jeremías 29:11"),
        ]
    }

    static func getRandomAffirmation() -> Affirmation {
        loadAffirmations().randomElement() ?? getDefaultAffirmations()[0]
    }

    /// Obtiene un versículo corto apropiado para lock screen (max 60 caracteres)
    static func getShortAffirmation() -> Affirmation {
        let affirmations = loadAffirmations()
        let shortAffirmations = affirmations.filter { $0.text.count <= 60 }
        return shortAffirmations.randomElement() ?? affirmations.randomElement() ?? getDefaultAffirmations()[0]
    }
}

// MARK: - Timeline Entry

struct AffirmationEntry: TimelineEntry {
    let date: Date
    let affirmation: Affirmation
}

// MARK: - Timeline Providers

/// Timeline provider para widgets de Home Screen (versículos)
struct HomeScreenTimelineProvider: TimelineProvider {
    func placeholder(in context: Context) -> AffirmationEntry {
        AffirmationEntry(date: Date(), affirmation: AffirmationDataProvider.getRandomAffirmation())
    }

    func getSnapshot(in context: Context, completion: @escaping (AffirmationEntry) -> Void) {
        completion(AffirmationEntry(date: Date(), affirmation: AffirmationDataProvider.getRandomAffirmation()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<AffirmationEntry>) -> Void) {
        let currentDate = Date()
        let affirmations = AffirmationDataProvider.loadAffirmations()

        var entries: [AffirmationEntry] = []
        for hourOffset in stride(from: 0, to: 24, by: 4) {
            if let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate) {
                let affirmation = affirmations.randomElement() ?? AffirmationDataProvider.getDefaultAffirmations()[0]
                entries.append(AffirmationEntry(date: entryDate, affirmation: affirmation))
            }
        }

        let refreshDate = Calendar.current.date(byAdding: .hour, value: 4, to: currentDate) ?? currentDate
        completion(Timeline(entries: entries, policy: .after(refreshDate)))
    }
}

/// Timeline provider para widgets de Lock Screen (versículos)
@available(iOS 16.0, *)
struct LockScreenTimelineProvider: TimelineProvider {
    func placeholder(in context: Context) -> AffirmationEntry {
        AffirmationEntry(date: Date(), affirmation: AffirmationDataProvider.getShortAffirmation())
    }

    func getSnapshot(in context: Context, completion: @escaping (AffirmationEntry) -> Void) {
        completion(AffirmationEntry(date: Date(), affirmation: AffirmationDataProvider.getShortAffirmation()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<AffirmationEntry>) -> Void) {
        let currentDate = Date()
        let affirmations = AffirmationDataProvider.loadAffirmations()

        // Filtrar solo versículos cortos para lock screen
        let shortAffirmations = affirmations.filter { $0.text.count <= 60 }
        let availableAffirmations = shortAffirmations.isEmpty ? affirmations : shortAffirmations

        var entries: [AffirmationEntry] = []
        for hourOffset in stride(from: 0, to: 24, by: 4) {
            if let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate) {
                let affirmation = availableAffirmations.randomElement() ?? AffirmationDataProvider.getDefaultAffirmations()[0]
                entries.append(AffirmationEntry(date: entryDate, affirmation: affirmation))
            }
        }

        let refreshDate = Calendar.current.date(byAdding: .hour, value: 4, to: currentDate) ?? currentDate
        completion(Timeline(entries: entries, policy: .after(refreshDate)))
    }
}

// MARK: - Small Widget View

struct SmallWidgetView: View {
    let entry: AffirmationEntry
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        Text(entry.affirmation.text)
            .font(.custom("DMSans_600SemiBold", size: 13))
            .foregroundStyle(colorScheme == .dark ? Color.white : Color.black)
            .multilineTextAlignment(.center)
            .lineLimit(6)
            .minimumScaleFactor(0.6)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(12)
            .containerBackground(for: .widget) {
                colorScheme == .dark ? darkBackground : lightBackground
            }
    }
}

// MARK: - Medium Widget View

struct MediumWidgetView: View {
    let entry: AffirmationEntry
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        ZStack {
            // Texto centrado
            Text(entry.affirmation.text)
                .font(.custom("DMSans_600SemiBold", size: 17))
                .foregroundStyle(colorScheme == .dark ? Color.white : Color.black)
                .multilineTextAlignment(.center)
                .minimumScaleFactor(0.6)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .padding(.horizontal, 16)
                .padding(.bottom, 40)

            // Imagen abajo a la izquierda
            VStack {
                Spacer()
                HStack {
                    Image("Tito")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 50, height: 50)
                    Spacer()
                }
                .padding(.horizontal, 12)
                .padding(.bottom, 10)
            }
        }
        .containerBackground(for: .widget) {
            colorScheme == .dark ? darkBackground : lightBackground
        }
    }
}

// MARK: - Large Widget View

struct LargeWidgetView: View {
    let entry: AffirmationEntry
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        ZStack {
            // Texto centrado
            Text(entry.affirmation.text)
                .font(.custom("DMSans_600SemiBold", size: 24))
                .foregroundStyle(colorScheme == .dark ? Color.white : Color.black)
                .multilineTextAlignment(.center)
                .minimumScaleFactor(0.6)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .padding(.horizontal, 24)
                .padding(.bottom, 60)

            // Imagen abajo a la izquierda
            VStack {
                Spacer()
                HStack {
                    Image("Tito")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 64, height: 64)
                    Spacer()
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 14)
            }
        }
        .containerBackground(for: .widget) {
            colorScheme == .dark ? darkBackground : lightBackground
        }
    }
}

// MARK: - Lock Screen Widget Views

/// Widget rectangular para lock screen (2-3 líneas de texto)
struct LockScreenRectangularView: View {
    let entry: AffirmationEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("Tito")
                .font(.caption2)
                .foregroundStyle(.secondary)
            Text(entry.affirmation.text)
                .font(.custom("DMSans_600SemiBold", size: 13))
                .lineLimit(2)
                .minimumScaleFactor(0.8)
        }
    }
}

/// Widget inline para lock screen (1 línea de texto)
struct LockScreenInlineView: View {
    let entry: AffirmationEntry

    var body: some View {
        Text(entry.affirmation.text)
            .font(.custom("DMSans_600SemiBold", size: 13))
            .lineLimit(1)
            .minimumScaleFactor(0.7)
    }
}

/// Widget circular para lock screen
struct LockScreenCircularView: View {
    let entry: AffirmationEntry

    var body: some View {
        ZStack {
            AccessoryWidgetBackground()
            VStack(spacing: 2) {
                Image(systemName: "cross.fill")
                    .font(.system(size: 20))
                Text("Tito")
                    .font(.caption2)
            }
            .foregroundStyle(.white)
        }
    }
}

// MARK: - Widget Configuration

/// Widget de versículos para Home Screen (Small, Medium, Large)
struct TitoVerseWidget: Widget {
    let kind: String = "TitoVerseWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: HomeScreenTimelineProvider()) { entry in
            HomeScreenWidgetEntryView(entry: entry)
                .widgetURL(URL(string: "tito://?id=\(entry.affirmation.id)"))
        }
        .configurationDisplayName("Versículos")
        .description("Recibe versículos bíblicos durante el día")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

/// Widget de versículos para Lock Screen (Rectangular, Inline, Circular)
@available(iOS 16.0, *)
struct TitoLockScreenWidget: Widget {
    let kind: String = "TitoLockScreenWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: LockScreenTimelineProvider()) { entry in
            LockScreenWidgetEntryView(entry: entry)
                .widgetURL(URL(string: "tito://?id=\(entry.affirmation.id)"))
        }
        .configurationDisplayName("Versículos")
        .description("Versículos bíblicos para tu pantalla de bloqueo")
        #if os(iOS)
        .supportedFamilies([.accessoryRectangular, .accessoryInline, .accessoryCircular])
        #else
        .supportedFamilies([])
        #endif
    }
}

// MARK: - Widget Entry Views

/// Entry view para Home Screen widgets
struct HomeScreenWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: AffirmationEntry

    @ViewBuilder
    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        case .systemLarge:
            LargeWidgetView(entry: entry)
        default:
            MediumWidgetView(entry: entry)
        }
    }
}

/// Entry view para Lock Screen widgets
struct LockScreenWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: AffirmationEntry

    @ViewBuilder
    var body: some View {
        switch family {
        case .accessoryRectangular:
            LockScreenRectangularView(entry: entry)
        case .accessoryInline:
            LockScreenInlineView(entry: entry)
        case .accessoryCircular:
            LockScreenCircularView(entry: entry)
        default:
            LockScreenRectangularView(entry: entry)
        }
    }
}

// MARK: - Previews

// Home Screen Widgets
#Preview("Small", as: .systemSmall) {
    TitoVerseWidget()
} timeline: {
    AffirmationEntry(date: .now, affirmation: Affirmation(id: "1", text: "Todo lo puedo en Cristo que me fortalece — Filipenses 4:13"))
}

#Preview("Medium", as: .systemMedium) {
    TitoVerseWidget()
} timeline: {
    AffirmationEntry(date: .now, affirmation: Affirmation(id: "2", text: "El Señor es mi pastor, nada me falta — Salmos 23:1"))
}

#Preview("Large", as: .systemLarge) {
    TitoVerseWidget()
} timeline: {
    AffirmationEntry(date: .now, affirmation: Affirmation(id: "3", text: "Porque yo sé los planes que tengo para ustedes — Jeremías 29:11"))
}

// Lock Screen Widgets
#if os(iOS)
@available(iOS 16.0, *)
#Preview("Lock Rectangular", as: .accessoryRectangular) {
    TitoLockScreenWidget()
} timeline: {
    AffirmationEntry(date: .now, affirmation: Affirmation(id: "4", text: "El Señor es mi luz — Salmos 27:1"))
}

@available(iOS 16.0, *)
#Preview("Lock Inline", as: .accessoryInline) {
    TitoLockScreenWidget()
} timeline: {
    AffirmationEntry(date: .now, affirmation: Affirmation(id: "5", text: "Dios es amor — 1 Juan 4:8"))
}

@available(iOS 16.0, *)
#Preview("Lock Circular", as: .accessoryCircular) {
    TitoLockScreenWidget()
} timeline: {
    AffirmationEntry(date: .now, affirmation: Affirmation(id: "6", text: "Fe"))
}
#endif
