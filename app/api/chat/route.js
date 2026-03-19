import { NextResponse } from "next/server";
import { getSupabase } from "../../../lib/supabase";

export async function POST(req) {
    try {
        const supabase = getSupabase();
        const body = await req.json();
        const userMessage = body.message;

        if (!process.env.ANTHROPIC_API_KEY) {
            return NextResponse.json(
                { error: "ANTHROPIC_API_KEY is missing" },
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

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: "claude-haiku-4-5-20251001",
                max_tokens: 1024,
                system:
                    "You are a strict business assistant.\n" +
                    "Rules:\n" +
                    "1) Answer ONLY using the knowledge base text below.\n" +
                    "2) Do NOT guess or invent details.\n" +
                    "3) If the answer is not explicitly in the knowledge base, reply: 'I don't have that information yet.'\n" +
                    "4) Keep answers short, professional and customer-friendly.\n\n" +
                    "Knowledge base:\n" +
                    knowledgeText,
                messages: [
                    { role: "user", content: userMessage }
                ],
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: "Anthropic error", details: result },
                { status: 500 }
            );
        }

        const reply = result?.content?.[0]?.text;

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
