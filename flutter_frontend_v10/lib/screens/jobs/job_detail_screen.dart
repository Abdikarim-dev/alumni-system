import 'package:flutter/material.dart';

class JobDetailScreen extends StatelessWidget {
  final String id;
  
  const JobDetailScreen({Key? key, required this.id}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Job Details'),
      ),
      body: Center(
        child: Text('Job Detail Screen - ID: $id'),
      ),
    );
  }
}
