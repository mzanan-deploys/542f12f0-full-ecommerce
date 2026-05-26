import React from 'react';

export default function SingleColumnPreview() {
    return (
        <div className="w-32 h-24 p-1 border border-dashed border-muted-foreground/50 rounded-md flex justify-center items-center">
            <div className="preview-element w-3/4 h-3/4 bg-muted rounded-sm group-hover:bg-accent-foreground"></div>
        </div>
    );
} 