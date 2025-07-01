import 'package:flutter/material.dart';

class EventDetailScreen extends StatelessWidget {
  final String id;
  
  const EventDetailScreen({Key? key, required this.id}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Event Details'),
      ),
      body: Center(
        child: Text('Event Detail Screen - ID: $id'),
      ),
    );
  }
}
