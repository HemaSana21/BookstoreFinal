# Free deployment (Render + MongoDB Atlas) — no card needed, no seeding step

The app loads its demo data by itself the first time it starts on an empty database.

## 1. Free database (MongoDB Atlas)
1. Sign up at https://cloud.mongodb.com -> create a free **M0** cluster.
2. Database Access -> Add user (pick a username + password, remember them).
3. Network Access -> Add IP Address -> **Allow access from anywhere** (0.0.0.0/0).
4. Connect -> Drivers -> copy the string and edit it to look like:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/bookstore?retryWrites=true&w=majority`
   (real username/password, and `/bookstore` right before the `?`)

## 2. Put the code on GitHub (no git commands)
1. github.com -> New repository (name it bookstore, keep it Public or Private).
2. Click "uploading an existing file", drag in the CONTENTS of the extracted
   BookStoreProject-main folder (client, server, package.json, render.yaml ...), Commit.

## 3. Deploy on Render (free)
1. https://render.com -> sign up with GitHub -> New -> **Blueprint** -> select your repo.
2. Paste your Atlas string into `MONGO_URI` when asked -> Apply.
3. Wait ~5-10 min. Open the `https://bookstore-xxxx.onrender.com` link.

Demo logins: admin@bookstore.com / Admin@12345 · seller1@example.com / Seller@123 · user1@example.com / Password@123

## After your 2 days
Render dashboard -> your service -> Settings -> Delete. Atlas -> delete the cluster.

## Notes
- Free Render sleeps after ~15 min idle; first visit then takes 30-60 s.
- Uploaded images vanish on restart (books show auto-generated covers).
- To stop auto-loading demo data, add env var AUTO_SEED=false.
- Local dev unchanged: `npm run install-all` then `npm run dev`.
