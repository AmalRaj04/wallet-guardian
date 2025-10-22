import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'motion/react';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#14B8A6'];

export default function PortfolioChart({ tokens = [] }) {
  // Prepare data for pie chart (portfolio allocation)
  const pieData = useMemo(() => {
    if (!tokens || tokens.length === 0) return [];
    
    const totalValue = tokens.reduce((sum, token) => sum + (token.value || 0), 0);
    
    return tokens
      .filter(token => token.value > 0)
      .map((token, index) => ({
        name: token.symbol,
        value: token.value,
        percentage: ((token.value / totalValue) * 100).toFixed(1),
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 tokens
  }, [tokens]);

  // Generate mock historical data for line chart
  const lineData = useMemo(() => {
    const days = 7;
    const data = [];
    const now = Date.now();
    const totalValue = tokens.reduce((sum, token) => sum + (token.value || 0), 0);
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      // Simulate some price movement
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const value = totalValue * (1 + variation * (i / days));
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.max(0, value),
        timestamp: date.getTime()
      });
    }
    
    return data;
  }, [tokens]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800/90 backdrop-blur-lg border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm">{label}</p>
          <p className="text-blue-400 font-semibold">
            ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800/90 backdrop-blur-lg border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-gray-300">
            ${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-blue-400">{data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  if (!tokens || tokens.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Portfolio Value Trend */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-4 text-gray-200">Portfolio Trend (7 Days)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Portfolio Allocation */}
      <div className="lg:w-80">
        <h3 className="text-lg font-semibold mb-4 text-gray-200">Portfolio Allocation</h3>
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="mt-4 space-y-2 w-full">
            {pieData.slice(0, 5).map((entry, index) => (
              <motion.div 
                key={entry.name}
                className="flex items-center justify-between text-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-gray-300">{entry.name}</span>
                </div>
                <span className="text-gray-400">{entry.percentage}%</span>
              </motion.div>
            ))}
            {pieData.length > 5 && (
              <div className="text-xs text-gray-500 text-center pt-2">
                +{pieData.length - 5} more tokens
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}