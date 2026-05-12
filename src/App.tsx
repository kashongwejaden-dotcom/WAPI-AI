import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import Dashboard from './components/Dashboard';
import ReportPrice from './components/ReportPrice';
import AIAssistant from './components/AIAssistant';
import { Cart } from './components/Cart';
import { Shop } from './components/Shop';
import { Auth } from './components/Auth';
import { LayoutDashboard, Megaphone, Smartphone, User, Menu, X, ShoppingCart, LogOut, Store } from 'lucide-react';
import { cn } from './lib/utils';
import { Button } from './components/ui/button';
import { getCartItems } from './lib/cart';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<'shop' | 'dashboard' | 'report' | 'ai' | 'cart'>('shop');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      const items = getCartItems();
      setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
    };
    updateCartCount();
    window.addEventListener('cart_updated', updateCartCount);
    return () => window.removeEventListener('cart_updated', updateCartCount);
  }, []);

  if (!session) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const tabs = [
    { id: 'shop', label: 'Marketplace', icon: Store },
    { id: 'dashboard', label: 'Seller Dashboard', icon: LayoutDashboard },
    { id: 'report', label: 'Report Prices', icon: Megaphone },
    { id: 'ai', label: 'SMS / AI Search', icon: Smartphone },
    { id: 'cart', label: 'My Cart', icon: ShoppingCart },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-sans text-slate-200 overflow-hidden">
      {/* Mobile Navbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
            W
          </div>
          <span className="font-bold text-lg">WapiAI</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-5 h-5 text-slate-200" /> : <Menu className="w-5 h-5 text-slate-200" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 w-full md:w-64 flex flex-col",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-xl">
            W
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none">WapiAI</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Platform</p>
          </div>
        </div>
        
        <div className="px-4 py-2 mt-4 md:mt-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Phase 0</p>
          <nav className="space-y-1 z-10 relative">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold tracking-wide transition-colors",
                    isActive 
                      ? "bg-amber-500 text-slate-950" 
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={cn("w-5 h-5", isActive ? "text-slate-950" : "text-slate-500")} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.id === 'cart' && cartCount > 0 && (
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-bold",
                      isActive ? "bg-slate-950 text-amber-500" : "bg-amber-500 text-slate-950"
                    )}>
                      {cartCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-200 truncate">Seller 01</p>
              <p className="text-[10px] font-mono text-amber-500 truncate mt-0.5">{session.user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-slate-950 relative">
        <main className="p-4 md:p-8 max-w-7xl mx-auto h-full">
          {activeTab === 'shop' && <Shop />}
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'report' && <ReportPrice />}
          {activeTab === 'ai' && <AIAssistant />}
          {activeTab === 'cart' && <Cart />}
        </main>
      </div>
    </div>
  );
}
