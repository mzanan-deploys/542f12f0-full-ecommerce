'use client'

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { logoutUserAction } from "@/lib/actions/authActions";
import { useTransition } from "react";
import { ThemeToggle } from '@/components/shared/ThemeToggle/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';

export const AdminHeader = React.memo(function AdminHeader() {
    const [isPending, startTransition] = useTransition();
    const { sessionData, isLoading } = useAuth();

    const userName = sessionData?.name ?? 'Admin'; 
    const userEmail = sessionData?.email;
    const userAvatarUrl = sessionData?.avatarUrl ?? undefined;
    const userInitial = userName?.[0]?.toUpperCase() ?? 'A';

    const handleLogout = () => {
        startTransition(async () => {
            await logoutUserAction();
        });
    };

    return (
        <div className="flex h-16 items-center justify-between px-6 border-b bg-background">
            <div className="flex items-center">
                <SidebarTrigger className="mr-4" />
            </div>
            <div className="flex items-center space-x-4">
                <ThemeToggle />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full" disabled={isLoading}>
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={userAvatarUrl} alt={userName} />
                                <AvatarFallback>{userInitial}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{userName}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {userEmail}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} disabled={isPending} className="cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>{isPending ? 'Logging out...' : 'Log out'}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}); 