import axios from "axios";

type BlockscoutResponse<T> = {
  status: string;
  message: string;
  result: T;
};

function apiUrl(base: string) {
  // Accept base like 'https://blockscout.com/eth/mainnet' or full api URL
  return base.endsWith("/api") ? base : `${base.replace(/\/$/, "")}/api`;
}

async function request<T>(
  base: string,
  params: Record<string, string | number>
) {
  const url = apiUrl(base);
  const res = await axios.get<BlockscoutResponse<T>>(url, { params });
  if (res.data?.status === "0" && (res.data.message || res.data.result)) {
    // Blockscout/Etherscan returns status '0' for empty results or errors
    throw new Error(
      `Blockscout API error: ${
        res.data.message || JSON.stringify(res.data.result)
      }`
    );
  }
  return res.data.result;
}

/**
 * Get normal (external) transactions for an address.
 * base: Blockscout base URL (e.g. https://blockscout.com/eth/mainnet)
 */
export async function getTransactionsByAddress(
  base: string,
  address: string,
  startblock = 0,
  endblock = 99999999,
  page = 1,
  offset = 100,
  sort: "asc" | "desc" = "asc"
) {
  const params = {
    module: "account",
    action: "txlist",
    address,
    startblock,
    endblock,
    page,
    offset,
    sort,
  } as Record<string, string | number>;
  return request<unknown[]>(base, params);
}

/**
 * Get token balance for an address and token contract.
 */
export async function getTokenBalance(
  base: string,
  contractAddress: string,
  address: string
) {
  const params = {
    module: "account",
    action: "tokenbalance",
    contractaddress: contractAddress,
    address,
    tag: "latest",
  } as Record<string, string>;
  return request<string>(base, params);
}

/**
 * Example helper to resolve a blockscout URL for an explorer instance.
 */
export function explorerApiUrl(base: string) {
  return apiUrl(base);
}

const _default = {
  getTransactionsByAddress,
  getTokenBalance,
  explorerApiUrl,
};

export default _default;
