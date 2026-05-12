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
    <div className="min-h-screen market-pattern flex flex-col md:flex-row font-sans text-[#4E342E] overflow-hidden">
      {/* Mobile Navbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#2E7D32] border-b border-[#1B5E20] text-[#FFF8E7]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-[#FF8F00] flex items-center justify-center text-[#4E342E] font-bold">
            W
          </div>
          <span className="font-bold text-lg">WapiAI</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-5 h-5 text-[#FFF8E7]" /> : <Menu className="w-5 h-5 text-[#FFF8E7]" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#2E7D32] border-r border-[#1B5E20] transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 w-full md:w-64 flex flex-col shadow-xl",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-[#FF8F00] flex items-center justify-center text-[#4E342E] font-bold text-xl">
            W
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none text-[#FFF8E7]">WapiAI</h1>
            <p className="text-[10px] text-[#FFF8E7]/60 uppercase tracking-widest mt-1">Platform</p>
          </div>
        </div>
        
        <div className="px-4 py-2 mt-4 md:mt-0">
          <p className="text-[10px] font-bold text-[#FFF8E7]/50 uppercase tracking-widest mb-4 px-2">Phase 0</p>
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
                      ? "bg-[#FF8F00] text-[#4E342E] shadow-sm" 
                      : "text-[#FFF8E7]/80 hover:bg-[#1B5E20] hover:text-[#FFF8E7]"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={cn("w-5 h-5", isActive ? "text-[#4E342E]" : "text-[#FF8F00]")} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.id === 'cart' && cartCount > 0 && (
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-bold",
                      isActive ? "bg-[#4E342E] text-[#FF8F00]" : "bg-[#FF8F00] text-[#4E342E]"
                    )}>
                      {cartCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-[#1B5E20]">
          <div className="flex items-center space-x-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-[#1B5E20] flex items-center justify-center text-[#FF8F00]">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#FFF8E7] truncate">Seller 01</p>
              <p className="text-[10px] font-mono text-[#FFF8E7]/60 truncate mt-0.5">{session.user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-full hover:bg-red-500/20 text-[#FFF8E7]/50 hover:text-red-400 flex items-center justify-center transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-transparent relative">
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
