import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class NewsScreen extends StatelessWidget {
  const NewsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    const red = Color(0xFFB71C1C);
    final newsList = [
      {
        'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        'title':
            'College Conducted Successful Workshop on "Artificial Intelligence and Machine Learning"',
      },
      {
        'image': 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
        'title':
            'Jasmeen Kaur Final Year CSE Student wins Horse Riding Tournament held in Delhi',
      },
      {
        'image': 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2',
        'title': 'New Research Lab Inaugurated at Campus',
      },
    ];
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: red,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: Colors.white, size: 28),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        centerTitle: true,
        title: Text(
          'News',
          style: GoogleFonts.inter(
            color: Colors.white,
            fontWeight: FontWeight.w600,
            fontSize: 22,
          ),
        ),
        actions: [
          IconButton(
            icon:
                const Icon(Icons.notifications, color: Colors.white, size: 26),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
        itemCount: newsList.length,
        separatorBuilder: (context, index) => const Padding(
          padding: EdgeInsets.symmetric(vertical: 16),
          child: Divider(thickness: 1, color: Color(0xFFE0E0E0)),
        ),
        itemBuilder: (context, index) {
          final news = newsList[index];
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Image.network(
                  news['image']!,
                  height: 160,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                news['title']!,
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.w600,
                  fontSize: 16,
                  color: Colors.black,
                ),
              ),
              const SizedBox(height: 8),
              Align(
                alignment: Alignment.centerRight,
                child: Text(
                  'Read More',
                  style: GoogleFonts.inter(
                    color: red,
                    fontWeight: FontWeight.w500,
                    fontSize: 15,
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
