import Foundation

extension PPFHealthKitManager {

    // MARK: - Unified Snapshot

    func buildHealthSnapshot() async throws -> PPFHealthSnapshot {

        async let stepsTask = fetchTodaySteps()
        async let heartRateTask = fetchTodayHeartRate()
        async let sleepTask = fetchLastNightSleep()
        async let workoutsTask = fetchTodayWorkouts()

        let (
            steps,
            heartRate,
            sleep,
            workouts
        ) = try await (
            stepsTask,
            heartRateTask,
            sleepTask,
            workoutsTask
        )

        return PPFHealthSnapshot(
            generatedAt: Date(),
            steps: steps,
            heartRate: heartRate,
            sleep: sleep,
            workouts: workouts
        )
    }
}
