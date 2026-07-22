package info.iconsearch.jetbrains

import com.intellij.credentialStore.CredentialAttributes
import com.intellij.credentialStore.Credentials
import com.intellij.ide.BrowserUtil
import com.intellij.ide.passwordSafe.PasswordSafe
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.command.WriteCommandAction
import com.intellij.openapi.diagnostic.Logger
import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.Messages
import com.intellij.openapi.wm.ToolWindow
import com.intellij.openapi.wm.ToolWindowFactory
import com.intellij.openapi.wm.ToolWindowManager
import com.intellij.ui.components.JBList
import com.intellij.ui.components.JBPanel
import com.intellij.ui.components.JBScrollPane
import com.intellij.ui.content.ContentFactory
import com.intellij.util.ui.JBUI
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import java.awt.BorderLayout
import java.awt.Component
import java.awt.FlowLayout
import java.awt.GridBagConstraints
import java.awt.GridBagLayout
import java.awt.datatransfer.StringSelection
import java.net.URI
import java.net.URLEncoder
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.nio.charset.StandardCharsets
import javax.swing.DefaultListCellRenderer
import javax.swing.DefaultListModel
import javax.swing.JButton
import javax.swing.JComboBox
import javax.swing.JLabel
import javax.swing.JList
import javax.swing.JPanel
import javax.swing.JTextField
import javax.swing.SwingUtilities
import javax.swing.Timer

private const val API_BASE = "https://iconsearch.info"
private const val PRODUCT = "jetbrains"
private val LOG = Logger.getInstance("IconSearch")
private val JSON = Json { ignoreUnknownKeys = true }

class IconSearchToolWindowFactory : ToolWindowFactory, DumbAware {
    override fun createToolWindowContent(project: Project, toolWindow: ToolWindow) {
        val panel = IconSearchPanel(project)
        val content = ContentFactory.getInstance().createContent(panel, "", false)
        toolWindow.contentManager.addContent(content)
    }
}

class OpenIconSearchAction : AnAction(), DumbAware {
    override fun actionPerformed(event: AnActionEvent) {
        val project = event.project ?: return
        ToolWindowManager.getInstance(project).getToolWindow("IconSearch")?.activate(null)
    }
}

private class IconSearchPanel(private val project: Project) : JBPanel<IconSearchPanel>(BorderLayout()) {
    private val client = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build()
    private val queryField = JTextField()
    private val libraryBox = JComboBox(
        arrayOf(
            LibraryOption("all", "All Libraries"),
            LibraryOption("lucide-icons", "Lucide"),
            LibraryOption("heroicons", "Heroicons"),
            LibraryOption("tabler-icons", "Tabler"),
            LibraryOption("bootstrap-icons", "Bootstrap"),
            LibraryOption("phosphor-icons", "Phosphor"),
            LibraryOption("remix-icon", "Remix"),
            LibraryOption("iconify", "Iconify")
        )
    )
    private val formatBox = JComboBox(arrayOf("react", "svg", "tailwind", "vue", "svelte", "url"))
    private val statusLabel = JLabel()
    private val resultModel = DefaultListModel<IconSearchIcon>()
    private val resultList = JBList(resultModel)
    private var pollTimer: Timer? = null
    private var pendingDeviceCode = ""

