import Foundation

// MARK: - P.P.F. Health Models

struct PPFStepsData: Codable {
    let count: Int
    let startDate: Date
    let endDate: Date
}

struct PPFHeartRateData: Codable {
    let latestBPM: Double?
    let latestDate: Date?

    let minimumBPM: Double?
    let maximumBPM: Double?
    let averageBPM: Double?

    let measurements: Int
}

struct PPFSleepData: Codable {
    let totalMinutes: Double
    let startDate: Date?
    let endDate: Date?
}

struct PPFWorkoutData: Codable {
    let count: Int
    let totalMinutes: Double
}
