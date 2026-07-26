@file:Suppress("HttpUrlsUsage", "UnresolvedHttpHeader", "UsePropertyAccessSyntax", "DEPRECATION")

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
import com.intellij.ui.jcef.JBCefBrowser
import com.intellij.ui.jcef.JBCefBrowserBase
import com.intellij.ui.jcef.JBCefJSQuery
import com.intellij.util.ui.JBUI
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import java.awt.BorderLayout
import java.awt.CardLayout
import java.awt.Color
import java.awt.Component
import java.awt.FlowLayout
import java.awt.Font
import java.awt.GridBagConstraints
import java.awt.GridBagLayout
import java.awt.datatransfer.StringSelection
import java.net.URI
import java.net.URLEncoder
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.nio.charset.StandardCharsets
import javax.swing.BorderFactory
import javax.swing.DefaultListCellRenderer
import javax.swing.DefaultListModel
import javax.swing.JButton
import javax.swing.JComboBox
import javax.swing.JLabel
import javax.swing.JList
import javax.swing.JPanel
import javax.swing.JTextField
import javax.swing.SwingConstants
import javax.swing.SwingUtilities
import javax.swing.Timer

private const val API_BASE = "https://iconsearch.info"
private const val PRODUCT = "jetbrains"
private val LOG = Logger.getInstance("IconSearch")
private val JSON = Json { ignoreUnknownKeys = true }

class IconSearchToolWindowFactory : ToolWindowFactory, DumbAware {
    override fun createToolWindowContent(project: Project, toolWindow: ToolWindow) {
        val panel = if (isJcefSupportedSafely()) {
            try {
                JcefIconSearchPanel(project)
            } catch (e: Throwable) {
                LOG.warn("JCEF init failed, falling back to Swing panel", e)
                NativeSwingIconSearchPanel(project)
            }
        } else {
            NativeSwingIconSearchPanel(project)
        }
        val content = ContentFactory.getInstance().createContent(panel, "", false)
        toolWindow.contentManager.addContent(content)
    }
}

private fun isJcefSupportedSafely(): Boolean {
    return try {
        val clazz = Class.forName("com.intellij.ui.jcef.JBCefApp")
        val method = clazz.getMethod("isSupported")
        method.invoke(null) as? Boolean == true
    } catch (_: Throwable) {
        false
    }
}

class OpenIconSearchAction : AnAction(), DumbAware {
    override fun actionPerformed(event: AnActionEvent) {
        val project = event.project ?: return
        ToolWindowManager.getInstance(project).getToolWindow("IconSearch")?.activate(null)
    }
}

private class JcefIconSearchPanel(private val project: Project) : JBPanel<JcefIconSearchPanel>(BorderLayout()) {
    private val browser = JBCefBrowser()
    private val jsQuery = JBCefJSQuery.create(browser as JBCefBrowserBase)

    init {
        add(browser.component, BorderLayout.CENTER)

        try {
            browser.jbCefClient.addLifeSpanHandler(object : org.cef.handler.CefLifeSpanHandlerAdapter() {
                override fun onBeforePopup(
                    browser: org.cef.browser.CefBrowser?,
                    frame: org.cef.browser.CefFrame?,
                    target_url: String?,
                    target_frame_name: String?
                ): Boolean {
                    if (!target_url.isNullOrBlank()) {
                        BrowserUtil.browse(target_url)
                    }
                    return true
                }
            }, browser.cefBrowser)
        } catch (t: Throwable) {
            LOG.warn("Could not attach life span handler to JCEF", t)
        }

        jsQuery.addHandler { request ->
            handleBridgeRequest(request)
            null
        }

        val initialToken = token()
        val htmlContent = buildHtmlApp(jsQuery.inject("data"), initialToken)
        browser.loadHTML(htmlContent, "https://iconsearch.info/")
    }

    private fun handleBridgeRequest(jsonStr: String) {
        try {
            val obj = parseObject(jsonStr)
            when (val action = obj.string("action")) {
                "insert", "copy" -> {
                    val code = obj.string("code")
                    val name = obj.string("name")
                    if (action == "insert") {
                        val editor = FileEditorManager.getInstance(project).selectedTextEditor
                        if (editor != null) {
                            WriteCommandAction.runWriteCommandAction(project) {
                                val selection = editor.selectionModel
                                if (selection.hasSelection()) {
                                    editor.document.replaceString(selection.selectionStart, selection.selectionEnd, code)
                                } else {
                                    editor.document.insertString(editor.caretModel.offset, code)
                                }
                            }
                        } else {
                            com.intellij.openapi.ide.CopyPasteManager.getInstance().setContents(StringSelection(code))
                            ui { Messages.showInfoMessage(project, "Copied $name to clipboard (no active editor).", "IconSearch") }
                        }
                    } else {
                        com.intellij.openapi.ide.CopyPasteManager.getInstance().setContents(StringSelection(code))
                        ui { Messages.showInfoMessage(project, "Copied $name snippet.", "IconSearch") }
                    }
                }
                "saveToken" -> {
                    val newToken = obj.string("token")
                    PasswordSafe.instance.set(CredentialAttributes("IconSearch JetBrains"), Credentials("IconSearch", newToken))
                }
                "clearToken" -> {
                    PasswordSafe.instance.set(CredentialAttributes("IconSearch JetBrains"), null)
                }
                "browse" -> {
                    val url = obj.string("url")
                    if (url.isNotBlank()) BrowserUtil.browse(url)
                }
                else -> LOG.warn("Unknown bridge action: $action")
            }
        } catch (e: Exception) {
            LOG.warn("Bridge handler error", e)
        }
    }

    private fun token(): String = PasswordSafe.instance.getPassword(CredentialAttributes("IconSearch JetBrains")) ?: ""
    private fun ui(task: () -> Unit) = SwingUtilities.invokeLater(task)
}

private class NativeSwingIconSearchPanel(private val project: Project) : JBPanel<NativeSwingIconSearchPanel>(BorderLayout()) {
    private val cards = CardLayout()
    private val cardPanel = JPanel(cards)
    private val client = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build()

    // Auth Screen Controls
    private val authStatusLabel = JLabel("Connect your IconSearch account to search & insert 355,000+ vector SVG icons.", SwingConstants.CENTER)
    private val userCodeLabel = JLabel("", SwingConstants.CENTER)
    private val startAuthBtn = JButton("Connect IconSearch Account")
    private val manualTokenField = JTextField()
    private val saveTokenBtn = JButton("Save Token")

    // Main App Controls
    private val queryField = JTextField()
    private val libraryBox = JComboBox(
        arrayOf(
            LibraryOption("all", "All Libraries (355k+)"),
            LibraryOption("lucide-icons", "Lucide Icons"),
            LibraryOption("heroicons", "Heroicons"),
            LibraryOption("tabler-icons", "Tabler Icons"),
            LibraryOption("phosphor-icons", "Phosphor Icons"),
            LibraryOption("remix-icon", "Remix Icon"),
            LibraryOption("bootstrap-icons", "Bootstrap Icons")
        )
    )
    private val formatBox = JComboBox(arrayOf("React JSX", "Raw SVG", "Tailwind CSS", "Vue", "Svelte", "URL"))
    private val statusLabel = JLabel("Ready")
    private val resultModel = DefaultListModel<IconSearchIcon>()
    private val resultList = JBList(resultModel)

    private var pollTimer: Timer? = null
    private var pendingDeviceCode = ""

    init {
        border = JBUI.Borders.empty()
        
        // --- 1. BUILD AUTH CARD (CONNECT SCREEN FIRST) ---
        val authCard = JPanel(GridBagLayout()).apply {
            background = Color(0x1e, 0x1e, 0x2e)
            border = JBUI.Borders.empty(20)
        }
        val gbc = GridBagConstraints().apply {
            gridx = 0
            gridy = GridBagConstraints.RELATIVE
            fill = GridBagConstraints.HORIZONTAL
            weightx = 1.0
            ipadx = 4
            ipady = 4
        }

        val titleLabel = JLabel("IconSearch for JetBrains", SwingConstants.CENTER).apply {
            font = font.deriveFont(Font.BOLD, 16f)
            foreground = Color.WHITE
        }
        authCard.add(titleLabel, gbc)

        authStatusLabel.apply {
            foreground = Color(0xa6, 0xad, 0xc8)
            font = font.deriveFont(11f)
        }
        authCard.add(authStatusLabel, gbc)

        userCodeLabel.apply {
            font = font.deriveFont(Font.BOLD, 22f)
            foreground = Color(0x25, 0x63, 0xeb)
        }
        authCard.add(userCodeLabel, gbc)

        startAuthBtn.apply {
            background = Color(0x25, 0x63, 0xeb)
            foreground = Color.WHITE
            font = font.deriveFont(Font.BOLD, 12f)
            isFocusPainted = false
        }
        authCard.add(startAuthBtn, gbc)

        val manualRow = JPanel(BorderLayout(4, 0)).apply {
            background = Color(0x1e, 0x1e, 0x2e)
        }
        manualTokenField.columns = 12
        manualRow.add(manualTokenField, BorderLayout.CENTER)
        manualRow.add(saveTokenBtn, BorderLayout.EAST)
        authCard.add(manualRow, gbc)

        // --- 2. BUILD MAIN APP CARD ---
        val mainCard = JPanel(BorderLayout()).apply {
            background = Color(0x18, 0x18, 0x25)
        }

        val topControls = JPanel(GridBagLayout()).apply {
            background = Color(0x1e, 0x1e, 0x2e)
            border = JBUI.Borders.empty(8)
        }
        val cGbc = GridBagConstraints().apply {
            fill = GridBagConstraints.HORIZONTAL
            weightx = 1.0
            ipadx = 2
            ipady = 2
        }

        cGbc.gridx = 0; cGbc.gridy = 0; cGbc.gridwidth = 2
        topControls.add(queryField, cGbc)

        cGbc.gridy = 1; cGbc.gridwidth = 1; cGbc.gridx = 0
        topControls.add(libraryBox, cGbc)

        cGbc.gridx = 1
        topControls.add(formatBox, cGbc)

        val btnRow = JPanel(FlowLayout(FlowLayout.RIGHT, 4, 0)).apply {
            background = Color(0x1e, 0x1e, 0x2e)
        }
        val searchBtn = JButton("Search")
        val signOutBtn = JButton("Sign Out")
        btnRow.add(searchBtn)
        btnRow.add(signOutBtn)

        cGbc.gridx = 0; cGbc.gridy = 2; cGbc.gridwidth = 2
        topControls.add(btnRow, cGbc)

        mainCard.add(topControls, BorderLayout.NORTH)

        resultList.cellRenderer = IconRenderer()
        resultList.background = Color(0x18, 0x18, 0x25)
        resultList.foreground = Color.WHITE
        mainCard.add(JBScrollPane(resultList), BorderLayout.CENTER)

        val bottomBar = JPanel(BorderLayout()).apply {
            background = Color(0x11, 0x11, 0x1b)
            border = JBUI.Borders.empty(6, 8)
        }
        statusLabel.foreground = Color(0xa6, 0xad, 0xc8)
        bottomBar.add(statusLabel, BorderLayout.WEST)

        val actionRow = JPanel(FlowLayout(FlowLayout.RIGHT, 4, 0)).apply {
            background = Color(0x11, 0x11, 0x1b)
        }
        val copyBtn = JButton("Copy")
        val insertBtn = JButton("Insert into Code").apply {
            background = Color(0x25, 0x63, 0xeb)
            foreground = Color.WHITE
        }
        actionRow.add(copyBtn)
        actionRow.add(insertBtn)
        bottomBar.add(actionRow, BorderLayout.EAST)

        mainCard.add(bottomBar, BorderLayout.SOUTH)

        // Add cards
        cardPanel.add(authCard, "AUTH")
        cardPanel.add(mainCard, "MAIN")
        add(cardPanel, BorderLayout.CENTER)

        // Event bindings
        startAuthBtn.addActionListener { startAuth() }
        saveTokenBtn.addActionListener { saveManualToken() }
        searchBtn.addActionListener { search() }
        queryField.addActionListener { search() }
        signOutBtn.addActionListener { signOut() }
        copyBtn.addActionListener { copySelected() }
        insertBtn.addActionListener { insertSelected() }

        if (token().isNotBlank()) {
            cards.show(cardPanel, "MAIN")
            search()
        } else {
            cards.show(cardPanel, "AUTH")
        }
    }

    private fun startAuth() {
        authStatusLabel.text = "Requesting sign-in code..."
        runPooled {
            val response = postJson("$API_BASE/api/device/start", """{"product":"$PRODUCT","clientName":"JetBrains IDE"}""")
            if (response.statusCode() !in 200..299) error(readError(response.body()))
            val body = parseObject(response.body())
            pendingDeviceCode = body.string("deviceCode")
            val verificationUrl = body.string("verificationUriComplete")
            val userCode = body.string("userCode")

            ui {
                userCodeLabel.text = userCode
                authStatusLabel.text = "Click link or paste token below:"
                BrowserUtil.browse(verificationUrl)

                pollTimer?.stop()
                pollTimer = Timer(3000) { pollAuthStatus() }
                pollTimer?.start()
            }
        }
    }

    private fun saveManualToken() {
        val input = manualTokenField.text.trim()
        if (input.isNotBlank()) {
            PasswordSafe.instance.set(CredentialAttributes("IconSearch JetBrains"), Credentials("IconSearch", input))
            cards.show(cardPanel, "MAIN")
            search()
        }
    }

    private fun pollAuthStatus() {
        val code = pendingDeviceCode
        if (code.isBlank()) return
        runPooled {
            val response = postJson("$API_BASE/api/device/status", """{"deviceCode":"${escapeJson(code)}"}""")
            if (response.statusCode() in 200..299) {
                val body = parseObject(response.body())
                if (body.string("status") == "authorized") {
                    val nextToken = body.string("token")
                    PasswordSafe.instance.set(CredentialAttributes("IconSearch JetBrains"), Credentials("IconSearch", nextToken))
                    pendingDeviceCode = ""
                    ui {
                        pollTimer?.stop()
                        cards.show(cardPanel, "MAIN")
                        search()
                    }
                }
            }
        }
    }

    private fun signOut() {
        PasswordSafe.instance.set(CredentialAttributes("IconSearch JetBrains"), null)
        pollTimer?.stop()
        pendingDeviceCode = ""
        resultModel.clear()
        cards.show(cardPanel, "AUTH")
    }

    private fun search() {
        val currentToken = token()
        if (currentToken.isBlank()) return

        val query = queryField.text.trim()
        val library = (libraryBox.selectedItem as LibraryOption).id
        runPooled {
            val params = mutableListOf("limit=40", "page=1", "sort=${if (query.isBlank()) "popular" else "relevance"}", "legalOnly=1")
            if (query.isNotBlank()) params.add("q=${encode(query)}")
            if (library != "all") params.add("lib=${encode(library)}")

            val request = HttpRequest.newBuilder(URI.create("$API_BASE/api/extension/icon-search?${params.joinToString("&")}"))
                .header("Accept", "application/json")
                .header("Authorization", "Bearer $currentToken")
                .header("X-IconSearch-Product", PRODUCT)
                .GET()
                .build()
            val response = client.send(request, HttpResponse.BodyHandlers.ofString())
            if (response.statusCode() in 200..299) {
                val icons = parseObject(response.body()).jsonArray("icons").mapNotNull(::parseIcon)
                ui {
                    resultModel.clear()
                    icons.forEach(resultModel::addElement)
                    statusLabel.text = "${icons.size} icons loaded"
                }
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

        createSelectedSnippet(icon) { snippet ->
            if (editor != null) {
                WriteCommandAction.runWriteCommandAction(project) {
                    val selection = editor.selectionModel
                    if (selection.hasSelection()) {
                        editor.document.replaceString(selection.selectionStart, selection.selectionEnd, snippet)
                    } else {
                        editor.document.insertString(editor.caretModel.offset, snippet)
                    }
                }
            } else {
                com.intellij.openapi.ide.CopyPasteManager.getInstance().setContents(StringSelection(snippet))
                Messages.showInfoMessage(project, "Copied ${icon.displayName} (no active editor).", "IconSearch")
            }
        }
    }

    private fun createSelectedSnippet(icon: IconSearchIcon, onReady: (String) -> Unit) {
        val format = formatBox.selectedItem?.toString() ?: "React JSX"
        runPooled {
            val snippet = when (format) {
                "URL" -> icon.svgUrl
                "React JSX" -> createReactSnippet(icon)
                "Raw SVG" -> fetchSvg(icon)
                "Vue" -> """<template><img src="${escapeXml(icon.svgUrl)}" alt="${escapeXml(icon.name)}" class="w-5 h-5" /></template>"""
                "Svelte" -> """<img src="${escapeXml(icon.svgUrl)}" alt="${escapeXml(icon.name)}" class="w-5 h-5" />"""
                else -> """<span class="inline-block w-5 h-5 bg-current" style="mask: url('${escapeXml(icon.svgUrl)}') center / contain no-repeat;" role="img" aria-label="${escapeXml(icon.name)}"></span>"""
            }
            ui { onReady(snippet) }
        }
    }

    private fun fetchSvg(icon: IconSearchIcon): String {
        val request = HttpRequest.newBuilder(URI.create(icon.svgUrl)).GET().build()
        val response = client.send(request, HttpResponse.BodyHandlers.ofString())
        return if (response.statusCode() in 200..299) response.body() else ""
    }

    private fun token(): String = PasswordSafe.instance.getPassword(CredentialAttributes("IconSearch JetBrains")) ?: ""

    private fun postJson(url: String, body: String): HttpResponse<String> {
        val request = HttpRequest.newBuilder(URI.create(url))
            .header("Content-Type", "application/json")
            .header("Accept", "application/json")
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
            label.text = "${value.displayName}   [${value.libraryName}]"
            label.border = BorderFactory.createEmptyBorder(6, 8, 6, 8)
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
    val library = item.library
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
        legalSafe = (item["legalSafe"] as? JsonPrimitive)?.booleanOrNull == true,
        svgUrl = previewUrls.firstOrNull() ?: svgUrl,
        previewUrls = previewUrls,
        reactImport = item.string("reactImport").ifBlank { null },
        reactUsage = item.string("reactUsage").ifBlank { null }
    )
}

private val JsonObject.library: String
    get() = string("library")

private fun createReactSnippet(icon: IconSearchIcon): String {
    val usage = icon.reactUsage ?: "<${toPascalCase(icon.name)} className=\"w-5 h-5\" />"
    return icon.reactImport?.let { "${it.trim().removeSuffix(";")};\n\n$usage" } ?: usage
}

private fun parseObject(text: String): JsonObject = JSON.parseToJsonElement(text).jsonObject
private fun JsonObject.string(key: String): String = this[key]?.jsonPrimitive?.contentOrNull ?: ""
private fun JsonObject.jsonArray(key: String): JsonArray = this[key] as? JsonArray ?: JsonArray(emptyList())
private fun readError(text: String): String = runCatching { parseObject(text).string("error") }.getOrNull().orEmpty().ifBlank { "IconSearch request failed." }
private fun encode(value: String): String = URLEncoder.encode(value, StandardCharsets.UTF_8)
private fun escapeJson(value: String): String = value.replace("\\", "\\\\").replace("\"", "\\\"")
private fun escapeXml(value: String): String = value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;")
private fun toPascalCase(value: String): String = value.split(Regex("[-_\\s]+")).filter(String::isNotBlank).joinToString("") { it.replaceFirstChar(Char::uppercaseChar) }
private fun formatIconTitle(value: String): String = value.replace(Regex("([a-z0-9])([A-Z])"), "$1 $2").replace(Regex("([A-Z]+)([A-Z][a-z])"), "$1 $2").split(Regex("[-_\\s]+")).filter(String::isNotBlank).joinToString(" ") { it.replaceFirstChar(Char::uppercaseChar) }
private fun buildHtmlApp(queryScript: String, initialToken: String): String {
    return buildHtmlAppString(queryScript, initialToken)
}

private fun buildHtmlAppString(queryScript: String, initialToken: String): String {
    return """
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>IconSearch</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Inter, system-ui, -apple-system, sans-serif; background: #1e1e2e; color: #cdd6f4; font-size: 12px; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
  .hidden { display: none !important; }
  button, input, select { font: inherit; color: inherit; }

  /* Auth Screen */
  .auth-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center; background: radial-gradient(circle at top, #2b2b40 0%, #1e1e2e 70%); }
  .auth-card { background: #252538; border: 1px solid #363654; border-radius: 16px; padding: 28px 20px; max-width: 320px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
  .auth-logo { width: 56px; height: 56px; border-radius: 14px; margin-bottom: 14px; box-shadow: 0 4px 14px rgba(37,99,235,0.4); }
  .auth-title { font-size: 18px; font-weight: 800; color: #ffffff; margin-bottom: 6px; }
  .auth-subtitle { font-size: 12px; color: #a6adc8; line-height: 1.5; margin-bottom: 20px; }
  
  .btn-primary { width: 100%; height: 38px; background: #2563eb; color: #ffffff; font-weight: 700; border: none; border-radius: 8px; cursor: pointer; transition: all .15s ease; box-shadow: 0 2px 8px rgba(37,99,235,0.3); display: flex; align-items: center; justify-content: center; }
  .btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); }
  .btn-secondary { width: 100%; height: 34px; background: #313244; color: #cdd6f4; font-weight: 600; border: 1px solid #45475a; border-radius: 8px; cursor: pointer; margin-top: 8px; display: flex; align-items: center; justify-content: center; }
  .btn-secondary:hover { background: #45475a; }

  /* App Shell */
  .app-shell { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
  .app-header { padding: 10px 12px; background: #181825; border-bottom: 1px solid #313244; display: flex; align-items: center; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 13px; color: #ffffff; }
  .brand img { width: 22px; height: 22px; border-radius: 5px; }

  .controls { padding: 10px; background: #1e1e2e; border-bottom: 1px solid #313244; display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 8px; }
  .field { display: flex; flex-direction: column; gap: 4px; }
  .field.full { grid-column: 1 / -1; }
  .field label { font-size: 10px; font-weight: 700; color: #a6adc8; text-transform: uppercase; }
  .field input[type="search"], .field select { height: 32px; background: #313244; border: 1px solid #45475a; border-radius: 6px; padding: 0 8px; color: #cdd6f4; outline: none; }
  
  .swatches { padding: 6px 10px; background: #181825; display: flex; gap: 8px; align-items: center; border-bottom: 1px solid #313244; }
  .swatch { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #181825; cursor: pointer; box-shadow: 0 0 0 1px #45475a; }
  .swatch.active { transform: scale(1.15); box-shadow: 0 0 0 2px #2563eb; }

  .results-grid { flex: 1; overflow-y: auto; padding: 8px; display: grid; grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)); gap: 6px; align-content: start; background: #181825; }
  .icon-card { height: 86px; background: #252538; border: 1px solid #313244; border-radius: 8px; padding: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; cursor: pointer; transition: all .12s ease; }
  .icon-card:hover { border-color: #2563eb; background: #2e2e48; transform: translateY(-1px); }
  .icon-card.active { border-color: #2563eb; background: #1e293b; box-shadow: 0 0 0 1px #2563eb inset; }
  .icon-thumb { width: 32px; height: 32px; display: grid; place-items: center; margin-bottom: 4px; }
  .icon-thumb img, .icon-thumb svg { width: 26px; height: 26px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3)); }
  .icon-title { width: 100%; font-size: 10px; font-weight: 700; color: #f5e0dc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .icon-lib { width: 100%; font-size: 9px; color: #9399b2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .preview-footer { padding: 10px; background: #1e1e2e; border-top: 1px solid #313244; display: grid; grid-template-columns: 46px minmax(0,1fr); gap: 10px; align-items: center; }
  .preview-box { width: 46px; height: 46px; background: #313244; border: 1px solid #45475a; border-radius: 8px; display: grid; place-items: center; padding: 4px; }
  .preview-box img, .preview-box svg { width: 100%; height: 100%; object-fit: contain; }
  .footer-actions { display: flex; flex-direction: column; gap: 6px; }
  .footer-row { display: flex; gap: 6px; }
  .footer-row select { flex: 1; height: 30px; background: #313244; border: 1px solid #45475a; border-radius: 6px; padding: 0 6px; font-size: 11px; }

  .status-bar { padding: 5px 10px; background: #11111b; border-top: 1px solid #313244; color: #a6adc8; font-size: 10px; font-weight: 600; display: flex; justify-content: space-between; }
</style>
</head>
<body>

<!-- AUTH SCREEN -->
<div id="authScreen" class="auth-screen">
  <div class="auth-card">
    <img src="https://iconsearch.info/iconsearch-logo-128.png" alt="IconSearch" class="auth-logo" />
    <h2 class="auth-title">IconSearch for JetBrains</h2>
    <p class="auth-subtitle">Search &amp; insert 355,000+ vector SVG icons directly into your React, Vue, Svelte, or HTML code.</p>
    
    <div id="authStatusBox">
      <button id="startAuthBtn" type="button" class="btn-primary">Connect IconSearch Account</button>
      <div style="margin-top:14px;padding-top:10px;border-top:1px solid #363654;">
        <p style="font-size:10px;color:#a6adc8;margin-bottom:6px;font-weight:700;">OR PASTE TOKEN MANUALLY</p>
        <div style="display:flex;gap:6px;">
          <input id="initialManualInput" type="password" placeholder="Paste session token..." style="flex:1;height:32px;background:#181825;border:1px solid #45475a;border-radius:6px;padding:0 8px;color:#cdd6f4;" />
          <button id="initialSaveBtn" type="button" class="btn-secondary" style="margin:0;width:54px;height:32px;font-size:11px;">Save</button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- MAIN APP SHELL -->
<div id="appShell" class="app-shell hidden">
  <div class="app-header">
    <div class="brand">
      <img src="https://iconsearch.info/iconsearch-logo-128.png" alt="" />
      <span>IconSearch</span>
    </div>
    <button id="signOutBtn" type="button" class="btn-secondary" style="width: auto; padding: 0 10px; margin: 0;">Sign out</button>
  </div>

  <div class="controls">
    <div class="field full">
      <input id="searchInput" type="search" placeholder="Search 355,000+ icons..." value="arrow" />
    </div>
    <div class="field">
      <label>Library</label>
      <select id="librarySelect">
        <option value="all">All Libraries (355k+)</option>
        <option value="lucide-icons">Lucide Icons</option>
        <option value="heroicons">Heroicons</option>
        <option value="tabler-icons">Tabler Icons</option>
        <option value="phosphor-icons">Phosphor Icons</option>
        <option value="remix-icon">Remix Icon</option>
        <option value="feather-icons">Feather Icons</option>
        <option value="bootstrap-icons">Bootstrap Icons</option>
      </select>
    </div>
    <div class="field">
      <label>Style</label>
      <select id="styleSelect">
        <option value="all">All Styles</option>
        <option value="stroke">Outline</option>
        <option value="solid">Solid</option>
        <option value="duotone">Duotone</option>
      </select>
    </div>
  </div>

  <div class="swatches">
    <span style="font-size: 10px; font-weight: 700; color: #a6adc8;">COLOR:</span>
    <div class="swatch active" data-color="#ffffff" style="background: #ffffff;"></div>
    <div class="swatch" data-color="#3b82f6" style="background: #3b82f6;"></div>
    <div class="swatch" data-color="#10b981" style="background: #10b981;"></div>
    <div class="swatch" data-color="#a855f7" style="background: #a855f7;"></div>
    <div class="swatch" data-color="#f43f5e" style="background: #f43f5e;"></div>
    <div class="swatch" data-color="#f97316" style="background: #f97316;"></div>
  </div>

  <div id="resultsGrid" class="results-grid"></div>

  <div class="preview-footer">
    <div id="previewBox" class="preview-box"></div>
    <div class="footer-actions">
      <div class="footer-row">
        <select id="formatSelect">
          <option value="react">React JSX (&lt;Icon /&gt;)</option>
          <option value="svg">Raw SVG (&lt;svg&gt;)</option>
          <option value="tailwind">Tailwind CSS Mask</option>
          <option value="vue">Vue Component</option>
          <option value="svelte">Svelte Component</option>
          <option value="url">SVG Data URL</option>
        </select>
      </div>
      <div class="footer-row">
        <button id="insertBtn" type="button" class="btn-primary" style="height: 32px; font-size: 11px;">Insert into Code</button>
        <button id="copyBtn" type="button" class="btn-secondary" style="height: 32px; font-size: 11px; margin: 0; width: 70px;">Copy</button>
      </div>
    </div>
  </div>

  <div class="status-bar">
    <span id="statusText">Ready</span>
    <span id="resultCount">0 icons</span>
  </div>
</div>

<script>
const API_BASE = "https://iconsearch.info";
const PRODUCT = "jetbrains";
let token = "$initialToken";
let pendingCode = "";
let pollTimer = null;
let icons = [];
let selectedIcon = null;
let color = "#ffffff";

const elements = {
  authScreen: document.getElementById("authScreen"),
  appShell: document.getElementById("appShell"),
  authStatusBox: document.getElementById("authStatusBox"),
  startAuthBtn: document.getElementById("startAuthBtn"),
  signOutBtn: document.getElementById("signOutBtn"),
  searchInput: document.getElementById("searchInput"),
  librarySelect: document.getElementById("librarySelect"),
  styleSelect: document.getElementById("styleSelect"),
  resultsGrid: document.getElementById("resultsGrid"),
  previewBox: document.getElementById("previewBox"),
  formatSelect: document.getElementById("formatSelect"),
  insertBtn: document.getElementById("insertBtn"),
  copyBtn: document.getElementById("copyBtn"),
  statusText: document.getElementById("statusText"),
  resultCount: document.getElementById("resultCount")
};

function bridge(data) {
  try {
    $queryScript
  } catch(e) {}
}

boot();

function boot() {
  bindEvents();
  if (token) {
    showApp();
    search();
  } else {
    showAuth();
  }
}

function showAuth() {
  elements.authScreen.classList.remove("hidden");
  elements.appShell.classList.add("hidden");
}

function showApp() {
  elements.authScreen.classList.add("hidden");
  elements.appShell.classList.remove("hidden");
}

function bindEvents() {
  elements.startAuthBtn.onclick = startAuth;
  elements.signOutBtn.onclick = signOut;
  
  const initSave = document.getElementById("initialSaveBtn");
  if (initSave) {
    initSave.onclick = () => {
      const val = document.getElementById("initialManualInput").value.trim();
      if (val) {
        token = val;
        bridge({ action: "saveToken", token: val });
        showApp();
        search();
      }
    };
  }

  elements.searchInput.oninput = debounce(search, 250);
  elements.librarySelect.onchange = search;
  elements.styleSelect.onchange = search;

  document.querySelectorAll(".swatch").forEach(swatch => {
    swatch.onclick = () => {
      document.querySelectorAll(".swatch").forEach(s => s.classList.remove("active"));
      swatch.classList.add("active");
      color = swatch.dataset.color;
      updatePreview();
    };
  });

  elements.insertBtn.onclick = () => doInsert(false);
  elements.copyBtn.onclick = () => doInsert(true);
}

async function startAuth() {
  elements.authStatusBox.innerHTML = '<p style="color:#a6adc8;font-size:11px;">Requesting sign-in code...</p>';
  try {
    const res = await fetch(API_BASE + "/api/device/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: PRODUCT, clientName: "JetBrains IDE" })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to start device auth.");
    
    pendingCode = data.deviceCode;
    const uri = data.verificationUriComplete || (API_BASE + "/connect?product=" + PRODUCT + "&code=" + data.deviceCode);
    const userCode = data.userCode || "";

    elements.authStatusBox.innerHTML = `
      <div style="margin-top:12px;padding:12px;background:#181825;border-radius:10px;border:1px solid #313244;">
        <p style="font-size:10px;color:#a6adc8;font-weight:700;">PAIRING CODE</p>
        <div style="font-size:22px;font-weight:900;letter-spacing:0.1em;color:#2563eb;margin:4px 0 10px 0;">` + userCode + `</div>
        <button id="openBrowserBtn" type="button" class="btn-primary" style="font-size:11px;height:36px;">Open Sign-In Page ↗</button>
        <button id="copyLinkBtn" type="button" class="btn-secondary" style="margin-top:6px;font-size:10px;height:30px;">Copy Link & Code</button>
        
        <div style="margin-top:12px;padding-top:10px;border-top:1px solid #313244;">
          <p style="font-size:10px;color:#a6adc8;margin-bottom:4px;font-weight:700;">PASTE TOKEN MANUALLY</p>
          <div style="display:flex;gap:4px;">
            <input id="manualTokenInput" type="password" placeholder="Paste token..." style="flex:1;height:30px;background:#313244;border:1px solid #45475a;border-radius:6px;padding:0 6px;color:#cdd6f4;" />
            <button id="saveManualTokenBtn" type="button" class="btn-secondary" style="margin:0;width:50px;height:30px;font-size:10px;">Save</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("openBrowserBtn").onclick = (e) => {
      e.preventDefault();
      bridge({ action: "browse", url: uri });
    };

    document.getElementById("copyLinkBtn").onclick = () => {
      bridge({ action: "copy", code: uri, name: "Sign-In Link" });
    };

    document.getElementById("saveManualTokenBtn").onclick = () => {
      const val = document.getElementById("manualTokenInput").value.trim();
      if (val) {
        clearInterval(pollTimer);
        token = val;
        bridge({ action: "saveToken", token: val });
        showApp();
        search();
      }
    };

    bridge({ action: "browse", url: uri });

    clearInterval(pollTimer);
    pollTimer = setInterval(pollAuthStatus, 3000);
  } catch (err) {
    elements.authStatusBox.innerHTML = '<p style="color:#f38ba8;font-size:11px;">' + err.message + '</p><button id="startAuthBtn" type="button" class="btn-primary" style="margin-top:10px;">Retry Connect</button>';
    document.getElementById("startAuthBtn").onclick = startAuth;
  }
}

async function pollAuthStatus() {
  if (!pendingCode) return;
  try {
    const res = await fetch(API_BASE + "/api/device/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceCode: pendingCode })
    });
    const data = await res.json();
    if (res.ok && data.status === "authorized" && data.token) {
      clearInterval(pollTimer);
      token = data.token;
      bridge({ action: "saveToken", token: data.token });
      showApp();
      search();
    }
  } catch (e) {}
}

function signOut() {
  token = "";
  pendingCode = "";
  clearInterval(pollTimer);
  bridge({ action: "clearToken" });
  showAuth();
}

async function search() {
  if (!token) return;
  elements.statusText.textContent = "Searching...";
  
  const q = elements.searchInput.value.trim();
  const lib = elements.librarySelect.value;
  const style = elements.styleSelect.value;

  let url = API_BASE + "/api/extension/icon-search?limit=48&page=1&legalOnly=1&sort=" + (q ? "relevance" : "popular");
  if (q) url += "&q=" + encodeURIComponent(q);
  if (lib !== "all") url += "&lib=" + encodeURIComponent(lib);
  if (style !== "all") url += "&style=" + encodeURIComponent(style);

  try {
    const res = await fetch(url, {
      headers: {
        "accept": "application/json",
        "authorization": "Bearer " + token,
        "x-iconsearch-product": PRODUCT
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Search failed.");

    icons = (data.icons || []).map(normalizeIcon).filter(Boolean);
    elements.resultCount.textContent = (data.total || icons.length) + " icons";
    elements.statusText.textContent = "Ready";

    renderGrid();
  } catch (err) {
    elements.statusText.textContent = err.message || "Error loading icons.";
  }
}

function normalizeIcon(item) {
  if (!item || !item.name || !item.library || !item.svgUrl) return null;
  const rawSvg = item.svgUrl;
  const absoluteSvg = rawSvg.startsWith("/") ? API_BASE + rawSvg : rawSvg;
  return {
    id: item.id || (item.library + "-" + item.name),
    name: item.name,
    displayName: formatTitle(item.displayName || item.name),
    library: item.library,
    libraryName: item.libraryName || formatTitle(item.library),
    svgUrl: absoluteSvg,
    reactImport: item.reactImport,
    reactUsage: item.reactUsage
  };
}

function renderGrid() {
  elements.resultsGrid.innerHTML = "";
  if (icons.length === 0) {
    elements.resultsGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:30px;color:#a6adc8;">No icons found.</p>';
    selectedIcon = null;
    updatePreview();
    return;
  }

  if (!selectedIcon || !icons.some(i => i.id === selectedIcon.id)) {
    selectedIcon = icons[0];
  }

  icons.forEach(icon => {
    const card = document.createElement("div");
    card.className = "icon-card" + (icon.id === selectedIcon.id ? " active" : "");
    
    card.innerHTML = `
      <div class="icon-thumb"><img src="` + icon.svgUrl + `" alt="" /></div>
      <div class="icon-title">` + icon.displayName + `</div>
      <div class="icon-lib">` + icon.libraryName + `</div>
    `;

    card.onclick = () => {
      selectedIcon = icon;
      document.querySelectorAll(".icon-card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      updatePreview();
    };

    card.ondblclick = () => doInsert(false);

    elements.resultsGrid.appendChild(card);
  });

  updatePreview();
}

async function updatePreview() {
  if (!selectedIcon) {
    elements.previewBox.innerHTML = "";
    return;
  }
  try {
    const svgText = await fetchSvg(selectedIcon);
    const styled = styleSvg(svgText, color);
    elements.previewBox.innerHTML = styled;
  } catch (e) {
    elements.previewBox.innerHTML = '<img src="' + selectedIcon.svgUrl + '" alt="' + selectedIcon.name + '" />';
  }
}

async function doInsert(isCopy) {
  if (!selectedIcon) return;
  const format = elements.formatSelect.value;
  let code = "";

  try {
    const rawSvg = await fetchSvg(selectedIcon);
    const styledSvg = styleSvg(rawSvg, color);

    switch (format) {
      case "react":
        const usage = selectedIcon.reactUsage || ('<' + toPascal(selectedIcon.name) + ' className="w-5 h-5" />');
        code = selectedIcon.reactImport ? (selectedIcon.reactImport + "\n\n" + usage) : usage;
        break;
      case "svg":
        code = styledSvg;
        break;
      case "tailwind":
        code = '<span class="inline-block w-5 h-5 bg-current" style="mask: url(\'' + selectedIcon.svgUrl + '\') center / contain no-repeat;" role="img" aria-label="' + selectedIcon.name + '"></span>';
        break;
      case "vue":
      case "svelte":
        code = '<img src="' + selectedIcon.svgUrl + '" alt="' + selectedIcon.name + '" class="w-5 h-5" />';
        break;
      case "url":
        code = selectedIcon.svgUrl;
        break;
    }

    bridge({ action: isCopy ? "copy" : "insert", code, format, name: selectedIcon.displayName });
  } catch (err) {
    alert(err.message || "Action failed.");
  }
}

const svgCache = {};
async function fetchSvg(icon) {
  if (svgCache[icon.id]) return svgCache[icon.id];
  const res = await fetch(icon.svgUrl);
  const text = await res.text();
  svgCache[icon.id] = text;
  return text;
}

function styleSvg(svgText, c) {
  let s = svgText.trim();
  if (c) {
    s = s.replace(/stroke="((?!none)[^"]*)"/gi, 'stroke="' + c + '"');
    s = s.replace(/fill="((?!none)[^"]*)"/gi, 'fill="' + c + '"');
  }
  return s;
}

function formatTitle(val) {
  return val.replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(/[-_\s]+/).filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

function toPascal(val) {
  return val.split(/[-_\s]+/).filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join("");
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
</script>
</body>
</html>
    """.trimIndent()
}
