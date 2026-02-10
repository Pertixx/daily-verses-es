import WidgetKit
import SwiftUI

// MARK: - Colors

let lightBackground = Color(red: 0.961, green: 0.941, blue: 0.910) // #F5F0E8 (parchment)
let darkBackground = Color(red: 0.1, green: 0.1, blue: 0.1)   // #1A1A1A

// MARK: - Data Models

struct Verse: Codable, Identifiable {
    let id: String
    let text: String
}

// For backward compatibility with stored widget data
typealias Affirmation = Verse

// MARK: - Data Provider

struct VerseDataProvider {
    static let appGroupID = "group.com.startnode.tito"
    static let affirmationsKey = "widgetAffirmations"

    static func loadVerses() -> [Verse] {
        guard let userDefaults = UserDefaults(suiteName: appGroupID),
              let jsonString = userDefaults.string(forKey: affirmationsKey),
              let jsonData = jsonString.data(using: .utf8),
              let verses = try? JSONDecoder().decode([Verse].self, from: jsonData),
              !verses.isEmpty else {
            return getDefaultVerses()
        }
        return verses
    }

    static func getDefaultVerses() -> [Verse] {
        [
            Verse(id: "default1", text: "Porque de tal manera amó Dios al mundo — Juan 3:16"),
            Verse(id: "default2", text: "Todo lo puedo en Cristo que me fortalece — Filipenses 4:13"),
            Verse(id: "default3", text: "El Señor es mi pastor, nada me faltará — Salmos 23:1"),
        ]
    }

    static func getRandomVerse() -> Verse {
        loadVerses().randomElement() ?? getDefaultVerses()[0]
    }

    /// Obtiene un versículo corto apropiado para lock screen (max 60 caracteres)
    static func getShortVerse() -> Verse {
        let verses = loadVerses()
        let shortVerses = verses.filter { $0.text.count <= 60 }
        return shortVerses.randomElement() ?? verses.randomElement() ?? getDefaultVerses()[0]
    }
}

// MARK: - Timeline Entry

struct VerseEntry: TimelineEntry {
    let date: Date
    let verse: Verse
}

// Backward compat alias
typealias AffirmationEntry = VerseEntry

// MARK: - Timeline Providers

/// Timeline provider para widgets de Home Screen
struct HomeScreenTimelineProvider: TimelineProvider {
    func placeholder(in context: Context) -> VerseEntry {
        VerseEntry(date: Date(), verse: VerseDataProvider.getRandomVerse())
    }

    func getSnapshot(in context: Context, completion: @escaping (VerseEntry) -> Void) {
        completion(VerseEntry(date: Date(), verse: VerseDataProvider.getRandomVerse()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<VerseEntry>) -> Void) {
        let currentDate = Date()
        let verses = VerseDataProvider.loadVerses()

        var entries: [VerseEntry] = []
        for hourOffset in stride(from: 0, to: 24, by: 4) {
            if let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate) {
                let verse = verses.randomElement() ?? VerseDataProvider.getDefaultVerses()[0]
                entries.append(VerseEntry(date: entryDate, verse: verse))
            }
        }

        let refreshDate = Calendar.current.date(byAdding: .hour, value: 4, to: currentDate) ?? currentDate
        completion(Timeline(entries: entries, policy: .after(refreshDate)))
    }
}

/// Timeline provider para widgets de Lock Screen
@available(iOS 16.0, *)
struct LockScreenTimelineProvider: TimelineProvider {
    func placeholder(in context: Context) -> VerseEntry {
        VerseEntry(date: Date(), verse: VerseDataProvider.getShortVerse())
    }

    func getSnapshot(in context: Context, completion: @escaping (VerseEntry) -> Void) {
        completion(VerseEntry(date: Date(), verse: VerseDataProvider.getShortVerse()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<VerseEntry>) -> Void) {
        let currentDate = Date()
        let verses = VerseDataProvider.loadVerses()

        // Filtrar solo versículos cortos para lock screen
        let shortVerses = verses.filter { $0.text.count <= 60 }
        let availableVerses = shortVerses.isEmpty ? verses : shortVerses

        var entries: [VerseEntry] = []
        for hourOffset in stride(from: 0, to: 24, by: 4) {
            if let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate) {
                let verse = availableVerses.randomElement() ?? VerseDataProvider.getDefaultVerses()[0]
                entries.append(VerseEntry(date: entryDate, verse: verse))
            }
        }

        let refreshDate = Calendar.current.date(byAdding: .hour, value: 4, to: currentDate) ?? currentDate
        completion(Timeline(entries: entries, policy: .after(refreshDate)))
    }
}

// MARK: - Small Widget View

