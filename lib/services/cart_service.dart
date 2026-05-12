import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class CartItem {
  final String productId;
  final String productName;
  final double price;
  final int quantity;
  final String sellerId;
  final DateTime addedAt;

  CartItem({
    required this.productId,
    required this.productName,
    required this.price,
    required this.quantity,
    required this.sellerId,
    required this.addedAt,
  });

  Map<String, dynamic> toJson() => {
        'productId': productId,
        'productName': productName,
        'price': price,
        'quantity': quantity,
        'sellerId': sellerId,
        'addedAt': addedAt.toIso8601String(),
      };

  factory CartItem.fromJson(Map<String, dynamic> json) => CartItem(
        productId: json['productId'],
        productName: json['productName'],
        price: json['price'],
        quantity: json['quantity'],
        sellerId: json['sellerId'],
        addedAt: DateTime.parse(json['addedAt']),
      );
}

class CartService {
  static const String _cartBoxName = 'cart_box';
  static const String _pendingSyncBoxName = 'pending_sync';
  late Box<String> _cartBox;
  late Box<List<dynamic>> _pendingSyncBox;

  static final CartService _instance = CartService._internal();
  factory CartService() => _instance;
  CartService._internal();

  Future<void> init() async {
    await Hive.initFlutter();
    _cartBox = await Hive.openBox<String>(_cartBoxName);
    _pendingSyncBox = await Hive.openBox<List<dynamic>>(_pendingSyncBoxName);
    _listenConnectivity();
  }

  void _listenConnectivity() {
    Connectivity().onConnectivityChanged.listen((result) async {
      // Changed to handle single result for newer versions of connectivity_plus or list for latest
      // The user code used `result != ConnectivityResult.none`, assuming single result signature
      // We will check if the result is not none in case it's a list or not
      if (result is List) {
        if (!result.contains(ConnectivityResult.none)) {
          await _syncPendingToServer();
        }
      } else {
        if (result != ConnectivityResult.none) {
          await _syncPendingToServer();
        }
      }
    });
  }

  Future<void> addItem(CartItem item) async {
    final key = '${item.productId}_${item.sellerId}';
    final existing = _cartBox.get(key);
    if (existing != null) {
      final existingItem = CartItem.fromJson(jsonDecode(existing));
      final updatedItem = CartItem(
        productId: existingItem.productId,
        productName: existingItem.productName,
        price: existingItem.price,
        quantity: existingItem.quantity + item.quantity,
        sellerId: existingItem.sellerId,
        addedAt: DateTime.now(),
      );
      await _cartBox.put(key, jsonEncode(updatedItem.toJson()));
    } else {
      await _cartBox.put(key, jsonEncode(item.toJson()));
    }
    await _queueSync(key);
  }

  Future<void> addMultiple(List<CartItem> items) async {
    for (final item in items) {
      await addItem(item);
    }
  }

  Future<List<CartItem>> getCartItems() async {
    final items = <CartItem>[];
    for (final key in _cartBox.keys) {
      final jsonStr = _cartBox.get(key);
      if (jsonStr != null) {
        items.add(CartItem.fromJson(jsonDecode(jsonStr)));
      }
    }
    items.sort((a, b) => a.addedAt.compareTo(b.addedAt));
    return items;
  }

  Future<void> removeItem(String productId, String sellerId) async {
    final key = '${productId}_$sellerId';
    await _cartBox.delete(key);
    await _queueSyncForDeletion(key);
  }

  Future<void> clearCart() async {
    await _cartBox.clear();
    await _queueSyncClear();
  }

  Future<void> _queueSync(String key) async {
    final item = _cartBox.get(key);
    if (item == null) return;
    final pending = _pendingSyncBox.get('pending_updates') ?? [];
    pending.add({'action': 'upsert', 'key': key, 'data': item});
    await _pendingSyncBox.put('pending_updates', pending);
    await _trySyncNow();
  }

  Future<void> _queueSyncForDeletion(String key) async {
    final pending = _pendingSyncBox.get('pending_updates') ?? [];
    pending.add({'action': 'delete', 'key': key});
    await _pendingSyncBox.put('pending_updates', pending);
    await _trySyncNow();
  }

  Future<void> _queueSyncClear() async {
    final pending = _pendingSyncBox.get('pending_updates') ?? [];
    pending.add({'action': 'clear'});
    await _pendingSyncBox.put('pending_updates', pending);
    await _trySyncNow();
  }

  Future<void> _trySyncNow() async {
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity is List ? !connectivity.contains(ConnectivityResult.none) : connectivity != ConnectivityResult.none) {
      await _syncPendingToServer();
    }
  }

  Future<void> _syncPendingToServer() async {
    final pending = _pendingSyncBox.get('pending_updates');
    if (pending == null || pending.isEmpty) return;

    final supabase = Supabase.instance.client;
    final user = supabase.auth.currentUser;
    if (user == null) return; // wait for login

    for (final action in pending) {
      try {
        if (action['action'] == 'upsert') {
          final item = CartItem.fromJson(jsonDecode(action['data']));
          await supabase.from('carts').upsert({
            'user_id': user.id,
            'product_id': item.productId,
            'seller_id': item.sellerId,
            'quantity': item.quantity,
            'added_at': item.addedAt.toIso8601String(),
          });
        } else if (action['action'] == 'delete') {
          await supabase.from('carts').delete().match({
            'user_id': user.id,
            'product_id': action['key'].split('_')[0],
            'seller_id': action['key'].split('_')[1],
          });
        } else if (action['action'] == 'clear') {
          await supabase.from('carts').delete().eq('user_id', user.id);
        }
      } catch (e) {
        debugPrint('Sync failed for action: $action - $e');
        return; // keep pending for next retry
      }
    }
    await _pendingSyncBox.delete('pending_updates');
  }

  Future<void> mergeOfflineCartAfterLogin() async {
    await _syncPendingToServer();
  }
}
