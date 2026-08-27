# Google OAuth Setup Guide for SultiAI

## Overview
You need 3 things:
1. **Google Cloud Console** — Create OAuth credentials
2. **Supabase Dashboard** — Enable Google provider with your Client ID
3. **Your .env file** — Add the Client ID

---

## Step 1: Google Cloud Console

### 1.1 Create a Project
1. Go to https://console.cloud.google.com
2. Click **Select a project** → **New Project**
3. Name it `SultiAI` → Click **Create**

### 1.2 Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** → Click **Create**
3. Fill in:
   - App name: `SultiAI`
   - User support email: your email
   - Developer contact: your email
4. Click **Save and Continue**
5. On **Scopes** page: Click **Add or Remove Scopes**
   - Add: `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`
6. Click **Save and Continue**
7. On **Test users** page: Add your Google email
8. Click **Save and Continue**

### 1.3 Create OAuth Client ID (Web)
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `SultiAI Web`
5. **Authorized JavaScript origins**:
   - `http://localhost:8081` (Expo dev)
   - `http://localhost:8082`
   - `http://localhost:19006`
   - Your production URL (when ready)
6. **Authorized redirect URIs**:
   - Get this from Supabase Dashboard → Authentication → Providers → Google → Redirect URL
   - It looks like: `https://pptanwtuybivlqeyntwh.supabase.co/auth/v1/callback`
7. Click **Create**
8. **Copy the Client ID** (ends with `.apps.googleusercontent.com`)
9. **Copy the Client Secret**

### 1.4 (Optional) Create Android Client ID
1. Click **Create Credentials** → **OAuth client ID**
2. Application type: **Android**
3. Package name: Find in your `app.json` under `android.package`
4. SHA-1 certificate fingerprint: Run `cd android && ./gradlew signingReport`
5. Click **Create**

### 1.5 (Optional) Create iOS Client ID
1. Click **Create Credentials** → **OAuth client ID**
2. Application type: **iOS**
3. Bundle ID: Find in your `app.json` under `ios.bundleIdentifier`
4. Click **Create**

---

## Step 2: Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/pptanwtuybivlqeyntwh
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click to expand
4. Toggle **Enable Sign in with Google** to ON
5. Paste your **Web Client ID** (from Step 1.3)
6. Paste your **Client Secret** (from Step 1.3)
7. Copy the **Redirect URL** shown (you'll need this for Step 1.3)
8. Click **Save**

---

## Step 3: Update .env File

Add these to your root `.env` file:

```env
# Google OAuth
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id.apps.googleusercontent.com  # optional
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id.apps.googleusercontent.com  # optional
```

---

## Step 4: Test

1. Run `npm run dev`
2. On web: The "Continue with Google" button should now be active
3. Click it → Google consent screen → Redirected back → Signed in!

---

## Important Notes

- **Web Client ID is required** for React Native/Expo. The Android/iOS client IDs are optional.
- **Never** use the Android Client ID in your JavaScript code — always use the Web Client ID.
- The Google provider in Supabase must be enabled with the **Web Client ID**.
- For Expo Go, only the Web Client ID works. For development builds, you can also use Android/iOS Client IDs.

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `DEVELOPER_ERROR` | Wrong Client ID type | Use Web Client ID, not Android |
| `invalid_client` | Client ID not configured in Supabase | Enable Google provider in dashboard |
| `redirect_uri_mismatch` | Redirect URI not in Google Console | Add Supabase callback URL to redirect URIs |
| Button disabled | No Client ID in .env | Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` |
