plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val ppfUrl = (project.findProperty("PPF_URL") as String?)
    ?: "https://dml1444444-svg.github.io/P.M.-Preparador-F-sico-/"

android {
    namespace = "com.ppfpro.healthbridge"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.ppfpro.healthbridge"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "3.6.0-alpha.2"
        buildConfigField("String", "PPF_URL", "\"${ppfUrl}\"")
    }

    buildFeatures { buildConfig = true }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.activity:activity-ktx:1.10.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.health.connect:connect-client:1.1.0")
    implementation("androidx.webkit:webkit:1.12.1")
}
