import 'package:flutter/material.dart';

class AnnouncementDetailScreen extends StatelessWidget {
  final String id;
  
  const AnnouncementDetailScreen({Key? key, required this.id}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Announcement Details'),
      ),
      body: Center(
        child: Text('Announcement Detail Screen - ID: $id'),
      ),
    );
  }
}
