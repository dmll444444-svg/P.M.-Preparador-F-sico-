import Foundation
import HealthKit

extension PPFHealthKitManager {

    // MARK: - Steps

    func fetchTodaySteps() async throws -> PPFStepsData {

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

            let query = HKStatisticsQuery(
                quantityType: HKQuantityType(.stepCount),
                quantitySamplePredicate: predicate,
                options: .cumulativeSum
            ) { _, result, error in

                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }

                let steps = result?
                    .sumQuantity()?
                    .doubleValue(for: .count()) ?? 0

                let data = PPFStepsData(
                    count: Int(steps.rounded()),
                    startDate: startOfDay,
                    endDate: now
                )

                continuation.resume(returning: data)
            }

            healthStore.execute(query)
        }
    }
}
