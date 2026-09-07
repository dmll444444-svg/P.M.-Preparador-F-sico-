import Foundation

enum PPFHealthSnapshotEncoder {

    // MARK: - Encode Snapshot

    static func encode(
        _ snapshot: PPFHealthSnapshot
    ) throws -> Data {

        let encoder = JSONEncoder()

        encoder.outputFormatting = [
            .prettyPrinted,
            .sortedKeys
        ]

        encoder.dateEncodingStrategy = .iso8601

        return try encoder.encode(snapshot)
    }

    // MARK: - Encode Snapshot as String

    static func encodeString(
        _ snapshot: PPFHealthSnapshot
    ) throws -> String {

        let data = try encode(snapshot)

        guard let json = String(
            data: data,
            encoding: .utf8
        ) else {
            throw PPFHealthSnapshotEncoderError.invalidUTF8
        }

        return json
    }
}

// MARK: - Errors

enum PPFHealthSnapshotEncoderError: LocalizedError {

    case invalidUTF8

    var errorDescription: String? {

        switch self {

        case .invalidUTF8:
            return "No se pudo convertir el Snapshot HealthKit a JSON UTF-8."
        }
    }
}
