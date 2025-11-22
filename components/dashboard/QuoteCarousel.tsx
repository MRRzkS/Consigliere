'use client';
import { useState, useEffect } from 'react';

const quotes = [
    "I'm going to make him an offer he can't refuse.",
    "Great men are not born great, they grow great.",
    "Never hate your enemies. It affects your judgment.",
    "A man who doesn't spend time with his family can never be a real man.",
    "Revenge is a dish best served cold.",
    "Finance is a gun. Politics is knowing when to pull the trigger.",
    "I don't like violence, Tom. I'm a businessman. Blood is a big expense.",
    "Keep your friends close, but your enemies closer.",
    "Never let anyone know what you are thinking.",
    "It's not personal, Sonny. It's strictly business."
];

export default function QuoteCarousel() {
    const [index, setIndex] = useState(0);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            setOpacity(0); // Fade out
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % quotes.length);
                setOpacity(1); // Fade in
            }, 500); // CSS transition duration
        }, 15000); // Change every 15 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-3xl mx-auto text-center py-8 px-4">
            <p
                className="text-xl md:text-2xl font-serif italic text-[#c5a059] transition-opacity duration-500 ease-in-out"
                style={{ opacity: opacity }}
            >
                &ldquo;{quotes[index]}&rdquo;
            </p>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-zinc-700 to-transparent mx-auto mt-4"></div>
        </div>
    );
}
