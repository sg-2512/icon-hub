plugins {
    id("java")
    id("org.jetbrains.kotlin.jvm") version "2.0.21"
    id("org.jetbrains.intellij.platform")
}

group = "info.iconsearch"
version = "0.1.0"

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_22)
    }
}

tasks.withType<JavaCompile>().configureEach {
    sourceCompatibility = "22"
    targetCompatibility = "22"
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")

    intellijPlatform {
        create("2024.1")
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
            sinceBuild = "241"
        }
    }
}
