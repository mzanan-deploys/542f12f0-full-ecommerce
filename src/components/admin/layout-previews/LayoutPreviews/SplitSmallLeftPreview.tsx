import React from 'react';

export default function VerticalSplitPreview() {
    return (
        <div className="flex justify-center w-32 h-24 p-1 border border-dashed border-muted-foreground/50 rounded-md gap-1 items-start">
             {/* Left Column (Small) */}
             <div className="preview-element w-1/3 h-3/5 bg-muted rounded-sm group-hover:bg-accent-foreground"></div>
             {/* Right Column (Tall) */}
             <div className="preview-element w-2/5 h-4/5 bg-muted rounded-sm group-hover:bg-accent-foreground flex self-end"></div>
        </div>
    );
} 