    init {
        border = JBUI.Borders.empty(10)

        val top = JPanel(GridBagLayout())
        val constraints = GridBagConstraints().apply {
            fill = GridBagConstraints.HORIZONTAL
            weightx = 1.0
            padx = 4
            pady = 4
        }

        constraints.gridx = 0
        constraints.gridy = 0
        constraints.gridwidth = 4
        top.add(statusLabel, constraints)

        constraints.gridy = 1
        constraints.gridwidth = 1
        top.add(queryField, constraints)

        constraints.gridx = 1
        constraints.weightx = 0.0
        top.add(libraryBox, constraints)

        constraints.gridx = 2
        top.add(formatBox, constraints)

        constraints.gridx = 3
        val searchButton = JButton("Search")
        top.add(searchButton, constraints)

        val authBar = JPanel(FlowLayout(FlowLayout.LEFT, 4, 0))
        val connectButton = JButton("Connect")
        val finishButton = JButton("Finish Sign-In")
        val signOutButton = JButton("Sign Out")
        authBar.add(connectButton)
        authBar.add(finishButton)
        authBar.add(signOutButton)

        constraints.gridx = 0
        constraints.gridy = 2
        constraints.gridwidth = 4
        constraints.weightx = 1.0
        top.add(authBar, constraints)

        add(top, BorderLayout.NORTH)
        add(JBScrollPane(resultList), BorderLayout.CENTER)

        val actions = JPanel(FlowLayout(FlowLayout.RIGHT, 4, 0))
        val copyButton = JButton("Copy")
        val insertButton = JButton("Insert")
        actions.add(copyButton)
        actions.add(insertButton)
        add(actions, BorderLayout.SOUTH)

        resultList.cellRenderer = IconRenderer()
        queryField.addActionListener { search() }
        searchButton.addActionListener { search() }
        connectButton.addActionListener { startSignIn() }
        finishButton.addActionListener { finishSignIn(showPendingMessage = true) }
        signOutButton.addActionListener { signOut() }
        copyButton.addActionListener { copySelected() }
        insertButton.addActionListener { insertSelected() }

        refreshStatus()
    }

    private fun refreshStatus() {
        val connected = token().isNotBlank()
        statusLabel.text = if (connected) "Connected to IconSearch" else "Connect IconSearch to search live icons"
    }

    private fun startSignIn() {
        runPooled {
            val response = postJson("$API_BASE/api/device/start", """{"product":"$PRODUCT","clientName":"JetBrains IDE"}""")
            if (response.statusCode() !in 200..299) error(readError(response.body()))
            val body = parseObject(response.body())
            pendingDeviceCode = body.string("deviceCode")
            val verificationUrl = body.string("verificationUriComplete")
            if (pendingDeviceCode.isBlank() || verificationUrl.isBlank()) error("The sign-in response was incomplete.")

            ui {
                BrowserUtil.browse(verificationUrl)
                statusLabel.text = "Approve the browser link, then return here."
                pollTimer?.stop()
                pollTimer = Timer((body.int("interval", 3).coerceAtLeast(2)) * 1000) { finishSignIn(showPendingMessage = false) }
                pollTimer?.start()
            }
        }
    }

    private fun finishSignIn(showPendingMessage: Boolean) {
        val code = pendingDeviceCode
        if (code.isBlank()) {
            if (showPendingMessage) Messages.showInfoMessage(project, "Start sign-in first.", "IconSearch")
            return
        }

        runPooled {
            val response = postJson("$API_BASE/api/device/status", """{"deviceCode":"${escapeJson(code)}"}""")
            if (response.statusCode() !in 200..299) error(readError(response.body()))
            val body = parseObject(response.body())
            val status = body.string("status")
            if (status != "authorized") {
                if (showPendingMessage) ui { Messages.showInfoMessage(project, "Approval is still pending.", "IconSearch") }
                return@runPooled
            }

            val nextToken = body.string("token")
            if (nextToken.isBlank()) error("The approved session did not include a token.")
            PasswordSafe.instance.set(CredentialAttributes("IconSearch JetBrains"), Credentials("IconSearch", nextToken))
            pendingDeviceCode = ""
            ui {
                pollTimer?.stop()
                refreshStatus()
                Messages.showInfoMessage(project, "IconSearch connected.", "IconSearch")
            }
        }
    }

    private fun signOut() {
        PasswordSafe.instance.set(CredentialAttributes("IconSearch JetBrains"), null)
        pollTimer?.stop()
        pendingDeviceCode = ""
        resultModel.clear()
        refreshStatus()
    }

