// Server-side API route to proxy 1inch API requests
// This avoids CORS issues
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const ONEINCH_API_KEY = process.env.NEXT_PUBLIC_1INCH_API_KEY;
const ONEINCH_BASE_URL = "https://api.1inch.dev/swap/v6.0";

export async function GET(request: NextRequest) {
  try {
    if (!ONEINCH_API_KEY) {
      return NextResponse.json(
        { error: "1inch API key not configured" },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get("chainId") || "1";
    const endpoint = searchParams.get("endpoint") || "";

    // Remove our custom params
    searchParams.delete("chainId");
    searchParams.delete("endpoint");

    // Build the 1inch API URL
    const url = `${ONEINCH_BASE_URL}/${chainId}${endpoint}?${searchParams.toString()}`;

    // Make request to 1inch from server
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${ONEINCH_API_KEY}`,
        Accept: "application/json",
      },
      timeout: 15000,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("1inch API error:", error.message);
    console.error("Error details:", error.response?.data || error);

    // Return error response
    return NextResponse.json(
      {
        error:
          error.response?.data?.description ||
          error.message ||
          "API unavailable",
      },
      { status: error.response?.status || 500 }
    );
  }
}
