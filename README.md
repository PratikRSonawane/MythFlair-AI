# MythFlair AI — Multi-Modal Creative Studio

<p align="center">
  Turn ideas into visuals, voice, and AI-powered creativity.
</p>

<p align="center">
  <a href="https://ai.mythflair.com/">🌐 Live Demo</a> •
  <a href="https://github.com/PratikRSonawane/MythFlair-AI">📂 Repository</a>
</p>

---

## 🚀 About MythFlair AI

MythFlair AI is a full-stack AI creative platform designed to simplify content creation through intelligent workflows.

The platform enables users to generate AI-powered images, explore voice-based creativity, and experience an evolving multi-modal environment for digital content generation.

Built with scalability, usability, and modern web performance in mind, MythFlair combines powerful AI capabilities with an intuitive user experience.

### ✨ Key Features

* 🎨 AI-powered image generation
* 🎙️ Voice generation workflows
* ⚡ Fast and responsive UI
* 🔐 Secure authentication (admin-protected routes)
* ☁️ Production deployment
* 🧠 Open-source / API-based AI model integrations

---

## 🖼️ Screenshots

### Landing Page

assets/screenshots/homepage.png

### Image Generation

assets/screenshots/image.png

### Chating Studio

assets/screenshots/chat.png

---

## 🛠️ Tech Stack

### Frontend

* Next.js (React)
* Tailwind CSS
* TypeScript

### Backend / API

* Next.js API Routes
* Supabase (Auth/User session)
* Bytez.js (image generation)

### AI & APIs

* AI Model Integrations
* REST APIs

### Deployment

* Vercel / Cloud Hosting

---

## 🔐 Environment Variables

Create a `.env.local` file and add the required variables for authentication and image generation:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

ADMIN_EMAIL=your_admin_email

BYTEZ_API_KEY=your_bytez_api_key
```

---

## 🧩 Admin Image Generation API

Admin image generation is protected and available at:

**POST** `/api/admin/generate-image`

### Auth
Send a Supabase session/JWT in the header:

```http
Authorization: Bearer <token>
```

### Body
```json
{
  "prompt": "A futuristic city at sunset",
  "stylePromptAdd": "cinematic, ultra-detailed",
  "modelId": "your_bytez_model_id"
}
```

- `prompt` (required, string)
- `stylePromptAdd` (optional, string)
- `modelId` (required, string)

### Success Response
**200**
```json
{
  "imageUrl": "https://.../generated-image.png"
}
```

### Errors (common)
* **400** — missing `prompt` / `modelId`
* **401** — missing/invalid token/session
* **403** — user is not admin (`ADMIN_EMAIL` mismatch)
* **405** — method not allowed
* **500** — image generation failure / unexpected error

### Example (curl)
```bash
curl -X POST "http://localhost:3000/api/admin/generate-image" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_TOKEN" \
  -d '{
    "prompt": "A cute robot reading a book",
    "stylePromptAdd": "3D, soft lighting",
    "modelId": "YOUR_MODEL_ID"
  }'
```

---

## 🚀 Run Locally

```bash
git clone https://github.com/PratikRSonawane/MythFlair-AI.git
cd MythFlair-AI

npm install
npm run dev
```

Open: http://localhost:3000

---

## 🌍 Live Demo

https://ai.mythflair.com/

---

## 📌 Roadmap

* [ ] Advanced creative workflows
* [ ] Video generation
* [ ] More customization options
* [ ] Improved personalization

---

## 🤝 Contributing

Contributions, ideas, and feedback are welcome.

---

## 📄 License

MIT License
