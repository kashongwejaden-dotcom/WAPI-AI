import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { PRODUCTS, MARKETS } from '../lib/data';
import { Coins, CheckCircle2 } from 'lucide-react';

export default function ReportPrice() {
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submission
    setTimeout(() => {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-200">Crowdsourced Reporting</h2>
        <p className="text-slate-400 text-[10px] font-mono tracking-widest mt-1 uppercase">Report prices from your local market and earn SMS credits.</p>
      </div>

      {submitted && (
        <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-xl border border-emerald-500/20 flex items-start space-x-3 shadow-sm animate-in zoom-in-95 duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-emerald-400">Price Reported Successfully!</h3>
            <p className="text-[10px] mt-1 text-emerald-400/80 uppercase tracking-widest font-bold">You just earned <strong className="text-emerald-400">5 SMS Credits</strong>. Reputation increased by 2.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <Card className="md:col-span-8 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-400 text-sm font-semibold uppercase tracking-wider">
              Market Price Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5 flex flex-col font-mono text-sm">
              <div className="space-y-1.5 font-sans">
                <label className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Product</label>
                <select className="flex h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 text-slate-200">
                  {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              
              <div className="space-y-1.5 font-sans">
                <label className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Location / Market</label>
                <select className="flex h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 text-slate-200">
                  {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4 font-sans">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Price</label>
                  <Input required type="number" min="0" step="0.01" placeholder="e.g. 1200" className="font-mono text-amber-500 text-lg" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Currency</label>
                  <select className="flex h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 text-slate-200">
                    <option value="CDF">CDF</option>
                    <option value="KES">KES</option>
                    <option value="NGN">NGN</option>
                    <option value="TZS">TZS</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-1.5 font-sans">
                <label className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Unit</label>
                <select className="flex h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 text-slate-200">
                  <option value="1kg">1 Kilogram (kg)</option>
                  <option value="50kg">50 Kilogram Sack</option>
                  <option value="1L">1 Litre (L)</option>
                </select>
              </div>

              <div className="pt-2 font-sans">
                <Button type="submit" className="w-full" size="lg">
                  SUBMIT REPORT
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-4 bg-amber-500 text-slate-950 border-none flex flex-col justify-between p-6">
          <div>
            <div className="flex justify-between items-start">
              <h2 className="text-[10px] font-black uppercase tracking-tighter">Contributor Rewards</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 border-2 border-slate-950 rounded-full flex items-center gap-1">
                <Coins className="w-3 h-3" />
                REWARD
              </span>
            </div>
            <p className="text-xl font-black mt-4 leading-tight">Every Verified Report Earns Credits</p>
          </div>
          <div className="mt-8">
            <div className="flex items-end justify-between">
              <p className="text-[10px] font-bold">REWARD TIER</p>
              <p className="text-2xl font-black">+5 SMS</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
