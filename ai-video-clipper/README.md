# 🎬 AI Video Clipper Pro

A professional AI-powered video clipping application built with React, Node.js, PostgreSQL, and integrated with Whop for seamless monetization.

## 🚀 Features

✅ **User Authentication** - Secure login and registration
✅ **Video Upload** - Easy drag-and-drop video uploads
✅ **Smart Clip Creation** - Create unlimited clips from videos
✅ **Multiple Export Qualities** - 480p, 1080p, 4K
✅ **Whop Integration** - Complete monetization with subscriptions
✅ **Tiered Pricing** - Free, Starter, Pro plans
✅ **Real Database** - PostgreSQL for persistent storage
✅ **Responsive Design** - Works on desktop and mobile

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, CSS3
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL
- **Monetization:** Whop
- **Deployment:** Docker, Heroku

## 📦 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

## 🌐 API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/videos/upload` - Upload video
- `GET /api/videos/:userId` - Get user videos
- `DELETE /api/videos/:videoId` - Delete video
- `POST /api/clips/create` - Create clip
- `GET /api/clips/:videoId` - Get clips for video
- `DELETE /api/clips/:clipId` - Delete clip
- `GET /api/whop/subscription/:userId` - Get subscription status
- `POST /api/whop/webhook` - Whop webhook handler

## 💳 Pricing Plans

**Free** - $0/month
- 5 video uploads
- 10 clips per video
- 480p exports

**Starter** - $9.99/month
- Unlimited video uploads
- 50 clips per video
- 1080p exports
- Email support

**Pro** - $29.99/month
- Unlimited everything
- AI-powered clipping
- 4K exports
- Priority support

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_video_clipper
WHOP_API_KEY=apik_Z4btjPimS550T_A2028413_C_fe062ca0d91c1122aeaf3798c97985c57cec60f3cde1c57aea329eb9da760d
NEXT_PUBLIC_WHOP_APP_ID=app_AuH878MzcUkyUQ
WHOP_WEBHOOK_SECRET=your_secret
NODE_ENV=development
```

## 🐳 Docker Deployment

```bash
docker-compose up --build
```

Access the app at http://localhost:3000

## 📊 Database Schema

- **users** - User accounts and authentication
- **videos** - Uploaded videos
- **clips** - Video clips created by users
- **subscriptions** - User subscription information
- **payments** - Payment records from Whop

## 🔐 Security

- Password hashing with SHA256
- CORS protection enabled
- File type validation for uploads
- Whop webhook signature verification
- PostgreSQL parameterized queries for SQL injection prevention

## 📈 Whop Integration

The app is fully integrated with Whop for monetization:

- Subscription webhooks handled
- Payment tracking
- Plan limit enforcement
- Automatic user creation from Whop subscriptions

## 🚀 Deployment

### Deploy to Heroku

```bash
heroku create your-app-name
git push heroku ai-video-clipper:main
heroku config:set WHOP_API_KEY=your_key
```

### Deploy Frontend to Vercel

```bash
cd frontend
vercel
```

## 📝 License

MIT License - feel free to use for personal or commercial projects

## 👥 Support

For issues or questions:
- 📧 Email: support@aivideoclipperpro.com
- 🐛 GitHub Issues: [Create an issue](https://github.com/AsterKujtila/AsterInc/issues)
- 💬 Discussions: [Join our community](https://github.com/AsterKujtila/AsterInc/discussions)

---

**Made with ❤️ by AsterKujtila**
**Powered by Whop - The Creator Commerce Platform**