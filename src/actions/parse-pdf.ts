"use server";

// Use pdfjs-dist instead of pdf-parse for better Next.js compatibility
// Dynamic import to avoid issues with server actions
async function getPdfJs() {
  try {
    const pdfjsLib = await import("pdfjs-dist");
    // Disable worker for server-side usage
    if (typeof window === "undefined") {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "";
    }
    return pdfjsLib;
  } catch (e) {
    console.error("Failed to import pdfjs-dist:", e);
    return null;
  }
}

export async function parsePdf(formData: FormData) {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    // Validate file type
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return {
        success: false,
        error: "File must be a PDF",
      };
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: "File size must be less than 10MB",
      };
    }

    try {
      // Get pdfjs library
      const pdfjsLib = await getPdfJs();
      if (!pdfjsLib) {
        return {
          success: false,
          error: "PDF parser not available. Please ensure pdfjs-dist is installed.",
        };
      }

      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Ensure buffer is valid
      if (!uint8Array || uint8Array.length === 0) {
        return {
          success: false,
          error: "Invalid PDF file: empty buffer",
        };
      }

      // Verify it's a PDF by checking the header
      const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 4));
      if (pdfHeader !== "%PDF") {
        return {
          success: false,
          error: "Invalid PDF file: file does not appear to be a valid PDF",
        };
      }

      // Load PDF using pdfjs-dist
      // Use disableAutoFetch and disableStream to avoid worker issues
      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        useSystemFonts: true,
        disableAutoFetch: true,
        disableStream: true,
      });
      
      const pdf = await loadingTask.promise;

      // Extract text from all pages
      let fullText = "";
      const numPages = pdf.numPages;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine all text items from the page
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        
        fullText += pageText + "\n";
      }

      const trimmedText = fullText.trim();

      if (trimmedText.length === 0) {
        return {
          success: false,
          error: "No text content found in PDF",
        };
      }

      return {
        success: true,
        text: trimmedText,
      };
    } catch (parseError: any) {
      console.error("PDF parsing error:", parseError);
      return {
        success: false,
        error: `Failed to parse PDF: ${parseError.message || "Unknown error"}`,
      };
    }
  } catch (error: any) {
    console.error("Error parsing PDF:", error);

    return {
      success: false,
      error: error.message || "Failed to parse PDF",
    };
  }
}
