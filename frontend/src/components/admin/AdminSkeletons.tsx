'use client'

import React from 'react'

export const StatCardSkeleton = () => (
  <div className="glass-card p-6 border border-white/5 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-white/5 rounded-2xl" />
    </div>
    <div className="space-y-3">
      <div className="w-20 h-2 bg-white/5 rounded" />
      <div className="w-32 h-8 bg-white/10 rounded-xl" />
      <div className="w-24 h-2 bg-white/5 rounded" />
    </div>
  </div>
)

export const TableRowSkeleton = ({ cols = 4 }: { cols?: number }) => (
  <tr className="animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-5">
        <div className="h-4 bg-white/5 rounded w-full" />
      </td>
    ))}
  </tr>
)

export const CardSkeleton = () => (
  <div className="glass-card p-6 border border-white/5 animate-pulse space-y-4">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-white/10 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <div className="w-1/3 h-4 bg-white/10 rounded" />
        <div className="w-1/2 h-3 bg-white/5 rounded" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2">
       <div className="h-10 bg-white/5 rounded-xl" />
       <div className="h-10 bg-white/5 rounded-xl" />
    </div>
  </div>
)

export const DashboardSkeleton = () => (
  <div className="space-y-10">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <div className="w-48 h-8 bg-white/10 rounded-xl animate-pulse" />
        <div className="w-32 h-3 bg-white/5 rounded animate-pulse" />
      </div>
      <div className="w-40 h-14 bg-white/5 rounded-3xl animate-pulse" />
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="w-full h-[400px] bg-white/5 rounded-[2.5rem] animate-pulse" />
      </div>
      <div className="space-y-8">
        <div className="w-full h-40 bg-white/5 rounded-[2.5rem] animate-pulse" />
        <div className="w-full h-48 bg-white/5 rounded-[2.5rem] animate-pulse" />
      </div>
    </div>
  </div>
)
