plugins {
    id("java")
    id("org.jetbrains.kotlin.jvm") version "2.1.21"
    id("org.jetbrains.intellij.platform") version "2.18.1"
}

group = "info.iconsearch"
version = "0.1.0"

kotlin {
    jvmToolchain(21)
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.8.1")

    intellijPlatform {
        intellijIdea("2025.1")
        instrumentationTools()
        pluginVerifier()
        zipSigner()
    }
}

intellijPlatform {
    pluginConfiguration {
        id = "info.iconsearch.jetbrains"
        name = "IconSearch"
        version = project.version.toString()

        ideaVersion {
            sinceBuild = "251"
        }
    }
}
