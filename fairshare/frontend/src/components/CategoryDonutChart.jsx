import React, { useState } from 'react'

const CATEGORY_COLORS = {
  Rent: '#D1A568',          // Vibrant Golden Amber
  Groceries: '#5F402B',     // Warm Deep Brown
  Utilities: '#2F9B70',     // Emerald Green
  Internet: '#3B82F6',      // Bright Blue
  'Cooking Gas': '#F97316', // Warm Orange
  Gas: '#F97316',           // Warm Orange
  Food: '#EC4899',          // Rose Pink
  Entertainment: '#8B5CF6', // Vibrant Purple
  Other: '#64748B',         // Slate
  Others: '#64748B',
}

const FALLBACK_PALETTE = [
  '#5F402B',
  '#D1A568',
  '#2F9B70',
  '#3B82F6',
  '#F97316',
  '#8B5CF6',
  '#EC4899',
  '#0D9488',
  '#6366F1',
]

export default function CategoryDonutChart({ expenses = [], currencySymbol = '₹' }) {
  const [hoveredCategory, setHoveredCategory] = useState(null)

  // 1. Calculate live totals grouped strictly by category
  const categoryTotals = (expenses || []).reduce((acc, exp) => {
    const rawCat = (exp.category || 'Other').trim()
    const catKey = rawCat.charAt(0).toUpperCase() + rawCat.slice(1)
    const val = Number(exp.amount) || 0
    if (val > 0) {
      acc[catKey] = (acc[catKey] || 0) + val
    }
    return acc
  }, {})

  const totalAmount = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0)
  const hasExpenses = totalAmount > 0

  // 2. Sort categories by highest spend first
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])

  // 3. Compute dynamic percentages
  const displayData = hasExpenses
    ? sortedCategories.map(([name, value], idx) => {
        const rawPercent = (value / totalAmount) * 100
        const percentage = Math.round(rawPercent) || (rawPercent > 0 ? 1 : 0)
        return {
          name,
          value,
          percentage,
          color: CATEGORY_COLORS[name] || FALLBACK_PALETTE[idx % FALLBACK_PALETTE.length],
        }
      })
    : []

  // SVG Donut calculation
  const radius = 60
  const circumference = 2 * Math.PI * radius // ~376.99
  let cumulativePercent = 0

  return (
    <div className="bg-white rounded-3xl border border-[#E5DED3] p-6 shadow-card h-full flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-extrabold text-[#172033]">Category Breakdown</h2>
        <span className="text-[11px] font-bold text-[#687080]">
          {hasExpenses ? `${displayData.length} ${displayData.length === 1 ? 'Category' : 'Categories'}` : '0 Categories'}
        </span>
      </div>

      {hasExpenses ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
          {/* SVG Dynamic Donut Chart */}
          <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="#F2EEE7"
                strokeWidth="18"
              />

              {/* Dynamic Slices */}
              {displayData.map((item, idx) => {
                const slicePercent = (item.value / totalAmount) * 100
                const strokeDasharray = `${(slicePercent / 100) * circumference} ${circumference}`
                const strokeDashoffset = -((cumulativePercent / 100) * circumference)
                cumulativePercent += slicePercent

                const isHovered = hoveredCategory === item.name

                return (
                  <circle
                    key={idx}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth={isHovered ? 22 : 18}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredCategory(item.name)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                )
              })}
            </svg>

            {/* Center Dynamic Total / Hovered Detail */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
              {hoveredCategory ? (
                <>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#687080] truncate max-w-[100px]">
                    {hoveredCategory}
                  </span>
                  <span className="text-sm font-extrabold text-[#172033] leading-tight mt-0.5">
                    {currencySymbol}
                    {(categoryTotals[hoveredCategory] || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-[#5F402B] font-bold">
                    {Math.round(((categoryTotals[hoveredCategory] || 0) / totalAmount) * 100)}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-lg font-extrabold text-[#172033] leading-tight">
                    {currencySymbol}{totalAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-[#687080] font-medium">Total</span>
                </>
              )}
            </div>
          </div>

          {/* Dynamic Legend Grid */}
          <div className="flex-1 w-full grid grid-cols-2 gap-x-4 gap-y-2.5">
            {displayData.map((item, idx) => {
              const isHovered = hoveredCategory === item.name

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between text-xs p-1 rounded-lg transition-colors cursor-pointer ${
                    isHovered ? 'bg-[#F2EEE7]' : 'hover:bg-[#FAF8F4]'
                  }`}
                  onMouseEnter={() => setHoveredCategory(item.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[#687080] font-medium truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    <span className="text-[#172033] font-bold">{item.percentage}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* Empty State when 0 expenses logged */
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-6">
          {/* Neutral Empty Circle */}
          <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="#E5DED3"
                strokeWidth="16"
                strokeDasharray="6 6"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-lg font-extrabold text-[#172033] leading-tight">
                {currencySymbol}0
              </span>
              <span className="text-[11px] text-[#687080] font-medium">No Expenses</span>
            </div>
          </div>

          {/* Empty Explanation */}
          <div className="flex-1 text-center sm:text-left space-y-1">
            <p className="text-xs font-bold text-[#172033]">No Expenses Logged Yet</p>
            <p className="text-[11px] text-[#687080] leading-relaxed">
              Once expenses are added in this room, your category spending breakdown and percentages will calculate here automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
