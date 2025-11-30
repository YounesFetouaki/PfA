import { NextRequest, NextResponse } from "next/server";

// Use pdf-parse which is more compatible with older Node.js versions
// Dynamic import for better Next.js compatibility
async function getPdfParser() {
  try {
    // Try require first (works in Node.js)
    const pdfParseModule = require("pdf-parse");
    return pdfParseModule.default || pdfParseModule;
  } catch (e) {
    console.error("Failed to load pdf-parse with require:", e);
    try {
      // Fallback to dynamic import
      const pdfParseModule = await import("pdf-parse");
      return pdfParseModule.default || pdfParseModule;
    } catch (importError) {
      console.error("Failed to load pdf-parse with import:", importError);
      return null;
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get pdf parser
    const pdfParse = await getPdfParser();
    if (!pdfParse) {
      console.error("pdf-parse module not available");
      return NextResponse.json(
        {
          success: false,
          error: "PDF parser not available. Please ensure pdf-parse is installed in package.json.",
        },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, error: "File must be a PDF" },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure buffer is valid
    if (!buffer || buffer.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid PDF file: empty buffer" },
        { status: 400 }
      );
    }

    // Verify it's a PDF by checking the header
    const pdfHeader = buffer.toString("ascii", 0, 4);
    if (pdfHeader !== "%PDF") {
      return NextResponse.json(
        { success: false, error: "Invalid PDF file: file does not appear to be a valid PDF" },
        { status: 400 }
      );
    }

    // Parse PDF using pdf-parse
    // This works well in API routes and doesn't require Promise.withResolvers
    const data = await pdfParse(buffer);

    if (!data || !data.text) {
      return NextResponse.json(
        { success: false, error: "PDF appears to be empty or unreadable" },
        { status: 400 }
      );
    }

    const trimmedText = data.text.trim();

    if (trimmedText.length === 0) {
      return NextResponse.json(
        { success: false, error: "No text content found in PDF" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text: trimmedText,
    });
  } catch (error: any) {
    console.error("Error parsing PDF:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to parse PDF",
      },
      { status: 500 }
    );
  }
}

