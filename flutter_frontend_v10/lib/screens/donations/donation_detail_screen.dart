import 'package:flutter/material.dart';

class DonationDetailScreen extends StatelessWidget {
  final String id;
  
  const DonationDetailScreen({Key? key, required this.id}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Donation Details'),
      ),
      body: Center(
        child: Text('Donation Detail Screen - ID: $id'),
      ),
    );
  }
}
