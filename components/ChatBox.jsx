"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function ChatBox() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        {
            role: "bot",
            text: "Hi! I’m your gym assistant. Ask me about memberships, hours, pricing, location, or personal training.",
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const [theme, setTheme] = useState("light"); // "light" | "dark"
    const listRef = useRef(null);

    const canSend = useMemo(() => {
        return message.trim().length > 0 && !isLoading;
    }, [message, isLoading]);

    // Load theme from localStorage
    useEffect(() => {
        const saved = window.localStorage.getItem("chat_theme");
        if (saved === "dark" || saved === "light") {
            setTheme(saved);
        }
    }, []);

    // Save theme
    useEffect(() => {
        window.localStorage.setItem("chat_theme", theme);
    }, [theme]);

    // Auto-scroll
    useEffect(() => {
        if (!listRef.current) return;
        listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages, isLoading]);

    function toggleTheme() {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    }

    function resetChat() {
        if (isLoading) return;
        setMessages([
            {
                role: "bot",
                text: "Hi! I’m your gym assistant. Ask me about memberships, hours, pricing, location, or personal training.",
            },
        ]);
        setMessage("");
    }

    async function handleSend(customText) {
        const textToSend = typeof customText === "string" ? customText : message;
        const trimmed = textToSend.trim();
        if (!trimmed) return;
        if (isLoading) return;

        const newUserMessage = { role: "user", text: trimmed };

        const updatedMessages = [];
        for (let i = 0; i < messages.length; i++) {
            updatedMessages.push(messages[i]);
        }
        updatedMessages.push(newUserMessage);

        setMessages(updatedMessages);
        setMessage("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: trimmed }),
            });

            const data = await res.json();

            const botReplyText =
                data && data.reply
                    ? data.reply
                    : data && data.error
                        ? `${data.error}${data.details ? " — " + data.details : ""}`
                        : "No reply received.";

            const botMessage = { role: "bot", text: botReplyText };

            const finalMessages = [];
            for (let j = 0; j < updatedMessages.length; j++) {
                finalMessages.push(updatedMessages[j]);
            }
            finalMessages.push(botMessage);

            setMessages(finalMessages);
        } catch (err) {
            const errorMessage = {
                role: "bot",
                text: "Something went wrong. Please try again.",
            };

            const finalMessages = [];
            for (let k = 0; k < updatedMessages.length; k++) {
                finalMessages.push(updatedMessages[k]);
            }
            finalMessages.push(errorMessage);

            setMessages(finalMessages);
        } finally {
            setIsLoading(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    const suggestions = [
        "What are your opening hours?",
        "How much is membership?",
        "Do you offer personal training?",
        "Do you have a free trial?",
    ];

    const isDark = theme === "dark";

    // Theme classes (no Tailwind config needed)
    const pageBg = isDark
        ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0B0F19] via-[#070A12] to-black"
        : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-white to-white";

    const cardBg = isDark ? "bg-[#0E1424] border-white/10" : "bg-white border-gray-200";
    const headerBg = isDark
        ? "bg-gradient-to-r from-white/10 to-white/5 border-white/10"
        : "bg-gradient-to-r from-black to-gray-800 border-gray-200";

    const headerText = isDark ? "text-white" : "text-white";
    const subText = isDark ? "text-white/70" : "text-white/70";

    const bodyBg = isDark ? "bg-[#0E1424]" : "bg-white";

    const botBubble = isDark
        ? "bg-white/5 text-white border-white/10"
        : "bg-gray-50 text-gray-900 border-gray-200";

    const userBubble = isDark
        ? "bg-white text-black border-white"
        : "bg-black text-white border-black";

    const inputBg = isDark
        ? "bg-black/20 border-white/10 text-white placeholder:text-white/40"
        : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400";
    const inputRing = isDark ? "focus:ring-white/10 focus:border-white/20" : "focus:ring-black/10 focus:border-black/30";

    const hintText = isDark ? "text-white/55" : "text-gray-500";
    const smallText = isDark ? "text-white/40" : "text-gray-400";

    const chip = isDark
        ? "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
        : "bg-white/10 border-white/15 text-white/85 hover:bg-white/15";

    const chipDarkOnLightHeader = "bg-white/10 border-white/15 text-white/85 hover:bg-white/15";

    const topButton = isDark
        ? "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
        : "bg-white/10 border-white/15 text-white/85 hover:bg-white/15";

    return (
        <div className={`min-h-screen w-full flex items-center justify-center p-6 ${pageBg}`}>
            <div className={`w-full max-w-2xl border rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden ${cardBg}`}>
                {/* Header */}
                <div className={`p-4 sm:p-5 border-b ${headerBg}`}>
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-white/10 border border-white/10" : "bg-white/10 border border-white/15"}`}>
                                <span className="text-sm font-semibold text-white">AI</span>
                            </div>
                            <div>
                                <h1 className={`text-lg sm:text-xl font-semibold tracking-tight ${headerText}`}>
                                    Gym Support Chatbot
                                </h1>
                                <p className={`text-xs sm:text-sm mt-0.5 ${subText}`}>
                                    Accurate answers from your Supabase knowledge base
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full border ${isDark ? "bg-white/5 border-white/10 text-white/75" : "bg-white/10 border-white/15 text-white/85"}`}>
                                {isLoading ? "Responding…" : "Online"}
                            </span>

                            <button
                                onClick={toggleTheme}
                                disabled={isLoading}
                                className={`text-xs px-2 py-1 rounded-full border ${topButton} disabled:opacity-50`}
                                title="Toggle theme"
                            >
                                {isDark ? "Light" : "Dark"}
                            </button>

                            <button
                                onClick={resetChat}
                                disabled={isLoading}
                                className={`text-xs px-2 py-1 rounded-full border ${topButton} disabled:opacity-50`}
                                title="Clear chat"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Suggestions */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {suggestions.map((s) => (
                            <button
                                key={s}
                                disabled={isLoading}
                                onClick={() => handleSend(s)}
                                className={`text-xs px-3 py-1.5 rounded-full border ${isDark ? chip : chipDarkOnLightHeader} disabled:opacity-50`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Messages */}
                <div ref={listRef} className={`p-4 sm:p-5 h-[480px] overflow-y-auto ${bodyBg}`}>
                    <div className="space-y-4">
                        {messages.map((m, idx) => {
                            const isUser = m.role === "user";

                            return (
                                <div
                                    key={idx}
                                    className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
                                >
                                    {!isUser ? (
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? "bg-white/5 border border-white/10" : "bg-gray-100 border border-gray-200"}`}>
                                            <span className={`text-xs font-semibold ${isDark ? "text-white/80" : "text-gray-700"}`}>
                                                AI
                                            </span>
                                        </div>
                                    ) : null}

                                    <div className={`max-w-[82%] ${isUser ? "text-right" : ""}`}>
                                        <div
                                            className={`inline-block px-4 py-2.5 rounded-2xl text-sm leading-relaxed border shadow-[0_1px_0_rgba(0,0,0,0.02)] ${isUser ? userBubble : botBubble
                                                }`}
                                        >
                                            {m.text}
                                        </div>
                                        <div className={`mt-1 text-[11px] ${smallText}`}>
                                            {isUser ? "You" : "Assistant"}
                                        </div>
                                    </div>

                                    {isUser ? (
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? "bg-white text-black border border-white" : "bg-black text-white border border-black"}`}>
                                            <span className="text-xs font-semibold">U</span>
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}

                        {/* Typing */}
                        {isLoading ? (
                            <div className="flex items-end gap-2 justify-start">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? "bg-white/5 border border-white/10" : "bg-gray-100 border border-gray-200"}`}>
                                    <span className={`text-xs font-semibold ${isDark ? "text-white/80" : "text-gray-700"}`}>AI</span>
                                </div>

                                <div className="max-w-[82%]">
                                    <div className={`inline-flex items-center gap-1 px-4 py-2.5 rounded-2xl text-sm border ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}>
                                        <span className={`inline-block w-2 h-2 rounded-full ${isDark ? "bg-white/50" : "bg-gray-400"} animate-bounce`} />
                                        <span className={`inline-block w-2 h-2 rounded-full ${isDark ? "bg-white/50" : "bg-gray-400"} animate-bounce [animation-delay:120ms]`} />
                                        <span className={`inline-block w-2 h-2 rounded-full ${isDark ? "bg-white/50" : "bg-gray-400"} animate-bounce [animation-delay:240ms]`} />
                                    </div>
                                    <div className={`mt-1 text-[11px] ${smallText}`}>Assistant</div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Input */}
                <div className={`p-4 sm:p-5 border-t ${isDark ? "border-white/10 bg-[#0E1424]" : "border-gray-200 bg-white"}`}>
                    <div className="flex gap-2 items-end">
                        <div className="flex-1">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={2}
                                placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                                className={`w-full resize-none rounded-xl p-3 text-sm outline-none border ${inputBg} ${inputRing}`}
                            />
                            <div className="flex items-center justify-between mt-2">
                                <p className={`text-xs ${hintText}`}>
                                    Tips: hours, pricing, trial, training, location.
                                </p>
                                <p className={`text-xs ${smallText}`}>
                                    Secure API • Supabase KB
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => handleSend()}
                            disabled={!canSend}
                            className={`h-[44px] px-4 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed ${isDark
                                ? "bg-white text-black"
                                : "bg-black text-white"
                                }`}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
