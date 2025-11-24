import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    const searchParams = req.nextUrl.searchParams;
    const limit = searchParams.get("limit");

    const url = limit
      ? `${BACKEND_URL}/api/new-features/cv/job/${jobId}/top?limit=${limit}`
      : `${BACKEND_URL}/api/new-features/cv/job/${jobId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...(req.headers.get("authorization") && {
          authorization: req.headers.get("authorization")!,
        }),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Error fetching CV analyses" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    logger.error("Error in CV analyses route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

