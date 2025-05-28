export interface GoogleProfile {
  sub: string; // Google user ID
  email: string; // User's email address
  email_verified: boolean; // Whether the email is verified
  name: string; // User's full name
  given_name: string; // User's first name
  family_name: string; // User's last name
  picture: string; // URL to the user's profile picture
  locale: string; // User's locale
}
