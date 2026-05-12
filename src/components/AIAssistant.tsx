import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { processNLQuery } from '../lib/gemini';
import { MessageSquare, Send, Smartphone } from 'lucide-react';

export default function AIAssistant() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    { role: 'assistant', text: "WapiAI: Send crop/market name to get prices. Ex: 'price of rice in Kinshasa' or 'cheap maize under 100 KES'." }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = query.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setQuery('');
    setLoading(true);

    const reply = await processNLQuery(userMessage);
    
    setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#4E342E]">SMS / NLP Search Simulator</h2>
        <p className="text-[#4E342E]/70 text-[10px] font-mono tracking-widest mt-1 uppercase">Test the offline-first USSD/SMS fallback semantic search logic.</p>
      </div>

      <div className="grid md:grid-cols-12 md:grid-rows-1 gap-4">
        
        <Card className="md:col-span-4 bg-[#FFF8E7] border-[#2E7D32]/20 shadow-md text-sm flex flex-col justify-between p-6 rounded-2xl">
          <CardHeader className="pb-2 p-0 mb-4">
            <CardTitle className="text-[#4E342E] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#2E7D32]" />
              How it works
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[#4E342E]/80 space-y-4 p-0">
            <p>Users send an SMS or USSD code offline.</p>
            <p>The backend receives the text and uses Gemini to parse intent and extract prices from the vector store.</p>
            <div className="flex items-center gap-2 bg-[#2E7D32]/10 border border-[#2E7D32]/20 px-3 py-1.5 rounded-full text-[#2E7D32] text-[10px] font-bold uppercase tracking-widest mt-4 w-fit">
              <span className="w-2 h-2 bg-[#2E7D32] rounded-full animate-pulse"></span>
              Live Sync Active
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-8 overflow-hidden flex flex-col h-[600px] border-[#2E7D32]/20 shadow-lg bg-[#FFF8E7] rounded-2xl">
          <CardHeader className="bg-[#2E7D32] py-4 rounded-t-2xl">
            <CardTitle className="text-sm font-medium flex items-center justify-between text-[#FFF8E7]">
              <div className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-[#FF8F00]" />
                <span className="font-mono uppercase tracking-widest text-xs">WapiAI SMS Bridge</span>
              </div>
              <span className="text-[#FFF8E7]/70 text-[10px] font-mono">PORT 3000 / KINSHASA</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#FAFAFA] flex flex-col font-mono text-sm shadow-inner relative">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm border ${
                  m.role === 'user' 
                     ? 'bg-[#FF8F00] text-[#4E342E] border-[#FF8F00] rounded-br-none font-medium' 
                    : 'bg-white text-[#4E342E] rounded-bl-none border-gray-200'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl px-5 py-3 shadow-md bg-white text-[#4E342E] rounded-bl-none border border-gray-200 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#2E7D32]/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-[#2E7D32]/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-[#2E7D32]/50 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
          </CardContent>
          
          <div className="p-4 border-t border-[#2E7D32]/20 bg-white rounded-b-2xl">
            <form onSubmit={handleSend} className="flex gap-3">
              <Input 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type your SMS message..." 
                className="flex-1 font-mono text-sm bg-gray-50 border-gray-200 text-[#4E342E] placeholder:text-gray-400 focus-visible:ring-[#2E7D32]"
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !query.trim()} className="px-6 h-10 min-w-0 md:min-w-[120px] bg-[#2E7D32] hover:bg-[#1B5E20] text-white">
                <Send className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">SEND</span>
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
