class ApiConstants {
  static const String baseUrl = 'http://192.168.1.12:5000/api';

  // Auth endpoints
  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String verifyEmail = '/auth/verify-email';
  static const String forgotPassword = '/auth/forgot-password';
  static const String me = '/auth/me';

  // User endpoints
  static const String userProfile = '/users/profile';
  static const String userPhoto = '/users/me/photo';
  static const String userPrivacy = '/users/privacy';
  static const String userPassword = '/users/password';

  // Alumni endpoints
  static const String alumni = '/alumni';

  // Events endpoints
  static const String events = '/events';
  static const String myRsvps = '/events/my-rsvps';

  // Donations endpoints
  static const String donations = '/donations';
  static const String myDonations = '/donations/my';

  // Jobs endpoints
  static const String jobs = '/jobs';

  // Notifications endpoints
  static const String notifications = '/notifications';
  static const String markAllRead = '/notifications/mark-all-read';

  // Transactions endpoints
  static const String myTransactions = '/transactions/my';

  // Announcements endpoints
  static const String announcements = '/announcements';

  // Upload endpoints
  static const String uploadSingle = '/upload/single';
}
