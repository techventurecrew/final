import React from "react";

/**
 * PhotoBoothFrames
 *
 * Props:
 * - photos: string[]  // array of 1–4 photo URLs
 *
 * If less than 4 photos are passed, remaining frames will show a placeholder.
 */
const FRAME_BG_COLORS = [
    "bg-sky-200",
    "bg-pink-200",
    "bg-amber-200",
    "bg-rose-200",
];

const INNER_BG_COLORS = [
    "bg-sky-50",
    "bg-pink-50",
    "bg-amber-50",
    "bg-rose-50",
];

const PhotoBoothFrames = ({ photos = [] }) => {
    const getPhoto = (index) => photos[index] || null;

    return (
        <div className="w-full  max-w-3xl mx-auto p-4 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((i) => (
                    <FrameCard
                        key={i}
                        frameIndex={i}
                        photoUrl={getPhoto(i)}
                        frameBg={FRAME_BG_COLORS[i]}
                        innerBg={INNER_BG_COLORS[i]}
                    />
                ))}
            </div>
        </div>
    );
};

const FrameCard = ({ frameIndex, photoUrl, frameBg, innerBg }) => {
    return (
        <div
            className='relative rounded-3xl ${frameBg} h-[50vh] shadow-md overflow-hidden aspect-[4 / 3] flex items-center justify-center p-3
'
        >
            {/* Inner white/photo area */}
            < div
                className=' relative w-full h-full rounded-2xl ${innerBg} flex items-center justify-center overflow-hidden'
            >
                {
                    photoUrl ? (
                        <img
                            src={photoUrl}
                            alt="Captured"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-xs sm:text-sm text-slate-400 font-medium">
                            Drop photo here
                        </span>
                    )}
            </div >

            {/* Decorative elements – simple shapes & emojis so it looks playful */}
            {frameIndex === 0 && <FrameDecorTopLeft />}
            {frameIndex === 1 && <FrameDecorTopRight />}
            {frameIndex === 2 && <FrameDecorBottomLeft />}
            {frameIndex === 3 && <FrameDecorBottomRight />}
        </div >
    );
};

// Top‑left blue frame: sun, cloud, butterfly style
const FrameDecorTopLeft = () => (
    <>
        <div className="absolute -top-2 -right-2 flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-yellow-300 flex items-center justify-center text-sm">
                ☀
            </div>
            <div className="w-10 h-6 rounded-full bg-sky-100" />
        </div>
        <div className="absolute -bottom-2 -left-3 flex items-center gap-1">
            <div className="w-10 h-6 rounded-full bg-sky-100" />
            <div className="w-10 h-8 rounded-2xl border border-pink-300 flex items-center justify-center text-xs bg-pink-100">
                🦋
            </div>
        </div>
    </>
);

// Top‑right pink frame: cat + flowers
const FrameDecorTopRight = () => (
    <>
        <div className="absolute -bottom-1 left-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-orange-200 flex items-center justify-center text-sm">
                🐱
            </div>
            <div className="flex gap-1">
                <FlowerDot />
                <FlowerDot />
            </div>
        </div>
        <div className="absolute -top-1 right-4 w-8 h-6 rounded-full bg-sky-100" />
    </>
);

// Bottom‑left yellow frame: heart, cake style
const FrameDecorBottomLeft = () => (
    <>
        <div className="absolute -top-1 left-3 flex items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-pink-200 flex items-center justify-center text-sm">
                💖
            </div>
            <div className="w-10 h-6 rounded-full bg-sky-100" />
        </div>
        <div className="absolute -bottom-2 right-3 flex items-center gap-2">
            <div className="w-9 h-7 rounded-xl bg-pink-100 border border-pink-300 flex items-center justify-center text-[10px]">
                🎂
            </div>
            <div className="w-9 h-8 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-xs">
                😺
            </div>
        </div>
    </>
);

// Bottom‑right soft pink frame: cat + stars
const FrameDecorBottomRight = () => (
    <>
        <div className="absolute -bottom-1 right-3 flex items-center gap-2">
            <div className="w-8 h-10 rounded-2xl bg-orange-200 flex items-center justify-center text-lg">
                🐈
            </div>
            <div className="flex gap-1">
                <StarDot />
                <StarDot />
            </div>
        </div>
        <div className="absolute -top-1 left-4 flex items-center gap-1">
            <div className="w-10 h-6 rounded-full bg-sky-100" />
            <div className="w-5 h-5 rounded-full bg-pink-200 flex items-center justify-center text-xs">
                ⭐
            </div>
        </div>
    </>
);

const FlowerDot = () => (
    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-[10px]">
        🌼
    </div>
);

const StarDot = () => (
    <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-[10px]">
        ✨
    </div>
);

export default PhotoBoothFrames;