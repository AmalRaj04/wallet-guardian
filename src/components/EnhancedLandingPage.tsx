"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Shield,
  Lock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Eye,
  Brain,
  Zap,
  Activity,
  TrendingUp,
} from "lucide-react";
import GlassCard from "./ui/GlassCard";
import EnhancedButton from "./ui/EnhancedButton";
import InteractiveGlassCard from "./ui/InteractiveGlassCard";
import InfiniteMarquee from "./ui/InfiniteMarquee";
import Prism from "./Prism";

export default function EnhancedLandingPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const features = [
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Real-Time Monitoring",
      description:
        "Detect threats before they strike with mempool monitoring and instant alerts",
      color: "cyan",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Analysis",
      description:
        "Get plain-English security insights powered by Groq AI and Gemini",
      color: "purple",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Automatic Protection",
      description:
        "Conditional signing and emergency actions protect your assets automatically",
      color: "pink",
      gradient: "from-pink-500 to-rose-500",
    },
  ];

  const sponsorLogos = [
    {
      name: "Blockscout",
      logo: "/sponsors/Blockscout_idDtwpK3Ez_1.svg",
      size: "h-10",
    },
    {
      name: "Envio",
      logo: "/sponsors/Screenshot 2025-10-25 013831.svg",
      size: "h-10",
    },
    {
      name: "Lit Protocol",
      logo: "/sponsors/lit-primary-orange.svg",
      size: "h-10",
    },
    { name: "PYUSD", logo: "/sponsors/Pyusd.svg", size: "h-20" },
    { name: "Hardhat", logo: "/sponsors/hardhat-seeklogo.svg", size: "h-10" },
  ];

  const sponsors = sponsorLogos.map((sponsor, index) => (
    <div key={index} className="flex items-center justify-center h-14">
      <Image
        src={sponsor.logo}
        alt={`${sponsor.name} Logo`}
        width={140}
        height={56}
        className={`${sponsor.size} w-auto object-contain opacity-80 hover:opacity-100 transition-opacity`}
        onError={(e) => {
          // Fallback to text if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
          if (target.nextSibling) {
            (target.nextSibling as HTMLElement).style.display = "block";
          }
        }}
      />
      <span className="hidden text-gray-300 font-medium">{sponsor.name}</span>
    </div>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative">
      {/* Prism Background - Fixed positioning for full coverage */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Prism
          animationType="3drotate"
          timeScale={0.15}
          height={3}
          baseWidth={5}
          scale={2.5}
          hueShift={-0.3}
          colorFrequency={0.5}
          noise={0}
          glow={0.6}
          bloom={0.8}
          transparent={true}
          suspendWhenOffscreen={true}
        />
      </div>

      {/* Gradient Overlay for better text readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-900/60 pointer-events-none z-10" />

      {/* Content Container - All content above the background */}
      <div className="relative z-20">
        {/* Hero Section */}
        <div className="min-h-screen flex items-center justify-center px-4 py-20">
          <motion.div
            style={{ opacity, scale }}
            className="max-w-6xl mx-auto text-center"
          >
            {/* Main Heading with Enhanced Animation */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
            >
              <motion.span
                className="inline-block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Protect Your Crypto
              </motion.span>
              <br />
              <motion.span
                className="inline-block text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Before Threats Strike
              </motion.span>
            </motion.h1>

            {/* Subtitle with Stagger Effect */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] leading-relaxed"
            >
              AI-powered security that monitors threats in real-time, analyzes
              risks instantly, and protects your assets automatically.
            </motion.p>

            {/* CTA Button with Enhanced Hover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.6,
                type: "spring",
                stiffness: 100,
              }}
              className="mb-16"
            >
              <ConnectButton.Custom>
                {({ openConnectModal, mounted }) => {
                  if (!mounted) return null;
                  return (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={openConnectModal}
                      style={
                        {
                          "--background": "30 41 59",
                          "--highlight": "255 255 255",
                          "--bg-color":
                            "linear-gradient(rgb(var(--background)), rgb(var(--background)))",
                          "--border-color": `linear-gradient(145deg,
                            rgb(var(--highlight)) 0%,
                            rgb(var(--highlight) / 0.3) 33.33%,
                            rgb(var(--highlight) / 0.14) 66.67%,
                            rgb(var(--highlight) / 0.1) 100%)
                          `,
                        } as React.CSSProperties
                      }
                      className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl border border-transparent text-center cursor-pointer mx-auto
                      [background:padding-box_var(--bg-color),border-box_var(--border-color)]"
                    >
                      <motion.span
                        className="inline-block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold text-xl"
                        animate={{
                          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        style={{ backgroundSize: "200% 200%" }}
                      >
                        Start Protecting Your Wallet
                      </motion.span>
                      <ArrowRight className="w-6 h-6 text-white" />
                    </motion.button>
                  );
                }}
              </ConnectButton.Custom>
            </motion.div>
          </motion.div>
        </div>

        {/* Sponsors Section with Enhanced Animation */}
        <div className="py-16 bg-gradient-to-b from-transparent via-slate-900/30 to-transparent backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto px-4"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center text-cyan-400 mb-8 text-sm uppercase tracking-wider font-semibold"
            >
              Powered by Industry Leaders
            </motion.p>
            <InfiniteMarquee
              speed="normal"
              pauseOnHover={true}
              className="py-4"
            >
              {sponsors.map((sponsor, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="transition-all duration-300 flex items-center justify-center"
                >
                  {sponsor}
                </motion.div>
              ))}
            </InfiniteMarquee>
          </motion.div>
        </div>

        {/* Features Section with Enhanced Cards */}
        <div className="py-24 px-4 bg-gradient-to-b from-slate-900/50 via-purple-900/20 to-slate-900/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                Complete Security Suite
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Everything you need to protect your crypto assets with
                cutting-edge AI technology
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.15,
                    type: "spring",
                    stiffness: 100,
                  }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  className="group"
                >
                  <InteractiveGlassCard
                    className="p-8 h-full hover:border-cyan-500/50 transition-all duration-500 relative overflow-hidden"
                    enableParticles={true}
                    enableTilt={true}
                    enableMagnetism={false}
                    clickEffect={true}
                    particleCount={12}
                    glowColor="132, 0, 255"
                  >
                    {/* Gradient Overlay on Hover */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                    />

                    {/* Icon with Glow Effect */}
                    <motion.div
                      className={`mb-6 text-${feature.color}-400 relative inline-block`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div
                        className={`absolute inset-0 blur-xl bg-${feature.color}-500/30 group-hover:bg-${feature.color}-500/50 transition-all duration-300`}
                      />
                      <div className="relative">{feature.icon}</div>
                    </motion.div>

                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-cyan-100 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                      {feature.description}
                    </p>

                    {/* Bottom Accent Line */}
                    <motion.div
                      className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.gradient}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 0.8, delay: index * 0.15 + 0.3 }}
                      viewport={{ once: true }}
                    />
                  </InteractiveGlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Magic Bento Interactive Cards */}
        {/* <div className="py-20 px-4 bg-gradient-to-b from-slate-900/50 to-black/30 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Interactive Security Features
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Hover over cards to explore our advanced protection capabilities
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <MagicBento
                textAutoHide={true}
                enableStars={true}
                enableSpotlight={true}
                enableBorderGlow={true}
                enableTilt={true}
                enableMagnetism={false}
                clickEffect={true}
                spotlightRadius={300}
                particleCount={12}
                glowColor="132, 0, 255"
              />
            </motion.div>
          </div>
        </div> */}

        {/* Risk System Section with Enhanced Visuals */}
        <div className="py-24 px-4 bg-gradient-to-b from-black/30 via-slate-900/40 to-black/30 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-green-100 to-white bg-clip-text text-transparent">
                Color-Coded Risk System
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Instant visual feedback on security status with intelligent
                threat classification
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  color: "green",
                  label: "Safe",
                  range: "0-25",
                  icon: CheckCircle,
                  gradient: "from-green-500 to-emerald-500",
                },
                {
                  color: "yellow",
                  label: "Medium",
                  range: "26-55",
                  icon: AlertTriangle,
                  gradient: "from-yellow-500 to-amber-500",
                },
                {
                  color: "orange",
                  label: "High",
                  range: "56-80",
                  icon: AlertTriangle,
                  gradient: "from-orange-500 to-red-500",
                },
                {
                  color: "red",
                  label: "Critical",
                  range: "81-100",
                  icon: AlertTriangle,
                  gradient: "from-red-500 to-rose-600",
                },
              ].map((risk, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100,
                  }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group"
                >
                  <GlassCard
                    className={`p-6 text-center transition-all duration-300 hover:shadow-${risk.color}-500/20 hover:border-${risk.color}-500/30 relative overflow-hidden`}
                  >
                    {/* Animated Background Gradient */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${risk.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />

                    {/* Icon Container with Pulse */}
                    <motion.div
                      className={`relative w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-${risk.color}-500/20 border-2 border-${risk.color}-500 group-hover:border-${risk.color}-400 transition-colors duration-300`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <div
                        className={`absolute inset-0 rounded-full bg-${risk.color}-500/20 animate-ping`}
                      />
                      <risk.icon
                        className={`relative w-8 h-8 text-${risk.color}-400 group-hover:text-${risk.color}-300 transition-colors duration-300`}
                      />
                    </motion.div>

                    <h4
                      className={`font-bold text-lg text-${risk.color}-400 mb-1 group-hover:text-${risk.color}-300 transition-colors duration-300`}
                    >
                      {risk.label}
                    </h4>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                      Risk {risk.range}
                    </p>

                    {/* Bottom Indicator */}
                    <motion.div
                      className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${risk.gradient}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                      viewport={{ once: true }}
                    />
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sponsors Section */}
        {/* <div className="py-20 px-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <p className="text-gray-300 mb-8 text-lg">Powered by Industry Leaders</p>
              <div className="flex flex-wrap justify-center gap-8 text-gray-400">
                {sponsors.map((sponsor, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-lg font-medium hover:text-neon-cyan transition-colors cursor-pointer"
                  >
                    {sponsor}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>
        </div> */}

        {/* Final CTA with Enhanced Design */}
        <div className="py-24 px-4 bg-gradient-to-b from-black/40 via-purple-900/20 to-black/60 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-12 md:p-16 relative overflow-hidden group hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500">
                {/* Animated Background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5"
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{ backgroundSize: "200% 200%" }}
                />

                {/* Floating Particles Effect */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-cyan-400/30 rounded-full"
                      animate={{
                        x: [0, 100, 0],
                        y: [0, -100, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 3 + i,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${30 + i * 10}%`,
                      }}
                    />
                  ))}
                </div>

                <div className="relative z-10">
                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 backdrop-blur-sm mb-6"
                  >
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-medium text-cyan-300">
                      Trusted by 10,000+ Users
                    </span>
                  </motion.div>

                  <motion.h2
                    className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    viewport={{ once: true }}
                  >
                    Ready to Secure Your Assets?
                  </motion.h2>

                  <motion.p
                    className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    Join thousands of users protecting their crypto with
                    AI-powered security. Start monitoring threats in real-time
                    today.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.3,
                      type: "spring",
                      stiffness: 100,
                    }}
                    viewport={{ once: true }}
                  >
                    <ConnectButton.Custom>
                      {({ openConnectModal, mounted }) => {
                        if (!mounted) return null;
                        return (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={openConnectModal}
                            style={
                              {
                                "--background": "30 41 59",
                                "--highlight": "255 255 255",
                                "--bg-color":
                                  "linear-gradient(rgb(var(--background)), rgb(var(--background)))",
                                "--border-color": `linear-gradient(145deg,
                                  rgb(var(--highlight)) 0%,
                                  rgb(var(--highlight) / 0.3) 33.33%,
                                  rgb(var(--highlight) / 0.14) 66.67%,
                                  rgb(var(--highlight) / 0.1) 100%)
                                `,
                              } as React.CSSProperties
                            }
                            className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl border border-transparent text-center cursor-pointer mx-auto
                            [background:padding-box_var(--bg-color),border-box_var(--border-color)]"
                          >
                            <Shield className="w-6 h-6 text-white" />
                            <motion.span
                              className="inline-block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold text-xl"
                              animate={{
                                backgroundPosition: [
                                  "0% 50%",
                                  "100% 50%",
                                  "0% 50%",
                                ],
                              }}
                              transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              style={{ backgroundSize: "200% 200%" }}
                            >
                              Get Started Now
                            </motion.span>
                          </motion.button>
                        );
                      }}
                    </ConnectButton.Custom>
                  </motion.div>

                  {/* Trust Indicators */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>No credit card required</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Free to start</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>24/7 protection</span>
                    </div>
                  </motion.div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
