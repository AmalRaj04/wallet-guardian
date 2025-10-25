"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import InteractiveGlassCard from "@/components/ui/InteractiveGlassCard";
import { Token } from "@/types";
import { usePortfolioRisk } from "@/hooks/usePortfolioRisk";
import { GroqAI } from "@/lib/groq";
import { HardhatAnalyzer } from "@/lib/hardhat-analyzer";
import { ethers } from "ethers";

interface RiskAnalysisProps {
  tokens: Token[];
  selectedToken?: Token;
}

export default function RiskAnalysis({
  tokens,
  selectedToken,
}: RiskAnalysisProps) {
  const { getTokenRisk } = usePortfolioRisk(tokens);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [bytecodeReport, setBytecodeReport] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["overview"])
  );
  const [selectedTokenForAnalysis, setSelectedTokenForAnalysis] = useState<
    Token | undefined
  >(selectedToken);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const analyzeToken = async (token: Token) => {
    setSelectedTokenForAnalysis(token);
    setAnalyzing(true);
    setAiAnalysis("");
    setBytecodeReport(null);

    try {
      const risk = getTokenRisk(token.address);

      if (!risk) {
        setAiAnalysis(
          "Risk data not available. Please wait for risk calculation to complete."
        );
        setAnalyzing(false);
        return;
      }

      // Get AI analysis from Groq
      const prompt = `Analyze this cryptocurrency token for security risks:

Token: ${token.name} (${token.symbol})
Contract Address: ${token.address}
Risk Score: ${risk.overall}/100 (${risk.category})

Risk Factors:
- Contract Verification: ${risk.factors.contractVerification}/25
- Approval Risk: ${risk.factors.approvalRisk}/25
- Creator Behavior: ${risk.factors.creatorBehavior}/20
- Liquidity: ${risk.factors.liquidityAnalysis}/15
- Honeypot Risk: ${risk.factors.honeypotRisk}/15

Warnings: ${risk.warnings.join(", ") || "None"}
Trust Badges: ${risk.badges.map((b) => b.label).join(", ") || "None"}

Provide a detailed security analysis in 3-4 paragraphs covering:
1. Overall security assessment
2. Specific risks and concerns
3. Recommendations for users
4. Whether it's safe to hold/trade

Be specific and actionable.`;

      const analysis = await GroqAI.analyzeSecurityRisk(prompt);
      setAiAnalysis(analysis);

      // Get bytecode analysis if available
      try {
        // Use ethers v5 syntax
        const provider = new ethers.providers.Web3Provider(
          (window as any).ethereum
        );
        const code = await provider.getCode(token.address);

        if (code && code !== "0x") {
          const report = await HardhatAnalyzer.analyzeContract(
            token.address,
            code,
            undefined // Source code if available
          );
          setBytecodeReport(report);
        }
      } catch (error) {
        console.error("Error analyzing bytecode:", error);
      }
    } catch (error) {
      console.error("Error analyzing token:", error);
      setAiAnalysis("Failed to generate AI analysis. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const token = selectedTokenForAnalysis || tokens[0];
  const risk = token ? getTokenRisk(token.address) : null;

  if (!token) {
    return (
      <InteractiveGlassCard
        className="p-12 text-center"
        enableParticles={true}
        enableTilt={true}
        enableMagnetism={false}
        enableBorderGlow={true}
        clickEffect={true}
        particleCount={8}
        tiltIntensity={0.4}
        glowColor="132, 0, 255"
      >
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">No Tokens Available</h3>
        <p className="text-gray-400">
          Connect your wallet to analyze token security
        </p>
      </InteractiveGlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Token Selector */}
      <InteractiveGlassCard
        className="p-6"
        enableParticles={true}
        enableTilt={true}
        enableMagnetism={false}
        enableBorderGlow={true}
        clickEffect={true}
        particleCount={8}
        tiltIntensity={0.4}
        glowColor="132, 0, 255"
      >
        <h3 className="text-lg font-bold mb-4">Select Token to Analyze</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tokens.slice(0, 12).map((t) => {
            const tokenRisk = getTokenRisk(t.address);
            const isSelected = t.address === token.address;

            return (
              <button
                key={t.address}
                onClick={() => analyzeToken(t)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? "border-neon-blue bg-neon-blue/10"
                    : "border-white/10 hover:border-white/30 bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  {t.logo ? (
                    <img
                      src={t.logo}
                      alt={t.symbol}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-xs font-bold">
                      {t.symbol.slice(0, 2)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{t.symbol}</div>
                    <div className="text-xs text-gray-400 truncate">
                      {t.name}
                    </div>
                  </div>
                  {tokenRisk && (
                    <div
                      className={`w-2 h-2 rounded-full ${
                        tokenRisk.color === "green"
                          ? "bg-green-500"
                          : tokenRisk.color === "yellow"
                            ? "bg-yellow-500"
                            : tokenRisk.color === "orange"
                              ? "bg-orange-500"
                              : "bg-red-500"
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </InteractiveGlassCard>

      {/* Risk Overview */}
      <InteractiveGlassCard
        className="p-6"
        enableParticles={true}
        enableTilt={true}
        enableMagnetism={false}
        enableBorderGlow={true}
        clickEffect={true}
        particleCount={8}
        tiltIntensity={0.4}
        glowColor="132, 0, 255"
      >
        <button
          onClick={() => toggleSection("overview")}
          className="w-full flex items-center justify-between mb-4"
        >
          <h3 className="text-xl font-bold">Risk Overview</h3>
          {expandedSections.has("overview") ? <ChevronUp /> : <ChevronDown />}
        </button>

        {expandedSections.has("overview") && risk && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold mb-1">
                  {Math.round(risk.overall)}/100
                </div>
                <div
                  className={`text-lg font-semibold uppercase ${
                    risk.color === "green"
                      ? "text-green-400"
                      : risk.color === "yellow"
                        ? "text-yellow-400"
                        : risk.color === "orange"
                          ? "text-orange-400"
                          : "text-red-400"
                  }`}
                >
                  {risk.category}
                </div>
              </div>
              <Shield
                className={`w-16 h-16 ${
                  risk.color === "green"
                    ? "text-green-400"
                    : risk.color === "yellow"
                      ? "text-yellow-400"
                      : risk.color === "orange"
                        ? "text-orange-400"
                        : "text-red-400"
                }`}
              />
            </div>

            {/* Risk Factors Breakdown */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-400">
                Risk Factors
              </h4>
              {Object.entries(risk.factors).map(([key, value]) => {
                const maxValues: Record<string, number> = {
                  contractVerification: 25,
                  approvalRisk: 25,
                  creatorBehavior: 20,
                  liquidityAnalysis: 15,
                  honeypotRisk: 15,
                };
                const max = maxValues[key] || 25;
                const percentage = (value / max) * 100;

                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span>
                        {value}/{max}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          percentage < 30
                            ? "bg-green-500"
                            : percentage < 60
                              ? "bg-yellow-500"
                              : percentage < 80
                                ? "bg-orange-500"
                                : "bg-red-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trust Badges */}
            {risk.badges.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-400 mb-2">
                  Trust Badges
                </h4>
                <div className="flex flex-wrap gap-2">
                  {risk.badges.map((badge, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-full text-sm ${
                        badge.color === "green"
                          ? "bg-green-500/20 text-green-400"
                          : badge.color === "yellow"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                      title={badge.description}
                    >
                      {badge.icon} {badge.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {risk.warnings.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Warnings
                </h4>
                <ul className="space-y-1 text-sm">
                  {risk.warnings.map((warning, idx) => (
                    <li key={idx} className="text-red-300">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {risk.recommendations.length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Recommendations
                </h4>
                <ul className="space-y-1 text-sm">
                  {risk.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-blue-300">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </InteractiveGlassCard>

      {/* AI Analysis */}
      <InteractiveGlassCard
        className="p-6"
        enableParticles={true}
        enableTilt={true}
        enableMagnetism={false}
        enableBorderGlow={true}
        clickEffect={true}
        particleCount={8}
        tiltIntensity={0.4}
        glowColor="132, 0, 255"
      >
        <button
          onClick={() => toggleSection("ai")}
          className="w-full flex items-center justify-between mb-4"
        >
          <h3 className="text-xl font-bold flex items-center gap-2">
            🤖 AI Security Analysis
            {!GroqAI.isAvailable() && (
              <span className="text-xs text-yellow-400">
                (Configure Groq API)
              </span>
            )}
          </h3>
          {expandedSections.has("ai") ? <ChevronUp /> : <ChevronDown />}
        </button>

        {expandedSections.has("ai") && (
          <div>
            {!aiAnalysis && !analyzing && (
              <button
                onClick={() => analyzeToken(token)}
                disabled={!GroqAI.isAvailable()}
                className="w-full px-6 py-3 bg-neon-blue/20 text-neon-blue rounded-lg hover:bg-neon-blue/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate AI Analysis
              </button>
            )}

            {analyzing && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-neon-blue" />
                <span className="ml-3">Analyzing with Groq AI...</span>
              </div>
            )}

            {aiAnalysis && (
              <div className="bg-black/20 rounded-lg p-6 border border-white/10">
                <div className="space-y-4">
                  {aiAnalysis.split("\n\n").map((paragraph, idx) => {
                    // Check if paragraph is a header (starts with ** or #)
                    if (
                      paragraph.startsWith("**") &&
                      paragraph.includes(":**")
                    ) {
                      const [header, ...content] = paragraph.split(":**");
                      return (
                        <div key={idx}>
                          <h4 className="text-neon-blue font-semibold mb-2">
                            {header.replace(/\*\*/g, "")}
                          </h4>
                          <p className="text-gray-300 leading-relaxed">
                            {content.join(":**").replace(/\*\*/g, "")}
                          </p>
                        </div>
                      );
                    }

                    // Regular paragraph
                    return (
                      paragraph.trim() && (
                        <p key={idx} className="text-gray-300 leading-relaxed">
                          {paragraph.replace(/\*\*/g, "")}
                        </p>
                      )
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </InteractiveGlassCard>

      {/* Bytecode Analysis */}
      {bytecodeReport && (
        <InteractiveGlassCard
          className="p-6"
          enableParticles={true}
          enableTilt={true}
          enableMagnetism={false}
          enableBorderGlow={true}
          clickEffect={true}
          particleCount={8}
          tiltIntensity={0.4}
          glowColor="132, 0, 255"
        >
          <button
            onClick={() => toggleSection("bytecode")}
            className="w-full flex items-center justify-between mb-4"
          >
            <h3 className="text-xl font-bold">
              🔒 Bytecode Analysis (Hardhat 3)
            </h3>
            {expandedSections.has("bytecode") ? <ChevronUp /> : <ChevronDown />}
          </button>

          {expandedSections.has("bytecode") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold mb-1">
                    Grade: {bytecodeReport.overallGrade}
                  </div>
                  <div className="text-lg">
                    Security Score: {bytecodeReport.score}/100
                  </div>
                </div>
              </div>

              {bytecodeReport.vulnerabilities.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Vulnerabilities Found</h4>
                  <div className="space-y-3">
                    {bytecodeReport.vulnerabilities.map(
                      (vuln: any, idx: number) => (
                        <div
                          key={idx}
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
                            <h5 className="font-semibold">{vuln.name}</h5>
                            <span
                              className={`px-2 py-1 rounded text-xs uppercase ${
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
                          <p className="text-sm text-gray-300 mb-2">
                            {vuln.description}
                          </p>
                          <p className="text-sm text-gray-400">
                            <strong>Recommendation:</strong>{" "}
                            {vuln.recommendation}
                          </p>
                          {vuln.affectedFunctions &&
                            vuln.affectedFunctions.length > 0 && (
                              <p className="text-xs text-gray-500 mt-2">
                                Affected: {vuln.affectedFunctions.join(", ")}
                              </p>
                            )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {bytecodeReport.recommendations.length > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-400 mb-2">
                    Overall Recommendations
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {bytecodeReport.recommendations.map(
                      (rec: string, idx: number) => (
                        <li key={idx} className="text-blue-300">
                          • {rec}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </InteractiveGlassCard>
      )}
    </div>
  );
}
