import Foundation
import HealthKit

extension PPFHealthKitManager {

    // MARK: - Workouts

    func fetchTodayWorkouts() async throws -> PPFWorkoutData {

        guard isHealthKitAvailable else {
            throw PPFHealthKitError.healthKitUnavailable
        }

        let calendar = Calendar.current
        let now = Date()
        let startOfDay = calendar.startOfDay(for: now)

        let predicate = HKQuery.predicateForSamples(
            withStart: startOfDay,
            end: now,
            options: .strictStartDate
        )

        return try await withCheckedThrowingContinuation { continuation in

            let query = HKSampleQuery(
                sampleType: HKWorkoutType.workoutType(),
                predicate: predicate,
                limit: HKObjectQueryNoLimit,
                sortDescriptors: [
                    NSSortDescriptor(
                        key: HKSampleSortIdentifierStartDate,
                        ascending: true
                    )
                ]
            ) { _, samples, error in

                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }

                let workouts = (samples as? [HKWorkout]) ?? []

                let totalSeconds = workouts.reduce(0.0) {
                    partialResult,
                    workout in

                    partialResult + workout.duration
                }

                let data = PPFWorkoutData(
                    count: workouts.count,
                    totalMinutes: totalSeconds / 60.0
                )

                continuation.resume(returning: data)
            }

            healthStore.execute(query)
        }
    }
}
