import { NextResponse } from "next/server";
import { getSupabase } from "../../../lib/supabase";


export async function POST(req) {

    try {
        const supabase = getSupabase();

        const body = await req.json();
        const userMessage = body.message;

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OPENAI_API_KEY is missing in .env.local" },
                { status: 500 }
            );
        }

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            return NextResponse.json(
                { error: "Supabase env vars are missing in .env.local" },
                { status: 500 }
            );
        }

        const { data, error: supaError } = await supabase
            .from("knowledge_base")
            .select("title, content");

        if (supaError) {
            return NextResponse.json(
                { error: "Supabase error", details: supaError.message },
                { status: 500 }
            );
        }

        const knowledgeText = (data || [])
            .map((item) => `- ${item.title}: ${item.content}`)
            .join("\n");

        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a strict business assistant.\n" +
                            "Rules:\n" +
                            "1) Answer ONLY using the knowledge base text below.\n" +
                            "2) Do NOT guess or invent details.\n" +
                            "3) If the answer is not explicitly in the knowledge base, reply: 'I don’t have that information yet. Please contact support or ask about memberships, hours, pricing, or training.'\n" +
                            "4) When you give times, prices, or numbers, copy them exactly as written.\n\n" +
                            "Knowledge base:\n" +
                            "5) Keep answers short, professional and customer-friendly.\n\n" +
                            knowledgeText,

                    },
                    { role: "user", content: userMessage },
                ],

                temperature: 0,
            }),
        });

        const result = await openaiResponse.json();

        if (!openaiResponse.ok) {
            return NextResponse.json(
                {
                    error: "OpenAI error",
                    status: openaiResponse.status,
                    details: result,
                },
                { status: 500 }
            );
        }

        const reply = result?.choices?.[0]?.message?.content;

        if (!reply) {
            return NextResponse.json(
                { error: "No reply from model", details: result },
                { status: 500 }
            );
        }

        return NextResponse.json({ reply });
    } catch (error) {
        return NextResponse.json(
            { error: "Server error", details: String(error) },
            { status: 500 }
        );
    }
}
