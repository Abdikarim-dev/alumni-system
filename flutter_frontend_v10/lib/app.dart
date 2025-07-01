import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'providers/auth_provider.dart';
import 'providers/user_provider.dart';
import 'providers/alumni_provider.dart';
import 'providers/events_provider.dart';
import 'providers/donations_provider.dart';
import 'providers/jobs_provider.dart';
import 'providers/notifications_provider.dart';
import 'providers/transactions_provider.dart';
import 'core/constants/theme_constants.dart';
import 'core/services/api_service.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/auth/forgot_password_screen.dart';
import 'screens/auth/verify_email_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/profile/profile_screen.dart';
import 'screens/profile/edit_profile_screen.dart';
import 'screens/alumni/alumni_list_screen.dart';
import 'screens/alumni/alumni_detail_screen.dart';
import 'screens/events/events_list_screen.dart';
import 'screens/events/event_detail_screen.dart';
import 'screens/events/my_rsvps_screen.dart';
import 'screens/donations/donations_list_screen.dart';
import 'screens/donations/donation_detail_screen.dart';
import 'screens/jobs/jobs_list_screen.dart';
import 'screens/jobs/job_detail_screen.dart';
import 'screens/notifications/notifications_screen.dart';
import 'screens/transactions/transactions_screen.dart';
import 'screens/announcements/announcements_list_screen.dart';
import 'screens/announcements/announcement_detail_screen.dart';
import 'screens/home/welcome_screen.dart';

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => UserProvider()),
        ChangeNotifierProvider(create: (_) => AlumniProvider()),
        ChangeNotifierProvider(create: (_) => EventsProvider()),
        ChangeNotifierProvider(create: (_) => DonationsProvider()),
        ChangeNotifierProvider(create: (_) => JobsProvider()),
        ChangeNotifierProvider(create: (_) => NotificationsProvider()),
        ChangeNotifierProvider(create: (_) => TransactionsProvider()),
      ],
      child: AuthInitializer(),
    );
  }
}

class AuthInitializer extends StatefulWidget {
  @override
  _AuthInitializerState createState() => _AuthInitializerState();
}

class _AuthInitializerState extends State<AuthInitializer> {
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _initializeAuth();
  }

  Future<void> _initializeAuth() async {
    final authProvider = context.read<AuthProvider>();
    await authProvider.initialize();
    ApiService.onLogout = () {
      authProvider.logout();
    };
    setState(() {
      _isInitialized = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_isInitialized) {
      return const MaterialApp(
        home: Scaffold(
          body: Center(child: CircularProgressIndicator()),
        ),
        debugShowCheckedModeBanner: false,
      );
    }

    final authProvider = Provider.of<AuthProvider>(context, listen: true);
    final router = GoRouter(
      initialLocation: '/',
      refreshListenable: authProvider,
      redirect: (context, state) {
        if (authProvider.isLoading) {
          // Don't redirect until loading is done
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

        if (!isAuthenticated && !isAuthRoute) {
          return '/';
        }
        if (isAuthenticated && isAuthRoute) {
          return '/home';
        }
        return null;
      },
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) => const WelcomeScreen(),
        ),
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
        GoRoute(
          path: '/home',
          builder: (context, state) => const HomeScreen(),
        ),
        GoRoute(
          path: '/profile',
          builder: (context, state) => const ProfileScreen(),
        ),
        GoRoute(
          path: '/profile/edit',
          builder: (context, state) => const EditProfileScreen(),
        ),
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

    return MaterialApp.router(
      title: 'Alumni Network',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
