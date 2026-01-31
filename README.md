# Chatbot MVP

Minimal production-ready chatbot application with database-backed responses and server-side API architecture.

Live Demo: https://ai-chatbot-seven-pink-63.vercel.app/

---

## Features

- Real-time chat interface  
- Database-driven responses  
- Server-side API routing  
- Secure environment variable handling  
- Dark / Light mode toggle  
- Responsive layout  

---

## Tech Stack

- Next.js  
- Supabase  
- OpenAI API  
- Tailwind CSS  
- Vercel  

---

## Architecture Overview

- Client sends message to API route  
- Server fetches related data from database  
- Context is processed and response is generated  
- Result is returned to the client  

All sensitive logic runs on the server side.

---

## Environment Setup

Create a `.env.local` file in the project root:

