var MAX_BASE64_LENGTH = 6 * 1024 * 1024;
var MIN_ICON_SIZE = 24;
var MAX_ICON_SIZE = 240;
var ALLOWED_POSITIONS = {
  center: true,
  "top-left": true,
  "top-right": true,
  content: true,
};

function onOpen() {
  SlidesApp.getUi()
    .createAddonMenu()
    .addItem("Open IconSearch", "showSidebar")
    .addToUi();
}

function onInstall() {
  onOpen();
}

function showSidebar() {
  var output = HtmlService.createHtmlOutputFromFile("Sidebar").setTitle("IconSearch");
  SlidesApp.getUi().showSidebar(output);
}

function insertIcon(payload) {
  if (!payload || Object.prototype.toString.call(payload) !== "[object Object]") {
    throw new Error("Icon data is missing or invalid.");
  }

  var base64 = typeof payload.base64 === "string" ? payload.base64.trim() : "";
  if (!base64 || base64.length > MAX_BASE64_LENGTH) {
    throw new Error("The PNG payload is empty or too large.");
  }
  if (base64.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
    throw new Error("The PNG payload is not valid base64.");
  }

  var bytes;
  try {
    bytes = Utilities.base64Decode(base64);
  } catch (error) {
    throw new Error("The PNG payload could not be decoded.");
  }
  assertPngSignature(bytes);

  var name = safeText(payload.name, "Icon", 100);
  var library = safeText(payload.library, "IconSearch", 100);
  var color = safeColor(payload.color);
  var size = clampNumber(payload.size, MIN_ICON_SIZE, MAX_ICON_SIZE, 72);
  var position = ALLOWED_POSITIONS[payload.position] ? payload.position : "center";

  var presentation = SlidesApp.getActivePresentation();
  if (!presentation) throw new Error("Open a presentation before inserting an icon.");
  var selection = presentation.getSelection();
  var page = selection && selection.getCurrentPage();
  if (!page || page.getPageType() !== SlidesApp.PageType.SLIDE) {
    throw new Error("Select a slide before inserting an icon.");
  }

  var slide = page.asSlide();
  var pageWidth = presentation.getPageWidth();
  var pageHeight = presentation.getPageHeight();
  var placement = calculatePlacement(position, size, pageWidth, pageHeight);
  var blob = Utilities.newBlob(bytes, "image/png", filenameFrom(name) + ".png");
  var image = slide.insertImage(blob, placement.left, placement.top, placement.size, placement.size);
  image.setTitle(name + " icon");
  image.setDescription("Inserted with IconSearch from " + library + ". Color " + color + ".");
  image.select();

  return {
    name: name,
    objectId: image.getObjectId(),
    position: position,
    size: placement.size,
  };
}

function assertPngSignature(bytes) {
  var signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (!bytes || bytes.length < signature.length) {
    throw new Error("The image is not a valid PNG.");
  }
  for (var index = 0; index < signature.length; index += 1) {
    var value = (Number(bytes[index]) + 256) % 256;
    if (value !== signature[index]) throw new Error("The image is not a valid PNG.");
  }
}

function calculatePlacement(position, size, width, height) {
  var margin = 24;
  var boundedSize = Math.max(1, Math.min(size, width, height));
  var left = (width - boundedSize) / 2;
  var top = (height - boundedSize) / 2;

  if (position === "top-left") {
    left = margin;
    top = margin;
  } else if (position === "top-right") {
    left = width - boundedSize - margin;
    top = margin;
  } else if (position === "content") {
    left = width * 0.12;
    top = height * 0.22;
  }

  return {
    left: Math.max(0, Math.min(width - boundedSize, left)),
    size: boundedSize,
    top: Math.max(0, Math.min(height - boundedSize, top)),
  };
}

function clampNumber(value, minimum, maximum, fallback) {
  var number = Number(value);
  if (!isFinite(number)) number = fallback;
  return Math.max(minimum, Math.min(maximum, Math.round(number)));
}

function safeColor(value) {
  var color = typeof value === "string" ? value.trim().toUpperCase() : "";
  return /^#[0-9A-F]{6}$/.test(color) ? color : "#2563EB";
}

function safeText(value, fallback, maximumLength) {
  var text = typeof value === "string" ? value : "";
  text = text.replace(/[\u0000-\u001F\u007F<>]/g, " ").replace(/\s+/g, " ").trim();
  return (text || fallback).slice(0, maximumLength);
}

function filenameFrom(value) {
  var filename = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return (filename || "iconsearch-icon").slice(0, 80);
}
