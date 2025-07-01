import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/auth/forgot_password_screen.dart';
import '../screens/auth/verify_email_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/profile/edit_profile_screen.dart';
import '../screens/alumni/alumni_list_screen.dart';
import '../screens/alumni/alumni_detail_screen.dart';
import '../screens/events/events_list_screen.dart';
import '../screens/events/event_detail_screen.dart';
import '../screens/events/my_rsvps_screen.dart';
import '../screens/donations/donations_list_screen.dart';
import '../screens/donations/donation_detail_screen.dart';
import '../screens/jobs/jobs_list_screen.dart';
import '../screens/jobs/job_detail_screen.dart';
import '../screens/notifications/notifications_screen.dart';
import '../screens/transactions/transactions_screen.dart';
import '../screens/announcements/announcements_list_screen.dart';
import '../screens/announcements/announcement_detail_screen.dart';
import '../screens/home/welcome_screen.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/',
  redirect: (context, state) {
    final authProvider = context.read<AuthProvider>();
    if (authProvider.isLoading) {
      // Don't redirect until loading is done
      print(
          '[GoRouter] Waiting for authProvider to finish loading. No redirect.');
      return null;
    }
    final isAuthenticated = authProvider.isAuthenticated;
    final isAuthRoute = [
      '/login',
      '/register',
      '/forgot-password',
      '/verify-email',
      '/'
    ].contains(state.matchedLocation);

    print(
        '[GoRouter] redirect: isAuthenticated=$isAuthenticated, matchedLocation=${state.matchedLocation}');

    if (!isAuthenticated && !isAuthRoute) {
      print('[GoRouter] redirecting to /');
      return '/';
    }

    if (isAuthenticated && isAuthRoute) {
      print('[GoRouter] redirecting to /home');
      return '/home';
    }

    return null;
  },
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const WelcomeScreen(),
    ),
    // Auth Routes
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/register',
      builder: (context, state) => const RegisterScreen(),
    ),
    GoRoute(
      path: '/forgot-password',
      builder: (context, state) => const ForgotPasswordScreen(),
    ),
    GoRoute(
      path: '/verify-email',
      builder: (context, state) => const VerifyEmailScreen(),
    ),

    // Main App Routes
    GoRoute(
      path: '/home',
      builder: (context, state) => const HomeScreen(),
    ),

    // Profile Routes
    GoRoute(
      path: '/profile',
      builder: (context, state) => const ProfileScreen(),
    ),
    GoRoute(
      path: '/profile/edit',
      builder: (context, state) => const EditProfileScreen(),
    ),

    // Alumni Routes
    GoRoute(
      path: '/alumni',
      builder: (context, state) => const AlumniListScreen(),
    ),
    GoRoute(
      path: '/alumni/:id',
      builder: (context, state) => AlumniDetailScreen(
        id: state.pathParameters['id']!,
      ),
    ),

    // Events Routes
    GoRoute(
      path: '/events',
      builder: (context, state) => const EventsListScreen(),
    ),
    GoRoute(
      path: '/events/:id',
      builder: (context, state) => EventDetailScreen(
        id: state.pathParameters['id']!,
      ),
    ),
    GoRoute(
      path: '/my-rsvps',
      builder: (context, state) => const MyRsvpsScreen(),
    ),

    // Donations Routes
    GoRoute(
      path: '/donations',
      builder: (context, state) => const DonationsListScreen(),
    ),
    GoRoute(
      path: '/donations/:id',
      builder: (context, state) => DonationDetailScreen(
        id: state.pathParameters['id']!,
      ),
    ),

    // Jobs Routes
    GoRoute(
      path: '/jobs',
      builder: (context, state) => const JobsListScreen(),
    ),
    GoRoute(
      path: '/jobs/:id',
      builder: (context, state) => JobDetailScreen(
        id: state.pathParameters['id']!,
      ),
    ),

    // Other Routes
    GoRoute(
      path: '/notifications',
      builder: (context, state) => const NotificationsScreen(),
    ),
    GoRoute(
      path: '/transactions',
      builder: (context, state) => const TransactionsScreen(),
    ),
    GoRoute(
      path: '/announcements',
      builder: (context, state) => const AnnouncementsListScreen(),
    ),
    GoRoute(
      path: '/announcements/:id',
      builder: (context, state) => AnnouncementDetailScreen(
        id: state.pathParameters['id']!,
      ),
    ),
  ],
);
