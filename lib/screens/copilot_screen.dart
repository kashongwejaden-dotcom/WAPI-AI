import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../services/cart_service.dart';

class CopilotScreen extends StatefulWidget {
  @override
  _CopilotScreenState createState() => _CopilotScreenState();
}

class _CopilotScreenState extends State<CopilotScreen> {
  final TextEditingController _controller = TextEditingController();
  
  bool _isLoading = false;
  Map<String, dynamic>? _results;

  Future<void> _runCopilot() async {
    final query = _controller.text.trim();
    if (query.isEmpty) return;

    setState(() {
      _isLoading = true;
      _results = null;
    });

    try {
      final response = await http.post(
        Uri.parse('https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/copilot'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY'
        },
        body: jsonEncode({"query": query}),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        setState(() {
          _results = jsonDecode(response.body);
        });
      } else {
        throw Exception("Copilot Error");
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to optimize shopping list: $e')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text("Copilot Budget Optimizer", style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: const Color(0xFF1E293B), height: 1.0),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              "What do you need?",
              style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _controller,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: "e.g., rice and oil for 5 people under $10",
                hintStyle: const TextStyle(color: Color(0xFF64748B)),
                filled: true,
                fillColor: const Color(0xFF1E293B),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
              maxLines: 2,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _isLoading ? null : _runCopilot,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFF59E0B),
                foregroundColor: const Color(0xFF020617),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _isLoading 
                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF020617)))
                : const Text("Optimize List", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ),
            const SizedBox(height: 24),
            if (_results != null) _buildResults(),
          ],
        ),
      ),
    );
  }

  Widget _buildResults() {
    final list = _results!['shopping_list'] as List<dynamic>? ?? [];
    final total = _results!['grand_total'];
    final message = _results!['message'];

    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.5)),
            ),
            child: Row(
              children: [
                const Icon(Icons.check_circle, color: Color(0xFF10B981)),
                const SizedBox(width: 8),
                Expanded(child: Text(message, style: const TextStyle(color: Colors.white))),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            "Optimized List",
            style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: ListView.builder(
              itemCount: list.length,
              itemBuilder: (context, index) {
                final item = list[index];
                return Card(
                  color: const Color(0xFF020617),
                  shape: RoundedRectangleBorder(
                    side: const BorderSide(color: Color(0xFF1E293B)),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: ListTile(
                    title: Text(item['name'], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                    subtitle: Text('Seller: ${item['seller']}', style: const TextStyle(color: Color(0xFF64748B))),
                    trailing: Text(
                      '${item['qty']}x ${item['total_cost']} ${item['currency']}',
                      style: const TextStyle(color: Color(0xFFF59E0B), fontWeight: FontWeight.bold),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("Estimated Total", style: TextStyle(color: Color(0xFF94A3B8), fontSize: 16)),
              Text("$total", style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: list.isEmpty ? null : () => _addAllToCart(list),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF10B981),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Center(child: Text("Add all to cart", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16))),
          ),
        ],
      ),
    );
  }

  Future<void> _addAllToCart(List<dynamic> items) async {
    final cartService = CartService();
    await cartService.init();
    
    final cartItems = items.map((item) {
      return CartItem(
        productId: item['product_id'] ?? item['id'],
        productName: item['name'] ?? item['product_name'],
        price: (item['price'] as num).toDouble(),
        quantity: (item['suggested_quantity'] as num?)?.toInt() ?? 1,
        sellerId: item['seller_id'] ?? 'unknown',
        addedAt: DateTime.now(),
      );
    }).toList();
    
    await cartService.addMultiple(cartItems);
    
    if (mounted) {
      _showSnackBar('${cartItems.length} items added to cart');
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}
