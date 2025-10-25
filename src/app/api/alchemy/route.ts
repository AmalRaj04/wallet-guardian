// Server-side API route to proxy Alchemy requests
// This avoids CORS issues and keeps API key secure
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const ALCHEMY_API_KEY =
  process.env.ALCHEMY_API_KEY || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

function getAlchemyUrl(chainId?: number): string {
  const network = chainId === 11155111 ? "eth-sepolia" : "eth-mainnet";
  return `https://${network}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
}

export async function POST(request: NextRequest) {
  try {
    if (!ALCHEMY_API_KEY) {
      return NextResponse.json(
        { error: "Alchemy API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const chainId = body.chainId || 11155111; // Default to Sepolia

    // Remove chainId from body before forwarding
    const { chainId: _, ...alchemyBody } = body;

    // Make request to Alchemy from server
    const response = await axios.post(getAlchemyUrl(chainId), alchemyBody, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Alchemy API error:", error.message);
    console.error("Error details:", error.response?.data || error);

    // Return error response with more details
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: 1,
        error: {
          code: -32603,
          message:
            error.response?.data?.error?.message ||
            error.message ||
            "API unavailable",
        },
      },
      { status: 200 } // Return 200 to avoid breaking client
    );
  }
}