    private fun search() {
        val currentToken = token()
        if (currentToken.isBlank()) {
            Messages.showWarningDialog(project, "Connect IconSearch before searching.", "IconSearch")
            return
        }

        val query = queryField.text.trim()
        val library = (libraryBox.selectedItem as LibraryOption).id
        runPooled {
            val params = mutableListOf(
                "limit=40",
                "page=1",
                "sort=${if (query.isBlank()) "popular" else "relevance"}",
                "legalOnly=1"
            )
            if (query.isNotBlank()) params.add("q=${encode(query)}")
            if (library != "all") params.add(if (library == "iconify") "lib=iconify" else "lib=${encode(library)}")

            val request = HttpRequest.newBuilder(URI.create("$API_BASE/api/extension/icon-search?${params.joinToString("&")}"))
                .header("accept", "application/json")
                .header("authorization", "Bearer $currentToken")
                .header("x-iconsearch-product", PRODUCT)
                .GET()
                .build()
            val response = client.send(request, HttpResponse.BodyHandlers.ofString())
            if (response.statusCode() !in 200..299) error(readError(response.body()))
            val icons = parseObject(response.body()).jsonArray("icons").mapNotNull(::parseIcon)
            ui {
                resultModel.clear()
                icons.forEach(resultModel::addElement)
                statusLabel.text = "Showing ${icons.size} IconSearch results"
            }
        }
    }

    private fun copySelected() {
        val icon = resultList.selectedValue ?: return
        createSelectedSnippet(icon) { snippet ->
            com.intellij.openapi.ide.CopyPasteManager.getInstance().setContents(StringSelection(snippet))
            Messages.showInfoMessage(project, "Copied ${icon.displayName}.", "IconSearch")
        }
    }

    private fun insertSelected() {
        val icon = resultList.selectedValue ?: return
        val editor = FileEditorManager.getInstance(project).selectedTextEditor
        if (editor == null) {
            copySelected()
            return
        }

        createSelectedSnippet(icon) { snippet ->
            WriteCommandAction.runWriteCommandAction(project) {
                val selection = editor.selectionModel
                if (selection.hasSelection()) {
                    editor.document.replaceString(selection.selectionStart, selection.selectionEnd, snippet)
                } else {
                    editor.document.insertString(editor.caretModel.offset, snippet)
                }
            }
        }
    }

    private fun createSelectedSnippet(icon: IconSearchIcon, onReady: (String) -> Unit) {
        val format = formatBox.selectedItem.toString()
        runPooled {
            val snippet = when (format) {
                "url" -> icon.svgUrl
                "react" -> createReactSnippet(icon)
                "svg" -> fetchSvg(icon)
                "vue" -> """<template>
  <img src="${escapeXml(icon.svgUrl)}" alt="${escapeXml(icon.name)}" class="w-5 h-5" />
</template>"""
                "svelte" -> """<img src="${escapeXml(icon.svgUrl)}" alt="${escapeXml(icon.name)}" class="w-5 h-5" />"""
                else -> """<span class="inline-block w-5 h-5 bg-current" style="mask: url('${escapeXml(icon.svgUrl)}') center / contain no-repeat; -webkit-mask: url('${escapeXml(icon.svgUrl)}') center / contain no-repeat;" role="img" aria-label="${escapeXml(icon.name)}"></span>"""
            }
            ui { onReady(snippet) }
        }
    }

    private fun fetchSvg(icon: IconSearchIcon): String {
        for (url in icon.previewUrls.ifEmpty { listOf(icon.svgUrl) }) {
            val request = HttpRequest.newBuilder(URI.create(url))
                .header("accept", "image/svg+xml,text/plain,*/*")
                .GET()
                .build()
            val response = client.send(request, HttpResponse.BodyHandlers.ofString())
            if (response.statusCode() in 200..299 && response.body().contains("<svg")) {
                return response.body()
                    .replace(Regex("<script\\b[\\s\\S]*?</script\\s*>", RegexOption.IGNORE_CASE), "")
                    .replace(Regex("<foreignObject\\b[\\s\\S]*?</foreignObject\\s*>", RegexOption.IGNORE_CASE), "")
                    .trim()
            }
        }
        error("Could not fetch SVG markup for ${icon.name}.")
    }

    private fun token(): String = PasswordSafe.instance.getPassword(CredentialAttributes("IconSearch JetBrains")) ?: ""

