import { NextResponse } from "next/server";
import { getSupabase } from "../../../lib/supabase";

export async function POST(req) {
    try {
        const supabase = getSupabase();
        const body = await req.json();
        const userMessage = body.message;

        if (!process.env.GOOGLE_API_KEY) {
            return NextResponse.json(
                { error: "GOOGLE_API_KEY is missing" },
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

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text:
                                        "You are a strict business assistant.\n" +
                                        "Rules:\n" +
                                        "1) Answer ONLY using the knowledge base text below.\n" +
                                        "2) Do NOT guess or invent details.\n" +
                                        "3) If the answer is not in the knowledge base, reply: 'I don't have that information yet.'\n" +
                                        "4) Keep answers short, professional and customer-friendly.\n\n" +
                                        "Knowledge base:\n" +
                                        knowledgeText +
                                        "\n\nUser question: " +
                                        userMessage,
                                },
                            ],
                        },
                    ],
                }),
            }
        );

        const result = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: "Google API error", details: result },
                { status: 500 }
            );
        }

        const reply = result?.candidates?.[0]?.content?.parts?.[0]?.text;

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
