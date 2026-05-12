// lib/screens/seller_dashboard.dart
import 'package:flutter/material.dart';

class SellerDashboard extends StatefulWidget {
  @override
  _SellerDashboardState createState() => _SellerDashboardState();
}

class _SellerDashboardState extends State<SellerDashboard> {
  bool _shareInventory = false;
  Map<String, dynamic>? _analyticsCache;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchSellerAnalytics();
    // Simulate real-time subscription setup
    // Supabase.instance.client.from('seller_analytics_cache').on(...).subscribe();
  }

  Future<void> _fetchSellerAnalytics() async {
    // In production: fetch from 'seller_analytics_cache' table where seller_id = auth.uid()
    await Future.delayed(const Duration(seconds: 1)); // Simulate network
    setState(() {
      _analyticsCache = {
        'avg_market_price_range': 'CDF 1200 - 1300',
        'your_price': 'CDF 1250',
        'demand_estimate': 'HIGH',
        'queries_this_week': 240,
      };
      _isLoading = false;
    });
  }

  Future<void> _toggleShareInventory(bool value) async {
    setState(() {
      _shareInventory = value;
    });
    // In production: update seller profile/preferences in Supabase
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(value ? 'Inventory sharing enabled.' : 'Inventory sharing disabled.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFF0F172A),
        body: Center(child: CircularProgressIndicator(color: Color(0xFFF59E0B))),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Seller Intelligence', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStatCard(
              title: "Your Price vs. 5 Nearest Sellers",
              value: _analyticsCache?['your_price'] ?? '--',
              subtitle: "Market Range: \${_analyticsCache?['avg_market_price_range'] ?? '--'}",
              icon: Icons.storefront,
            ),
            const SizedBox(height: 16),
            _buildStatCard(
              title: "Estimated Weekly Demand",
              value: _analyticsCache?['demand_estimate'] ?? '--',
              subtitle: "\${_analyticsCache?['queries_this_week'] ?? 0} searches near you",
              icon: Icons.trending_up,
              valueColor: const Color(0xFF10B981),
            ),
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "Opt-In Data Sharing",
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    "Share your real-time inventory levels to unlock advanced buyer leads and prediction forecasts.",
                    style: TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
                  ),
                  const SizedBox(height: 16),
                  SwitchListTile(
                    title: const Text(
                      "Share real-time inventory",
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                    ),
                    activeColor: const Color(0xFFF59E0B),
                    contentPadding: EdgeInsets.zero,
                    value: _shareInventory,
                    onChanged: _toggleShareInventory,
                  )
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    Color valueColor = Colors.white,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF020617),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: const Color(0xFFF59E0B), size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.1,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: valueColor),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
          ),
        ],
      ),
    );
  }
}
