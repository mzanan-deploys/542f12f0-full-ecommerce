import React from 'react';

export default function TwoHorizontalPreview() {
    return (
        <div className="flex flex-col justify-center w-32 h-24 p-1 border border-dashed border-muted-foreground/50 rounded-md gap-1">
             {/* Top horizontal rectangle */}
             <div className="preview-element w-full h-2/5 bg-muted rounded-sm group-hover:bg-accent-foreground"></div>
             {/* Bottom horizontal rectangle */}
             <div className="preview-element w-full h-2/5 bg-muted rounded-sm group-hover:bg-accent-foreground"></div>
        </div>
    );
} 