    private fun postJson(url: String, body: String): HttpResponse<String> {
        val request = HttpRequest.newBuilder(URI.create(url))
            .header("content-type", "application/json")
            .header("accept", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build()
        return client.send(request, HttpResponse.BodyHandlers.ofString())
    }

    private fun runPooled(task: () -> Unit) {
        ApplicationManager.getApplication().executeOnPooledThread {
            try {
                task()
            } catch (error: Throwable) {
                LOG.warn(error)
                ui { Messages.showErrorDialog(project, error.message ?: "IconSearch action failed.", "IconSearch") }
            }
        }
    }

    private fun ui(task: () -> Unit) = SwingUtilities.invokeLater(task)
}

private class IconRenderer : DefaultListCellRenderer() {
    override fun getListCellRendererComponent(
        list: JList<*>,
        value: Any?,
        index: Int,
        isSelected: Boolean,
        cellHasFocus: Boolean
    ): Component {
        val label = super.getListCellRendererComponent(list, value, index, isSelected, cellHasFocus) as JLabel
        if (value is IconSearchIcon) {
            label.text = "${value.displayName}   ${value.libraryName}"
            label.toolTipText = "${value.name} - ${value.license ?: "license unknown"}"
        }
        return label
    }
}

private data class LibraryOption(val id: String, val label: String) {
    override fun toString(): String = label
}

private data class IconSearchIcon(
    val id: String,
    val name: String,
    val displayName: String,
    val library: String,
    val libraryName: String,
    val license: String?,
    val legalSafe: Boolean,
    val svgUrl: String,
    val previewUrls: List<String>,
    val reactImport: String?,
    val reactUsage: String?
)

private fun parseIcon(value: kotlinx.serialization.json.JsonElement): IconSearchIcon? {
    val item = value.jsonObject
    val name = item.string("name")
    val library = item.string("library")
    val svgUrl = item.string("svgUrl")
    if (name.isBlank() || library.isBlank() || svgUrl.isBlank()) return null

    val previewUrls = item.jsonArray("previewUrls").mapNotNull { it.jsonPrimitive.contentOrNull }.ifEmpty { listOf(svgUrl) }
    return IconSearchIcon(
        id = item.string("id").ifBlank { "$library-$name" },
        name = name,
        displayName = formatIconTitle(item.string("displayName").ifBlank { name }),
        library = library,
        libraryName = item.string("libraryName").ifBlank { library },
        license = item.string("license").ifBlank { null },
        legalSafe = item["legalSafe"]?.jsonPrimitive?.booleanOrNull == true,
        svgUrl = previewUrls.firstOrNull() ?: svgUrl,
        previewUrls = previewUrls,
        reactImport = item.string("reactImport").ifBlank { null },
        reactUsage = item.string("reactUsage").ifBlank { null }
    )
}

private fun createReactSnippet(icon: IconSearchIcon): String {
    val usage = icon.reactUsage ?: "<${toPascalCase(icon.name)} className=\"w-5 h-5\" />"
    return icon.reactImport?.let { "${it.trim().removeSuffix(";")};\n\n$usage" } ?: usage
}

private fun parseObject(text: String): JsonObject = JSON.parseToJsonElement(text).jsonObject

private fun JsonObject.string(key: String): String = this[key]?.jsonPrimitive?.contentOrNull ?: ""

private fun JsonObject.int(key: String, fallback: Int): Int = this[key]?.jsonPrimitive?.intOrNull ?: fallback

private fun JsonObject.jsonArray(key: String): JsonArray = this[key] as? JsonArray ?: JsonArray(emptyList())

private fun readError(text: String): String = runCatching { parseObject(text).string("error") }.getOrNull().orEmpty().ifBlank { "IconSearch request failed." }

private fun encode(value: String): String = URLEncoder.encode(value, StandardCharsets.UTF_8)

private fun escapeJson(value: String): String = value.replace("\\", "\\\\").replace("\"", "\\\"")

private fun escapeXml(value: String): String = value
    .replace("&", "&amp;")
    .replace("<", "&lt;")
    .replace(">", "&gt;")
    .replace("\"", "&quot;")
    .replace("'", "&#39;")

private fun toPascalCase(value: String): String = value
    .split(Regex("[-_\\s]+"))
    .filter(String::isNotBlank)
    .joinToString("") { it.replaceFirstChar(Char::uppercaseChar) }

private fun formatIconTitle(value: String): String = value
    .replace(Regex("([a-z0-9])([A-Z])"), "$1 $2")
    .replace(Regex("([A-Z]+)([A-Z][a-z])"), "$1 $2")
    .split(Regex("[-_\\s]+"))
    .filter(String::isNotBlank)
    .joinToString(" ") { it.replaceFirstChar(Char::uppercaseChar) }
