import Foundation
import HealthKit

final class PPFHealthKitManager {

    static let shared = PPFHealthKitManager()

    let healthStore = HKHealthStore()

    private init() {}

    // MARK: - Availability

    var isHealthKitAvailable: Bool {
        HKHealthStore.isHealthDataAvailable()
    }

    // MARK: - HealthKit Types

    private var stepType: HKQuantityType {
        HKQuantityType(.stepCount)
    }

    private var heartRateType: HKQuantityType {
        HKQuantityType(.heartRate)
    }

    private var sleepType: HKCategoryType {
        HKCategoryType(.sleepAnalysis)
    }

    private var workoutType: HKWorkoutType {
        HKWorkoutType.workoutType()
    }

    // MARK: - Read Permissions

    private var readTypes: Set<HKObjectType> {
        [
            stepType,
            heartRateType,
            sleepType,
            workoutType
        ]
    }

    // MARK: - Authorization

    func requestAuthorization() async throws {

        guard isHealthKitAvailable else {
            throw PPFHealthKitError.healthKitUnavailable
        }

        try await healthStore.requestAuthorization(
            toShare: [],
            read: readTypes
        )
    }
}

// MARK: - Errors

enum PPFHealthKitError: LocalizedError {

    case healthKitUnavailable

    var errorDescription: String? {
        switch self {
        case .healthKitUnavailable:
            return "HealthKit no está disponible en este dispositivo."
        }
    }
}

