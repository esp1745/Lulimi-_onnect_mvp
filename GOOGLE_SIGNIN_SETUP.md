# Turning on "Sign in with Google"

The code for Google sign-in is already in place on both sides — it just needs a
client ID. Until one is configured, the button still renders and explains what's
missing instead of disappearing.

## 1. Create an OAuth client

1. Open the [Google Cloud console](https://console.cloud.google.com/apis/credentials)
   and pick (or create) a project.
2. **Create credentials → OAuth client ID → Web application.**
3. Under **Authorised JavaScript origins**, add every origin the app is served
   from:
   - `http://localhost:5173` (Vite dev server)
   - your production domain, e.g. `https://lulimi.example.com`
4. No redirect URI is needed — this uses Google Identity Services, which returns
   an ID token to the page rather than redirecting.
5. Copy the **Client ID** (it ends in `.apps.googleusercontent.com`).

## 2. Configure both sides

The same client ID goes in two places. The frontend uses it to render Google's
button; the backend uses it to verify that the ID token was really issued for
this app.

`frontend/.env`:

```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

`backend/.env`:

```
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Restart both servers afterwards — Vite only reads `.env` at startup.

## 3. What happens on sign-in

- **Existing account** → signed straight in; the role already on the account is
  used, and the `role` sent by the button is ignored.
- **New Google email, from the sign-up page** → an account is created with the
  role picked there (teacher or learner), a welcome notification is sent, and the
  matching profile row is provisioned.
- **New Google email, from the sign-in page** → rejected with a 404, because
  there's no way to know which role to create. The button tells the person to use
  sign-up instead.

In every case the user is then routed by `landingPathForUser`, which sends anyone
who hasn't finished setting up into their role's onboarding — Google sign-in skips
the sign-up form, so this is the only thing that catches those accounts.
