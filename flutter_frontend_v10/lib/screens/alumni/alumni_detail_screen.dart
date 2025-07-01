import 'package:flutter/material.dart';

class AlumniDetailScreen extends StatelessWidget {
  final String id;
  
  const AlumniDetailScreen({Key? key, required this.id}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Alumni Details'),
      ),
      body: Center(
        child: Text('Alumni Detail Screen - ID: $id'),
      ),
    );
  }
}
