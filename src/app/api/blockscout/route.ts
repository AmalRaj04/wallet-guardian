// Server-side API route to proxy Blockscout requests
// This avoids CORS issues by making requests from the server
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const BLOCKSCOUT_API_URL = "https://eth-sepolia.blockscout.com/api";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const module = searchParams.get("module");
    const action = searchParams.get("action");
    const address = searchParams.get("address");
    const contractaddress = searchParams.get("contractaddress");

    if (!module || !action) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Build params for Blockscout API
    const params: any = {
      module,
      action,
    };

    if (address) params.address = address;
    if (contractaddress) params.contractaddress = contractaddress;

    // Add other common params
    if (searchParams.get("startblock"))
      params.startblock = searchParams.get("startblock");
    if (searchParams.get("endblock"))
      params.endblock = searchParams.get("endblock");
    if (searchParams.get("page")) params.page = searchParams.get("page");
    if (searchParams.get("offset")) params.offset = searchParams.get("offset");
    if (searchParams.get("sort")) params.sort = searchParams.get("sort");

    // Make request to Blockscout from server
    const response = await axios.get(BLOCKSCOUT_API_URL, {
      params,
      timeout: 10000,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Blockscout API error:", error.message);

    // Return empty result instead of error
    return NextResponse.json({
      status: "0",
      message: "API unavailable",
      result: [],
    });
  }
}
