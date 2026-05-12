// lib/services/offline_queue.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:hive_flutter/hive_flutter.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';

class OfflineQueueService {
  static late Box _queueBox;

  static Future<void> init() async {
    await Hive.initFlutter();
    _queueBox = await Hive.openBox('offline_requests');
    
    Connectivity().onConnectivityChanged.listen((List<ConnectivityResult> results) {
      if (!results.contains(ConnectivityResult.none)) {
        _syncQueue();
      }
    });
    debugPrint("Offline queue initialized.");
  }

  /// Adds a task to the local queue.
  static Future<void> enqueueTask({
    required String endpoint,
    required Map<String, dynamic> payload,
  }) async {
    final timestamp = DateTime.now().toIso8601String();
    final task = {
      'endpoint': endpoint,
      'payload': payload,
      'timestamp': timestamp,
    };
    
    await _queueBox.put(timestamp, jsonEncode(task));
    debugPrint("Task enqueued for offline sync: $endpoint");
  }

  /// Attempts to process all queued tasks when back online.
  static Future<void> _syncQueue() async {
    if (_queueBox.isEmpty) return;

    final Map<dynamic, dynamic> tasks = _queueBox.toMap();
    final sortedKeys = tasks.keys.toList()..sort((a, b) {
      return a.toString().compareTo(b.toString()); // Keys are timestamps
    });

    for (var key in sortedKeys) {
      final taskStr = tasks[key] as String;
      final task = jsonDecode(taskStr);

      try {
        final response = await http.post(
          Uri.parse(task['endpoint']),
          headers: {
            'Content-Type': 'application/json',
            // Add authorization if needed
          },
          body: jsonEncode(task['payload']),
        ).timeout(const Duration(seconds: 10));

        if (response.statusCode >= 200 && response.statusCode < 300) {
          await _queueBox.delete(key);
          debugPrint("Successfully synced task: ${task['endpoint']}");
        } else {
          // Keep in queue, try again later
          debugPrint("Failed to sync task (Status: ${response.statusCode}), keeping in queue.");
          break; 
        }
      } catch (e) {
        // Network error, abort sync loop
        debugPrint("Network error during sync, aborting: $e");
        break;
      }
    }
  }
}
