import Foundation

// MARK: - P.P.F. Web Health Record

struct PPFHealthWebRecord: Codable {

    let metric_type: String
    let start_time: Date
    let end_time: Date?
    let value: Double?
    let unit: String
    let source: String
    let device_source: String
}

// MARK: - P.P.F. Web Health Payload

struct PPFHealthWebPayload: Codable {

    let source: String
    let device_source: String
    let transport: String
    let permission_scope: [String]
    let records: [PPFHealthWebRecord]

    // MARK: - Build from native snapshot

    static func make(
        from snapshot: PPFHealthSnapshot
    ) -> PPFHealthWebPayload {

        var records: [PPFHealthWebRecord] = []

        // ----------------------------------------------------
        // Steps
        // ----------------------------------------------------

        records.append(
            PPFHealthWebRecord(
                metric_type: "steps",
                start_time: snapshot.steps.startDate,
                end_time: snapshot.steps.endDate,
                value: Double(snapshot.steps.count),
                unit: "count",
                source: "healthkit",
                device_source: "Apple HealthKit"
            )
        )

        // ----------------------------------------------------
        // Sleep
        // ----------------------------------------------------

        if let sleepStart = snapshot.sleep.startDate,
           let sleepEnd = snapshot.sleep.endDate {

            records.append(
                PPFHealthWebRecord(
                    metric_type: "sleep",
                    start_time: sleepStart,
                    end_time: sleepEnd,
                    value: snapshot.sleep.totalMinutes,
                    unit: "min",
                    source: "healthkit",
                    device_source: "Apple HealthKit"
                )
            )
        }

        // ----------------------------------------------------
        // Heart Rate
        // ----------------------------------------------------

        if let bpm = snapshot.heartRate.latestBPM,
           let date = snapshot.heartRate.latestDate {

            records.append(
                PPFHealthWebRecord(
                    metric_type: "heart_rate",
                    start_time: date,
                    end_time: date,
                    value: bpm,
                    unit: "bpm",
                    source: "healthkit",
                    device_source: "Apple HealthKit"
                )
            )
        }

        return PPFHealthWebPayload(
            source: "healthkit",
            device_source: "Apple HealthKit",
            transport: "ios-native-bridge",
            permission_scope: [
                "steps",
                "heart_rate",
                "sleep",
                "workout"
            ],
            records: records
        )
    }
}
