"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { HardhatAnalyzer } from "@/lib/hardhat-analyzer";
import { ethers } from "ethers";

export default function BytecodeAnalyzer() {
  const [contractAddress, setContractAddress] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState("");

  const analyzeContract = async () => {
    if (!contractAddress || !ethers.utils.isAddress(contractAddress)) {
      setError("Please enter a valid contract address");
      return;
    }

    setAnalyzing(true);
    setError("");
    setReport(null);

    try {
      const provider = new ethers.providers.Web3Provider(
        (window as any).ethereum
      );
      const code = await provider.getCode(contractAddress);

      if (!code || code === "0x") {
        setError("No contract found at this address");
        setAnalyzing(false);
        return;
      }

      const analysisReport = await HardhatAnalyzer.analyzeContract(
        contractAddress,
        code,
        undefined
      );

      setReport(analysisReport);
    } catch (err: any) {
      console.error("Error analyzing contract:", err);
      setError(err.message || "Failed to analyze contract");
    } finally {
      setAnalyzing(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "text-green-400";
      case "B":
        return "text-blue-400";
      case "C":
        return "text-yellow-400";
      case "D":
        return "text-orange-400";
      case "F":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-neon-blue" />
          <div>
            <h2 className="text-2xl font-bold">Hardhat 3 Bytecode Analyzer</h2>
            <p className="text-sm text-gray-400">
              Deep smart contract security analysis
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            placeholder="Enter contract address (0x...)"
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue text-white placeholder-gray-500"
          />
          <button
            onClick={analyzeContract}
            disabled={analyzing}
            className="px-6 py-3 bg-neon-blue/20 text-neon-blue rounded-lg hover:bg-neon-blue/30 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Analyze
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
      </GlassCard>

      {/* Results */}
      {report && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Security Score */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold mb-4">Security Assessment</h3>
            <div className="flex items-center justify-between">
              <div>
                <div
                  className={`text-6xl font-bold mb-2 ${getGradeColor(report.overallGrade)}`}
                >
                  {report.overallGrade}
                </div>
                <div className="text-2xl text-gray-400">
                  Score: {report.score}/100
                </div>
              </div>
              <Shield
                className={`w-24 h-24 ${getGradeColor(report.overallGrade)}`}
              />
            </div>
          </GlassCard>

          {/* Vulnerabilities */}
          {report.vulnerabilities.length > 0 ? (
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold mb-4">
                Vulnerabilities Found ({report.vulnerabilities.length})
              </h3>
              <div className="space-y-3">
                {report.vulnerabilities.map((vuln: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      vuln.severity === "critical"
                        ? "border-red-500/50 bg-red-500/10"
                        : vuln.severity === "high"
                          ? "border-orange-500/50 bg-orange-500/10"
                          : vuln.severity === "medium"
                            ? "border-yellow-500/50 bg-yellow-500/10"
                            : "border-blue-500/50 bg-blue-500/10"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        {vuln.severity === "critical" && "🔴"}
                        {vuln.severity === "high" && "🟠"}
                        {vuln.severity === "medium" && "🟡"}
                        {vuln.severity === "low" && "🔵"}
                        {vuln.name}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded text-xs uppercase font-bold ${
                          vuln.severity === "critical"
                            ? "bg-red-500 text-white"
                            : vuln.severity === "high"
                              ? "bg-orange-500 text-white"
                              : vuln.severity === "medium"
                                ? "bg-yellow-500 text-black"
                                : "bg-blue-500 text-white"
                        }`}
                      >
                        {vuln.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">
                      {vuln.description}
                    </p>
                    <div className="bg-white/5 rounded p-3">
                      <p className="text-sm">
                        <strong className="text-neon-blue">
                          Recommendation:
                        </strong>{" "}
                        <span className="text-gray-300">
                          {vuln.recommendation}
                        </span>
                      </p>
                    </div>
                    {vuln.affectedFunctions &&
                      vuln.affectedFunctions.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Affected functions:{" "}
                          {vuln.affectedFunctions.join(", ")}
                        </p>
                      )}
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-green-400">
                No Vulnerabilities Detected
              </h3>
              <p className="text-gray-400">
                The bytecode analysis didn't find any obvious security issues
              </p>
            </GlassCard>
          )}

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold mb-4">
                Overall Recommendations
              </h3>
              <div className="space-y-2">
                {report.recommendations.map((rec: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg"
                  >
                    <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-300">{rec}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Info */}
          <GlassCard className="p-6 bg-purple-500/5 border-purple-500/30">
            <h4 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              About Hardhat 3 Bytecode Analysis
            </h4>
            <p className="text-sm text-gray-300 mb-2">
              This analysis examines the compiled bytecode of smart contracts to
              detect common vulnerabilities and security issues, including:
            </p>
            <ul className="text-sm text-gray-300 space-y-1 ml-4">
              <li>• Dangerous opcodes (SELFDESTRUCT, DELEGATECALL)</li>
              <li>• Reentrancy vulnerabilities</li>
              <li>• Access control issues</li>
              <li>• Integer overflow/underflow risks</li>
              <li>• Timestamp dependencies</li>
              <li>• And 10+ other security patterns</li>
            </ul>
            <p className="text-xs text-gray-400 mt-3">
              Analyzed at: {new Date(report.timestamp).toLocaleString()}
            </p>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
