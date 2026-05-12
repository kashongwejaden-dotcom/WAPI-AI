import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { generateMockInsights } from '../lib/data';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, AlertCircle, ShoppingBag } from 'lucide-react';

export default function Dashboard() {
  const data = useMemo(() => generateMockInsights(), []);

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-200">Seller Dashboard</h2>
          <p className="text-slate-400 text-[10px] font-mono tracking-widest mt-1 uppercase">Market intelligence for White Rice (Long Grain) at Kinshasa Grand Market.</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Sync Active
          </div>
        </div>
      </div>

      <div className="flex-1 grid gap-4 grid-cols-1 md:grid-cols-12 md:grid-rows-6">
        <Card className="md:col-span-8 md:row-span-4 relative overflow-hidden flex flex-col bg-slate-900 border-slate-800">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <TrendingUp className="w-48 h-48" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 z-10">
            <div>
              <CardTitle className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">14-Day Price Trends</CardTitle>
              <div className="text-3xl font-bold font-sans text-slate-200">White Rice (Long Grain) &mdash; Kinshasa</div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 z-10 p-6 pt-0">
            <div className="h-full min-h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} fontFamily="monospace" />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}`} fontFamily="monospace" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                    itemStyle={{ fontSize: '12px', fontFamily: 'monospace' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold', color: '#94a3b8' }} />
                  <Line type="monotone" name="Your Price" dataKey="yourPrice" stroke="#f59e0b" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" name="Market Average" dataKey="marketAverage" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-4 md:row-span-2 flex flex-col justify-center bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-slate-500 text-[10px] mb-1 font-bold tracking-widest uppercase">Your Price</CardTitle>
            <ShoppingBag className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono text-amber-500 font-bold">1,215 CDF</div>
            <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase mt-1">-35 CDF UNDER AVG</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-4 md:row-span-2 flex flex-col justify-center bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-slate-500 text-[10px] mb-1 font-bold tracking-widest uppercase">Market Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono text-slate-200 font-bold">1,250 CDF</div>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-1">+2.1% WEEKLY TREND</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-4 md:row-span-2 flex flex-col justify-center bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-slate-500 text-[10px] mb-1 font-bold tracking-widest uppercase">Local Demand</CardTitle>
            <Users className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono text-white font-bold">HIGH</div>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-1">BASED ON SMS QUERIES</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-8 md:row-span-2 bg-amber-500 text-slate-950 border-none flex flex-col justify-center p-6">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-[10px] font-black uppercase tracking-widest">AI Suggestion</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 border-2 border-slate-950 rounded-full flex items-center">
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
