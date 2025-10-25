import EnvioShowcase from "@/components/EnvioShowcase";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export default function EnvioDemoPage() {
  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="text-neon-blue hover:text-neon-blue/80 transition-colors"
          >
            ← Back to Home
          </Link>
          <ConnectButton />
        </div>

        <h1 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 via-neon-blue to-purple-400 bg-clip-text text-transparent">
          Envio HyperSync Integration
        </h1>
        <p className="text-center text-gray-400 max-w-2xl mx-auto">
          Experience ultra-fast blockchain data analysis powered by Envio's
          HyperSync technology. Get historical transaction data 100x faster than
          standard RPC.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <EnvioShowcase />
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-black/20 rounded-lg border border-white/10">
          <h3 className="text-lg font-bold mb-2">⚡ Ultra-Fast Queries</h3>
          <p className="text-sm text-gray-400">
            HyperSync provides 100x faster data retrieval compared to standard
            RPC nodes, enabling real-time analytics on large datasets.
          </p>
        </div>

        <div className="p-6 bg-black/20 rounded-lg border border-white/10">
          <h3 className="text-lg font-bold mb-2">📊 Historical Analysis</h3>
          <p className="text-sm text-gray-400">
            Analyze wallet activity patterns, track token transfers, and monitor
            contract events across millions of blocks in seconds.
          </p>
        </div>

        <div className="p-6 bg-black/20 rounded-lg border border-white/10">
          <h3 className="text-lg font-bold mb-2">🔒 Security Insights</h3>
          <p className="text-sm text-gray-400">
            Calculate risk scores based on transaction patterns, identify
            suspicious activity, and track token holder distributions.
          </p>
        </div>
      </div>
    </div>
  );
}
