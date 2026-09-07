import Foundation
import HealthKit

extension PPFHealthKitManager {

    // MARK: - Heart Rate

    func fetchTodayHeartRate() async throws -> PPFHeartRateData {

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

        let unit = HKUnit.count().unitDivided(by: .minute())

        return try await withCheckedThrowingContinuation { continuation in

            let query = HKSampleQuery(
                sampleType: HKQuantityType(.heartRate),
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

                let quantitySamples = (samples as? [HKQuantitySample]) ?? []

                let values: [Double] = quantitySamples.map {
                    $0.quantity.doubleValue(for: unit)
                }

                let latestSample = quantitySamples.last

                let latestBPM = latestSample?
                    .quantity
                    .doubleValue(for: unit)

                let latestDate = latestSample?.startDate

                let minimumBPM = values.min()
                let maximumBPM = values.max()

                let averageBPM: Double?

                if values.isEmpty {
                    averageBPM = nil
                } else {
                    averageBPM = values.reduce(0, +) / Double(values.count)
                }

                let data = PPFHeartRateData(
                    latestBPM: latestBPM,
                    latestDate: latestDate,
                    minimumBPM: minimumBPM,
                    maximumBPM: maximumBPM,
                    averageBPM: averageBPM,
                    measurements: values.count
                )

                continuation.resume(returning: data)
            }

            healthStore.execute(query)
        }
    }
}
