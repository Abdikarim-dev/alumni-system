import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool activity = true;
  bool showDonationDate = false;
  bool allowConnect = false;

  @override
  Widget build(BuildContext context) {
    const red = Color(0xFFB71C1C);
    const dividerColor = Color(0xFFE0E0E0);
    const secondaryText = Color(0xFF757575);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: Colors.black, size: 28),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        centerTitle: true,
        title: Text(
          'My Profile',
          style: GoogleFonts.inter(
            color: Colors.black,
            fontWeight: FontWeight.w600,
            fontSize: 22,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Profile Section
            Row(
              children: [
                Stack(
                  children: [
                    CircleAvatar(
                      radius: 36,
                      backgroundImage: NetworkImage(
                        'https://randomuser.me/api/portraits/men/32.jpg',
                      ),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.yellow[700],
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                        ),
                        padding: const EdgeInsets.all(2),
                        child: const Icon(Icons.add,
                            size: 18, color: Colors.black),
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.person, color: red, size: 22),
                        const SizedBox(width: 6),
                        Text(
                          'My Profile',
                          style: GoogleFonts.inter(
                            color: red,
                            fontWeight: FontWeight.w600,
                            fontSize: 18,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Ramanjot Singh',
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w700,
                        fontSize: 22,
                        color: Colors.black,
                      ),
                    ),
                    Text(
                      'Alumni',
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w500,
                        fontSize: 14,
                        color: secondaryText,
                      ),
                    ),
                    Text(
                      'BTech (ME) 2019',
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w400,
                        fontSize: 14,
                        color: secondaryText,
                      ),
                    ),
                    Text(
                      'Chandigarh',
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w400,
                        fontSize: 14,
                        color: secondaryText,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            Divider(color: dividerColor, thickness: 1),
            const SizedBox(height: 18),
            // Experience
            Text(
              'Experience',
              style: GoogleFonts.inter(
                color: red,
                fontWeight: FontWeight.w700,
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 8),
            Divider(color: dividerColor, thickness: 1),
            const SizedBox(height: 8),
            Text(
              'Software Developer at Digital Labs',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w600,
                fontSize: 15,
                color: Colors.black,
              ),
            ),
            Text(
              '2019 -',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w400,
                fontSize: 14,
                color: secondaryText,
              ),
            ),
            Text(
              'Chandigarh',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w400,
                fontSize: 14,
                color: secondaryText,
              ),
            ),
            const SizedBox(height: 18),
            // Activity
            Text(
              'Activity',
              style: GoogleFonts.inter(
                color: red,
                fontWeight: FontWeight.w700,
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 8),
            Divider(color: dividerColor, thickness: 1),
            const SizedBox(height: 8),
            Text(
              'Attended Fateh Marathon held in college campus on 30 November',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w600,
                fontSize: 15,
                color: Colors.black,
              ),
            ),
            Text(
              'Donated ₹6000 to Infrastructure Campaign',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w600,
                fontSize: 15,
                color: Colors.black,
              ),
            ),
            const SizedBox(height: 18),
            // General Settings
            Text(
              'General Settings',
              style: GoogleFonts.inter(
                color: red,
                fontWeight: FontWeight.w700,
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 8),
            Divider(color: dividerColor, thickness: 1),
            const SizedBox(height: 8),
            // Activity Toggle
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              value: activity,
              onChanged: (val) => setState(() => activity = val),
              activeColor: red,
              title: Text(
                'Activity',
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.w600,
                  fontSize: 16,
                  color: Colors.black,
                ),
              ),
              subtitle: Text(
                'Allow users to see your activity',
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.w400,
                  fontSize: 13,
                  color: secondaryText,
                ),
              ),
            ),
            // Show Donation Date Toggle
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              value: showDonationDate,
              onChanged: (val) => setState(() => showDonationDate = val),
              activeColor: red,
              title: Text(
                'Show Donation Date',
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.w600,
                  fontSize: 16,
                  color: Colors.black,
                ),
              ),
              subtitle: Text(
                'Donation date is displayed to other users',
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.w400,
                  fontSize: 13,
                  color: secondaryText,
                ),
              ),
            ),
            // Allow users to connect Toggle
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              value: allowConnect,
              onChanged: (val) => setState(() => allowConnect = val),
              activeColor: red,
              title: Text(
                'Allow users to connect',
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.w600,
                  fontSize: 16,
                  color: Colors.black,
                ),
              ),
              subtitle: Text(
                'Allows people to message you on app directly',
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.w400,
                  fontSize: 13,
                  color: secondaryText,
                ),
              ),
            ),
            const SizedBox(height: 18),
            // Edit Profile Button
            Center(
              child: SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: red,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 4,
                    shadowColor: red.withOpacity(0.3),
                  ),
                  child: Text(
                    'Edit Profile',
                    style: GoogleFonts.inter(
                      fontWeight: FontWeight.w600,
                      fontSize: 18,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 18),
          ],
        ),
      ),
    );
  }
}
