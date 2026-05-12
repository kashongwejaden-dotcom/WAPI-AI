// lib/screens/ai_search_screen.dart
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';

class AiSearchScreen extends StatefulWidget {
  @override
  _AiSearchScreenState createState() => _AiSearchScreenState();
}

class _AiSearchScreenState extends State<AiSearchScreen> {
  final TextEditingController _controller = TextEditingController();
  
  // Internal chat state
  final List<Map<String, String>> _messages = [
    {"role": "assistant", "text": "What crops or products are you looking for?"}
  ];
  bool _isLoading = false;

  Future<void> _sendMessage() async {
    final query = _controller.text.trim();
    if (query.isEmpty) return;

    setState(() {
      _messages.add({"role": "user", "text": query});
      _isLoading = true;
    });
    _controller.clear();

    try {
      // Offline-first/Low Connectivity handler
      // We set a strict 5 second timeout. If it drops, fallback to SMS instruction.
      final response = await http.post(
        Uri.parse('https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/ai-search'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY' // Replace via env vars
        },
        body: jsonEncode({
          "query": query, 
          "user_lat": -4.3, 
          "user_lng": 15.3 // Mock Kinshasa coordinates
        }), 
      ).timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _messages.add({"role": "assistant", "text": data['summary']});
        });
      } else {
        throw Exception("Server connection error: \${response.statusCode}");
      }
    } on TimeoutException catch (_) {
      // Fast fallback for low connectivity
      setState(() {
        _messages.add({
          "role": "assistant", 
          "text": "Network is too slow. SMS fallback active: Text your query to +243 00 000 0000 to get async price updates."
        });
      });
    } catch (e) {
      setState(() {
        _messages.add({"role": "assistant", "text": "An error occurred fetching prices. Please try again later."});
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A), // Tailwind slate-950
      appBar: AppBar(
        title: const Text("WapiAI Market Search", style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: const Color(0xFF1E293B), height: 1.0), // slate-800
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isUser = msg["role"] == "user";
                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
                    decoration: BoxDecoration(
                      color: isUser ? const Color(0xFFF59E0B) : const Color(0xFF020617), // amber-500 vs slate-950
                      border: Border.all(color: isUser ? const Color(0xFFF59E0B) : const Color(0xFF1E293B)),
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(16),
                        topRight: const Radius.circular(16),
                        bottomLeft: Radius.circular(isUser ? 16 : 0),
                        bottomRight: Radius.circular(isUser ? 0 : 16),
                      ),
                    ),
                    child: Text(
                      msg["text"]!,
                      style: TextStyle(
                        color: isUser ? const Color(0xFF020617) : const Color(0xFFCBD5E1), // slate-950 vs slate-300
                        fontSize: 14,
                        fontWeight: isUser ? FontWeight.w600 : FontWeight.normal,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.all(8.0), 
              child: CircularProgressIndicator(color: Color(0xFFF59E0B))
            ),
          Container(
            padding: const EdgeInsets.all(12.0),
            decoration: const BoxDecoration(
              color: Color(0xFF020617),
              border: Border(top: BorderSide(color: Color(0xFF1E293B))),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    style: const TextStyle(color: Colors.white, fontFamily: 'monospace', fontSize: 13),
                    decoration: InputDecoration(
                      hintText: "e.g., cheap rice near me...",
                      hintStyle: const TextStyle(color: Color(0xFF64748B)), // slate-500
                      filled: true,
                      fillColor: const Color(0xFF0F172A), // slate-900
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  decoration: BoxDecoration(
                    color: _isLoading ? Colors.grey : const Color(0xFFF59E0B),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.send, color: Color(0xFF020617)),
                    onPressed: _isLoading ? null : _sendMessage,
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}
