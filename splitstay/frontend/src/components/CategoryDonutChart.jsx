import React from 'react'

const CATEGORY_COLORS = {
  Groceries: '#5F402B',     // Warm Deep Brown
  Rent: '#D1A568',          // Vibrant Golden Amber
  Utilities: '#2F9B70',     // Emerald Green
  Internet: '#3B82F6',      // Bright Blue
  'Cooking Gas': '#F97316', // Warm Orange
  Gas: '#F97316',           // Warm Orange
  Entertainment: '#8B5CF6', // Vibrant Purple
  Other: '#E11D48',         // Vibrant Rose
  Others: '#E11D48',        // Vibrant Rose
}

export default function CategoryDonutChart({ expenses = [], currencySymbol = '₹' }) {
  // Compute totals by category safely
  const categoryTotals = (expenses || []).reduce((acc, exp) => {
    const rawCat = (exp.category || 'Other').trim()
    const catKey = rawCat.charAt(0).toUpperCase() + rawCat.slice(1)
    const val = Number(exp.amount) || 0
    acc[catKey] = (acc[catKey] || 0) + val
    return acc
  }, {})

  const totalAmount = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0)

  // Distinct vibrant color palette helper
  const palette = ['#5F402B', '#D1A568', '#2F9B70', '#3B82F6', '#F97316', '#8B5CF6', '#E11D48', '#0D9488']

  const displayData = totalAmount > 0
    ? Object.entries(categoryTotals).map(([name, value], idx) => ({
        name,
        value,
        percentage: Math.round((value / totalAmount) * 100) || 1,
        color: CATEGORY_COLORS[name] || palette[idx % palette.length],
      }))
    : [
        { name: 'Groceries', percentage: 30, value: 1200, color: '#5F402B' },
        { name: 'Rent', percentage: 35, value: 1400, color: '#D1A568' },
        { name: 'Utilities', percentage: 20, value: 800, color: '#2F9B70' },
        { name: 'Internet', percentage: 15, value: 600, color: '#3B82F6' },
      ]

  const grandTotal = totalAmount > 0 ? totalAmount : (expenses.length === 0 ? 0 : 4000)

  // Calculate SVG stroke DashOffset values for Donut Ring
  let cumulativePercent = 0
  const radius = 65
  const circumference = 2 * Math.PI * radius // ~408.4

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
      {/* SVG Donut Chart */}
      <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="#E5DED3"
            strokeWidth="20"
          />
          {displayData.map((item, idx) => {
            const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`
            const strokeDashoffset = -((cumulativePercent / 100) * circumference)
            cumulativePercent += item.percentage
            return (
              <circle
                key={idx}
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300"
              />
            )
          })}
        </svg>

        {/* Center Total Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-lg font-bold text-[#172033] leading-tight">
            {currencySymbol}{grandTotal.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-[#687080] font-medium">Total</span>
        </div>
      </div>

      {/* Legend Grid */}
      <div className="flex-1 w-full grid grid-cols-2 gap-x-4 gap-y-2.5">
        {displayData.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[#687080] font-medium truncate">{item.name}</span>
            </div>
            <span className="text-[#172033] font-bold ml-2">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
