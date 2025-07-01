import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../providers/notifications_provider.dart';
import '../../widgets/common/app_bar_widget.dart';
import '../../widgets/common/side_menu_drawer.dart';
import '../../screens/profile/profile_screen.dart';
import '../../screens/news/news_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const DashboardTab(),
    NewsScreen(),
    Center(child: Text('Search', style: TextStyle(fontSize: 24))),
    Center(child: Text('Event Calendar', style: TextStyle(fontSize: 24))),
    ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NotificationsProvider>().loadNotifications();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: SideMenuDrawer(
        selectedIndex: _currentIndex,
        onMenuTap: (index) {
          setState(() {
            _currentIndex = index;
          });
          Navigator.of(context).pop();
        },
        onSignOut: () {
          context.read<AuthProvider>().logout();
          Navigator.of(context).pop();
        },
      ),
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        backgroundColor: DashboardTab.brandingColor,
        selectedItemColor: Colors.white,
        unselectedItemColor: DashboardTab.navUnselected,
        showUnselectedLabels: true,
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.event),
            label: 'Events',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.search),
            label: 'Search',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.event),
            label: 'Event Calendar',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

class DashboardTab extends StatelessWidget {
  const DashboardTab({Key? key}) : super(key: key);

  static const Color brandingColor = Color(0xFF9B1B2E);
  static const Color navUnselected = Color(0xFFDEBFC7);

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          // Top Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Builder(
                  builder: (context) => IconButton(
                    icon: Icon(Icons.menu, size: 28, color: brandingColor),
                    onPressed: () => Scaffold.of(context).openDrawer(),
                  ),
                ),
                const Spacer(),
                Stack(
                  children: [
                    Icon(Icons.notifications, size: 28, color: brandingColor),
                    Positioned(
                      right: 0,
                      top: 2,
                      child: Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          color: Colors.redAccent,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 1.5),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 16),
                    // Connect with your Batchmates
                    Text(
                      'Connect with your Batchmates',
                      style: TextStyle(
                        color: brandingColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 155,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        clipBehavior: Clip.hardEdge,
                        itemCount: 4,
                        separatorBuilder: (_, __) => const SizedBox(width: 12),
                        itemBuilder: (context, index) {
                          final batchmates = [
                            {
                              'name': 'Samara Patel',
                              'degree': 'B.Tech(CSE)',
                              'year': '2002',
                              'avatar':
                                  'https://randomuser.me/api/portraits/women/44.jpg',
                            },
                            {
                              'name': 'Raman Singh',
                              'degree': 'B.Tech(ME)',
                              'year': '2002',
                              'avatar':
                                  'https://randomuser.me/api/portraits/men/45.jpg',
                            },
                            {
                              'name': 'Ria Kapoor',
                              'degree': 'B.Tech(CSE)',
                              'year': '2002',
                              'avatar':
                                  'https://randomuser.me/api/portraits/women/46.jpg',
                            },
                            {
                              'name': 'Karan Gill',
                              'degree': 'B.Tech(ME)',
                              'year': '2002',
                              'avatar':
                                  'https://randomuser.me/api/portraits/men/47.jpg',
                            },
                          ];
                          final user = batchmates[index];
                          return Stack(
                            children: [
                              Container(
                                width: 100,
                                height: 145,
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black12,
                                      blurRadius: 8,
                                      offset: Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(
                                      vertical: 16, horizontal: 8),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      CircleAvatar(
                                        radius: 24,
                                        backgroundImage:
                                            NetworkImage(user['avatar']!),
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        user['name']!,
                                        style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 13),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      Text(
                                        user['degree']!,
                                        style: TextStyle(
                                            fontSize: 11,
                                            color: Colors.grey[600]),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      Text(
                                        user['year']!,
                                        style: TextStyle(
                                            fontSize: 11,
                                            color: Colors.grey[600]),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              Positioned(
                                top: 4,
                                right: 4,
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: brandingColor,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.add,
                                      color: Colors.white, size: 18),
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 24),
                    // News and Updates
                    Text(
                      'News and Updates',
                      style: TextStyle(
                        color: brandingColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 227,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        clipBehavior: Clip.hardEdge,
                        itemCount: 2,
                        separatorBuilder: (_, __) => const SizedBox(width: 12),
                        itemBuilder: (context, index) {
                          final news = [
                            {
                              'image':
                                  'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
                              'text':
                                  'College Conducted Successful Workshop on "Artificial Intelligence and Machine Learning"',
                            },
                            {
                              'image':
                                  'https://images.unsplash.com/photo-1464983953574-0892a716854b',
                              'text':
                                  'Jasmeen Kaur Final Year CSE Student wins Horse Riding Tournament held in Delhi',
                            },
                          ];
                          final item = news[index];
                          return Container(
                            width: 240,
                            height: 227,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black12,
                                  blurRadius: 8,
                                  offset: Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                ClipRRect(
                                  borderRadius: const BorderRadius.only(
                                    topLeft: Radius.circular(20),
                                    topRight: Radius.circular(20),
                                  ),
                                  child: Image.network(
                                    item['image']!,
                                    height: 147,
                                    width: 240,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                                Padding(
                                  padding: const EdgeInsets.all(10.0),
                                  child: Text(
                                    item['text']!,
                                    style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600),
                                    maxLines: 3,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 24),
                    // Upcoming Events
                    Text(
                      'Upcoming Events',
                      style: TextStyle(
                        color: brandingColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      clipBehavior: Clip.hardEdge,
                      itemCount: 2,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final events = [
                          {
                            'image':
                                'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2',
                            'title': 'Importance of Research Principles',
                            'venue': 'Auditorium 2',
                            'date': 'Mon, Dec 24',
                            'desc':
                                'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard',
                          },
                          {
                            'image':
                                'https://images.unsplash.com/photo-1513258496099-48168024aec0',
                            'title': 'Forum Discussion',
                            'venue': 'Auditorium 2',
                            'date': 'Mon, Dec 24',
                            'desc':
                                'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard',
                          },
                        ];
                        final event = events[index];
                        return Container(
                          height: 125,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(18),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black12,
                                blurRadius: 8,
                                offset: Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              ClipRRect(
                                borderRadius: const BorderRadius.only(
                                  topLeft: Radius.circular(18),
                                  bottomLeft: Radius.circular(18),
                                ),
                                child: Image.network(
                                  event['image']!,
                                  height: 125,
                                  width: 100,
                                  fit: BoxFit.cover,
                                ),
                              ),
                              Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.all(14.0),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text(
                                        event['title']!,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 15,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Venue: ${event['venue']!}',
                                        style: TextStyle(
                                            fontSize: 12,
                                            color: Colors.grey[700]),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      Text(
                                        event['date']!,
                                        style: const TextStyle(
                                            fontSize: 12, color: brandingColor),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        event['desc']!,
                                        style: TextStyle(
                                            fontSize: 12,
                                            color: Colors.grey[700]),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 100),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class AlumniTab extends StatelessWidget {
  const AlumniTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(
        title: 'Alumni Directory',
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              // Navigate to search screen
            },
          ),
        ],
      ),
      body: const Center(
        child: Text('Alumni Directory - Navigate to /alumni for full view'),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.go('/alumni'),
        child: const Icon(Icons.people),
      ),
    );
  }
}

class EventsTab extends StatelessWidget {
  const EventsTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(
        title: 'Events',
        actions: [
          IconButton(
            icon: const Icon(Icons.calendar_today),
            onPressed: () => context.go('/my-rsvps'),
          ),
        ],
      ),
      body: const Center(
        child: Text('Events Overview - Navigate to /events for full view'),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.go('/events'),
        child: const Icon(Icons.event),
      ),
    );
  }
}

class ProfileTab extends StatelessWidget {
  const ProfileTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(
        title: 'Profile',
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              // Navigate to settings
            },
          ),
        ],
      ),
      body: const Center(
        child: Text('Profile Overview - Navigate to /profile for full view'),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.go('/profile'),
        child: const Icon(Icons.person),
      ),
    );
  }
}
