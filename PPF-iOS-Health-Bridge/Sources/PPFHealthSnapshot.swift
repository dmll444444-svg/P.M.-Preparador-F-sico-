import Foundation

// MARK: - P.P.F. Unified Health Snapshot

struct PPFHealthSnapshot: Codable {

    let generatedAt: Date

    let steps: PPFStepsData
    let heartRate: PPFHeartRateData
    let sleep: PPFSleepData
    let workouts: PPFWorkoutData
}
