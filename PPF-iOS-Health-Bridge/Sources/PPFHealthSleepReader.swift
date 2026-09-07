import Foundation
import HealthKit

extension PPFHealthKitManager {

    // MARK: - Sleep

    func fetchLastNightSleep() async throws -> PPFSleepData {

        guard isHealthKitAvailable else {
            throw PPFHealthKitError.healthKitUnavailable
        }

        let calendar = Calendar.current
        let now = Date()

        guard let startWindow = calendar.date(
            byAdding: .hour,
            value: -24,
            to: now
        ) else {
            return PPFSleepData(
                totalMinutes: 0,
                startDate: nil,
                endDate: nil
            )
        }

        let predicate = HKQuery.predicateForSamples(
            withStart: startWindow,
            end: now,
            options: .strictStartDate
        )

        return try await withCheckedThrowingContinuation { continuation in

            let query = HKSampleQuery(
                sampleType: HKCategoryType(.sleepAnalysis),
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

                let sleepSamples = (samples as? [HKCategorySample]) ?? []

                let asleepSamples = sleepSamples.filter { sample in

                    switch sample.value {

                    case HKCategoryValueSleepAnalysis.asleep.rawValue,
                         HKCategoryValueSleepAnalysis.asleepCore.rawValue,
                         HKCategoryValueSleepAnalysis.asleepDeep.rawValue,
                         HKCategoryValueSleepAnalysis.asleepREM.rawValue:

                        return true

                    default:
                        return false
                    }
                }

                let totalSeconds = asleepSamples.reduce(0.0) {
                    partialResult,
                    sample in

                    partialResult +
                    sample.endDate.timeIntervalSince(sample.startDate)
                }

                let firstSleep = asleepSamples.first?.startDate
                let lastSleep = asleepSamples.last?.endDate

                let data = PPFSleepData(
                    totalMinutes: totalSeconds / 60.0,
                    startDate: firstSleep,
                    endDate: lastSleep
                )

                continuation.resume(returning: data)
            }

            healthStore.execute(query)
        }
    }
}
