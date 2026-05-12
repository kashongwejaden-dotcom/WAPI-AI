import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { generateMockInsights } from '../lib/data';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, AlertCircle, ShoppingBag, Store } from 'lucide-react';

export default function Dashboard() {
  const data = useMemo(() => generateMockInsights(), []);

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#2E7D32] rounded-xl flex items-center justify-center text-[#FFF8E7] shadow-lg">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#4E342E]">Seller Dashboard</h2>
            <p className="text-[#4E342E]/70 text-[10px] font-mono tracking-widest mt-1 uppercase">Market intelligence for White Rice (Long Grain) at Kinshasa Grand Market.</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 bg-[#2E7D32]/10 border border-[#2E7D32]/20 px-3 py-1.5 rounded-full text-[#2E7D32] text-[10px] font-bold uppercase tracking-widest">
            <span className="w-2 h-2 bg-[#2E7D32] rounded-full animate-pulse"></span>
            Sync Active
          </div>
        </div>
      </div>

      <div className="flex-1 grid gap-4 grid-cols-1 md:grid-cols-12 md:grid-rows-6">
        <Card className="md:col-span-8 md:row-span-4 relative overflow-hidden flex flex-col bg-white border-[#2E7D32]/20 shadow-sm rounded-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <TrendingUp className="w-48 h-48 text-[#2E7D32]" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 text-[#4E342E]">
            <div>
              <CardTitle className="text-[#4E342E]/60 text-[10px] font-bold uppercase tracking-widest mb-1">14-Day Price Trends</CardTitle>
              <div className="text-3xl font-bold font-sans text-[#2E7D32]">White Rice (Long Grain) &mdash; Kinshasa</div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 z-10 p-6 pt-0">
            <div className="h-full min-h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} fontFamily="monospace" />
                  <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}`} fontFamily="monospace" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', color: '#4E342E', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontFamily: 'monospace' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold', color: '#4E342E' }} />
                  <Line type="monotone" name="Your Price" dataKey="yourPrice" stroke="#FF8F00" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" name="Market Average" dataKey="marketAverage" stroke="#0ea5e9" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-4 md:row-span-2 flex flex-col justify-center bg-white border-[#2E7D32]/20 shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[#4E342E]/70 text-[10px] mb-1 font-bold tracking-widest uppercase">Your Price</CardTitle>
            <ShoppingBag className="h-4 w-4 text-[#FF8F00]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono text-[#FF8F00] font-bold">1,215 CDF</div>
            <p className="text-[10px] text-[#2E7D32] font-bold tracking-widest uppercase mt-1">-35 CDF UNDER AVG</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-4 md:row-span-2 flex flex-col justify-center bg-white border-[#2E7D32]/20 shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[#4E342E]/70 text-[10px] mb-1 font-bold tracking-widest uppercase">Market Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#0ea5e9]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono text-[#4E342E] font-bold">1,250 CDF</div>
            <p className="text-[10px] text-[#4E342E]/50 font-bold tracking-widest uppercase mt-1">+2.1% WEEKLY TREND</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-4 md:row-span-2 flex flex-col justify-center bg-white border-[#2E7D32]/20 shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[#4E342E]/70 text-[10px] mb-1 font-bold tracking-widest uppercase">Local Demand</CardTitle>
            <Users className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono text-[#4E342E] font-bold">HIGH</div>
            <p className="text-[10px] text-[#4E342E]/50 font-bold tracking-widest uppercase mt-1">BASED ON SMS QUERIES</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-8 md:row-span-2 bg-[#FF8F00] text-[#4E342E] border-none flex flex-col justify-center p-6 shadow-md rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-[#4E342E]">AI Suggestion</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 border-2 border-[#4E342E] rounded-full flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" /> ACTIVE INTEL
            </span>
          </div>
          <p className="text-xl font-black mt-2 leading-tight">
            Maintain current price. Supply is tightening in Kinshasa, expect averages to rise to 1,280 CDF by Friday.
          </p>
        </Card>

      </div>
    </div>
  );
}
