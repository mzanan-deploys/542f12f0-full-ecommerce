import React from 'react';

export default function DefaultGridPreview() {
    return (
        <div className="w-32 h-24 p-1 border border-dashed border-muted-foreground/50 rounded-md">
            <div className="grid grid-cols-3 gap-1 h-full">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-muted rounded-sm"></div>
                ))}
            </div>
        </div>
    );
} 