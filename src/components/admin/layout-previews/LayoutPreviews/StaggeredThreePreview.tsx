import React from 'react';

export default function StaggeredThreePreview() {
    return (
        <div className="flex justify-center w-32 h-24 p-1 border border-dashed border-muted-foreground/50 rounded-md gap-1 items-start overflow-hidden">
             {/* Left (Highest) */}
             <div className="preview-element w-1/4 h-3/5 bg-muted rounded-sm group-hover:bg-accent-foreground mt-0"></div>
             {/* Middle (Lower) */}
             <div className="preview-element w-1/4 h-3/5 bg-muted rounded-sm group-hover:bg-accent-foreground mt-5"></div>
             {/* Right (Lowest) */}
             <div className="preview-element w-1/4 h-3/5 bg-muted rounded-sm group-hover:bg-accent-foreground mt-8.5"></div>
        </div>
    );
} 