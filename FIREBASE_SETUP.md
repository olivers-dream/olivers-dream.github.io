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
      allow read, write: if request.auth != null && request.auth.uid == userId;
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
