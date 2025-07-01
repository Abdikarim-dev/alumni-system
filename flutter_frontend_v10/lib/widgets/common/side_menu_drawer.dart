import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class SideMenuDrawer extends StatelessWidget {
  final int selectedIndex;
  final Function(int) onMenuTap;
  final VoidCallback onSignOut;

  const SideMenuDrawer({
    Key? key,
    required this.selectedIndex,
    required this.onMenuTap,
    required this.onSignOut,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final menuItems = [
      _MenuItem(
        icon: Icons.menu_book_rounded,
        title: 'Alumni Directory',
      ),
      _MenuItem(
        icon: Icons.people_alt_rounded,
        title: 'My Connections',
      ),
      _MenuItem(
        icon: Icons.forum_rounded,
        title: 'Feed',
      ),
      _MenuItem(
        icon: Icons.work_outline_rounded,
        title: 'Job and Mentorship',
      ),
      _MenuItem(
        icon: Icons.article_outlined,
        title: 'News and Updates',
      ),
      _MenuItem(
        icon: Icons.volunteer_activism_rounded,
        title: 'Donate',
      ),
      _MenuItem(
        icon: Icons.chat_bubble_outline_rounded,
        title: 'Messages',
      ),
      _MenuItem(
        icon: Icons.settings_outlined,
        title: 'Settings',
      ),
    ];

    return ClipRRect(
      borderRadius: const BorderRadius.only(
        topRight: Radius.circular(32),
        bottomRight: Radius.circular(32),
      ),
      child: Drawer(
        elevation: 0,
        backgroundColor: Colors.white,
        child: SafeArea(
          child: Column(
            children: [
              const SizedBox(height: 32),
              // Cap icon
              Center(
                child: Icon(
                  Icons.school_rounded,
                  size: 72,
                  color: Colors.black,
                ),
              ),
              const SizedBox(height: 32),
              // Menu items
              Expanded(
                child: ListView.separated(
                  padding: EdgeInsets.zero,
                  itemCount: menuItems.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 4),
                  itemBuilder: (context, index) {
                    final item = menuItems[index];
                    final selected = index == selectedIndex;
                    return Material(
                      color: selected
                          ? const Color(0xFFF4F4F6)
                          : Colors.transparent,
                      child: InkWell(
                        borderRadius: BorderRadius.circular(12),
                        onTap: () => onMenuTap(index),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 14),
                          child: Row(
                            children: [
                              Icon(item.icon, color: Colors.black87, size: 26),
                              const SizedBox(width: 18),
                              Expanded(
                                child: Text(
                                  item.title,
                                  style: GoogleFonts.inter(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w500,
                                    color: Colors.black,
                                  ),
                                ),
                              ),
                              const Icon(Icons.chevron_right_rounded,
                                  color: Colors.black38, size: 28),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),
              // Sign Out button
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
                child: SizedBox(
                  width: double.infinity,
                  height: 54,
                  child: ElevatedButton(
                    onPressed: onSignOut,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFB71C1C),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(32),
                      ),
                      elevation: 0,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Sign Out',
                          style: GoogleFonts.inter(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(width: 10),
                        const Icon(Icons.logout_rounded,
                            color: Colors.white, size: 24),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MenuItem {
  final IconData icon;
  final String title;
  const _MenuItem({required this.icon, required this.title});
}
