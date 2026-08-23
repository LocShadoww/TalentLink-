# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

# TalentLink Project Architecture Rules

1. **Image Storage:** DO NOT USE Firebase Storage. Firebase Storage requires the Blaze (paid) plan which is unavailable here. 
   - **Alternative:** Convert images to `Base64` format (Data URI) using `expo-file-system` and save them directly as strings in **Cloud Firestore** documents (e.g., `avatar`, `logo` fields). 
   - **Constraint:** Always compress images before converting (e.g., set `quality: 0.4` in `expo-image-picker`) to strictly avoid exceeding Firestore's 1MB-per-document limit.
2. **Firestore Indexes:** Any composite query combining `where` filters (e.g., `status`) and `orderBy` sorting (e.g., `created_at`) MUST be backed by a corresponding index in `firestore.indexes.json`. Never assume client-side filtering is the only way out; build the index.
3. **Role-based Authentication:** The project supports two user types: `candidate` and `employer`. Ensure `firestore.rules` strictly validate `request.auth.uid` against document ownership and role access rights.
