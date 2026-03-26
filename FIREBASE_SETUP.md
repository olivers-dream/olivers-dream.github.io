Firebase Setup For Global Progress Sync
======================================

1. Create a Firebase project at https://console.firebase.google.com/
2. Add a Web app to the project.
3. In Firebase Authentication:
   - Enable `Email/Password`
4. In Firestore Database:
   - Create the database in production mode
   - Create these rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /studyPortalProfiles/{userId} {
      allow read: if request.auth != null && (
        request.auth.uid == userId ||
        (resource.data.parentEmails is list && request.auth.token.email in resource.data.parentEmails)
      );
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

5. Copy the Firebase web config values into:
   - `Study_Portal/assets/cloud-config.js`

Example:

```
window.STUDY_PORTAL_CLOUD_CONFIG = {
  firebase: {
    apiKey: '...',
    authDomain: 'your-project.firebaseapp.com',
    projectId: 'your-project',
    storageBucket: 'your-project.firebasestorage.app',
    messagingSenderId: '...',
    appId: '...'
  },
  collectionName: 'studyPortalProfiles'
};
```

Parent access setup
-------------------

1. On the child account, open `sync.html`.
2. Sign in with the child cloud account.
3. In `Parent Viewer Access`, add the parent email address.
4. On the parent device, open `parent.html`.
5. Unlock the page with the parent PIN.
6. Create or sign in with that separate parent email and password.
7. Click `Load Linked Child Record`.

This does not reset the child progress record. It only grants read access for the listed parent email.

How to move existing progress from the old computer
--------------------------------------------------

Option A: direct upload
- Open `sync.html` on the old computer
- Create/sign in to the same Firebase account
- Click `Push This Device To Cloud`

Option B: backup file
- Open `sync.html` on the old computer
- Click `Export Backup JSON`
- Move the file to the new computer
- Open `sync.html`
- Import the backup and push it to the cloud

Cost
----

For one child and one parent, Firebase Spark is typically enough and usually stays in the free tier.
