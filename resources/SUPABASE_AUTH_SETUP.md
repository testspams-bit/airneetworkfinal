# Supabase authentication setup

The login modal supports Student and Mentor accounts exclusively using **Google Authentication** and **Email + Password**. Mobile number OTP has been removed since no external SMS/OTP API service is subscribed; mobile numbers are collected during registration for mentorship communication and stored in user metadata without requiring OTP verification.

To connect your own Supabase project:

1. Create a Supabase project and copy its Project URL and publishable (or legacy anon) key into `.env.local` or `.env`:

   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
   ```

2. In Supabase **Authentication → Providers**:
   - **Email**: Ensure Email provider is enabled. (Phone provider / SMS OTP is not required).
   - **Google**: Enable Google sign-in. Create a web OAuth client in Google Cloud Console and add the Supabase callback URL to its authorized redirect URIs.

3. In Supabase **Authentication → URL Configuration**:
   - Set the production site URL and add your preview/dev URL to the redirect allow list.

4. Restart the Vite server after adding `.env.local`.

The selected account type is saved as `air_neetwork_role` (`student_mentee` or `mentor`) in Supabase Auth user metadata alongside `full_name`, `contact_phone`, and `contact_email`.