struct SmallWidgetView: View {
    let entry: VerseEntry
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        Text(entry.verse.text)
            .font(.custom("Nunito_600SemiBold", size: 13))
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
    let entry: VerseEntry
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        ZStack {
            // Texto centrado
            Text(entry.verse.text)
                .font(.custom("Nunito_600SemiBold", size: 17))
                .foregroundStyle(colorScheme == .dark ? Color.white : Color.black)
                .multilineTextAlignment(.center)
                .minimumScaleFactor(0.6)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .padding(.horizontal, 16)
                .padding(.bottom, 40)

            // Icono de cruz abajo a la izquierda
            VStack {
                Spacer()
                HStack {
                    Text("✝️")
                        .font(.system(size: 28))
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
    let entry: VerseEntry
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        ZStack {
            // Texto centrado
            Text(entry.verse.text)
                .font(.custom("Nunito_600SemiBold", size: 24))
                .foregroundStyle(colorScheme == .dark ? Color.white : Color.black)
                .multilineTextAlignment(.center)
                .minimumScaleFactor(0.6)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .padding(.horizontal, 24)
                .padding(.bottom, 60)

            // Icono de cruz abajo a la izquierda
            VStack {
                Spacer()
                HStack {
                    Text("✝️")
                        .font(.system(size: 36))
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

/// Widget rectangular para lock screen (2-3 lineas de texto)
struct LockScreenRectangularView: View {
    let entry: VerseEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("Versículo")
                .font(.caption2)
                .foregroundStyle(.secondary)
            Text(entry.verse.text)
                .font(.custom("Nunito_600SemiBold", size: 13))
                .lineLimit(2)
                .minimumScaleFactor(0.8)
        }
    }
}

/// Widget inline para lock screen (1 linea de texto)
struct LockScreenInlineView: View {
    let entry: VerseEntry

    var body: some View {
        Text(entry.verse.text)
            .font(.custom("Nunito_600SemiBold", size: 13))
            .lineLimit(1)
            .minimumScaleFactor(0.7)
    }
}

/// Widget circular para lock screen
struct LockScreenCircularView: View {
    let entry: VerseEntry

    var body: some View {
        ZStack {
            AccessoryWidgetBackground()
            VStack(spacing: 2) {
                Image(systemName: "cross.fill")
                    .font(.system(size: 20))
                Text("✝️")
                    .font(.caption2)
            }
            .foregroundStyle(.white)
        }
    }
}

// MARK: - Widget Configuration

/// Widget para Home Screen (Small, Medium, Large)
struct MimoAffirmationWidget: Widget {
    // Keep kind string for backward compat with existing widget installations
    let kind: String = "MimoAffirmationWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: HomeScreenTimelineProvider()) { entry in
            HomeScreenWidgetEntryView(entry: entry)
                .widgetURL(URL(string: "versiculo://?verseId=\(entry.verse.id)"))
        }
        .configurationDisplayName("Versículos")
        .description("Recibí versículos bíblicos durante el día")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

/// Widget para Lock Screen (Rectangular, Inline, Circular)
@available(iOS 16.0, *)
struct MimoLockScreenWidget: Widget {
    // Keep kind string for backward compat with existing widget installations
    let kind: String = "MimoLockScreenWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: LockScreenTimelineProvider()) { entry in
            LockScreenWidgetEntryView(entry: entry)
                .widgetURL(URL(string: "versiculo://?verseId=\(entry.verse.id)"))
        }
        .configurationDisplayName("Versículos")
        .description("Versículos para tu pantalla de bloqueo")
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
    let entry: VerseEntry

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
    let entry: VerseEntry

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
    MimoAffirmationWidget()
} timeline: {
    VerseEntry(date: .now, verse: Verse(id: "1", text: "El Señor es mi pastor — Sal 23:1"))
}

#Preview("Medium", as: .systemMedium) {
    MimoAffirmationWidget()
} timeline: {
    VerseEntry(date: .now, verse: Verse(id: "2", text: "Todo lo puedo en Cristo — Fil 4:13"))
}

#Preview("Large", as: .systemLarge) {
    MimoAffirmationWidget()
} timeline: {
    VerseEntry(date: .now, verse: Verse(id: "3", text: "Porque yo sé los planes que tengo para ustedes — Jer 29:11"))
}

// Lock Screen Widgets
#if os(iOS)
@available(iOS 16.0, *)
#Preview("Lock Rectangular", as: .accessoryRectangular) {
    MimoLockScreenWidget()
} timeline: {
    VerseEntry(date: .now, verse: Verse(id: "4", text: "Dios es nuestro refugio — Sal 46:1"))
}

@available(iOS 16.0, *)
#Preview("Lock Inline", as: .accessoryInline) {
    MimoLockScreenWidget()
} timeline: {
    VerseEntry(date: .now, verse: Verse(id: "5", text: "Confía en el Señor — Prov 3:5"))
}

@available(iOS 16.0, *)
#Preview("Lock Circular", as: .accessoryCircular) {
    MimoLockScreenWidget()
} timeline: {
    VerseEntry(date: .now, verse: Verse(id: "6", text: "Fe"))
}
#endif
