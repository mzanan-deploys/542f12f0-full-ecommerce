'use client'

import React from 'react';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { 
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
} from "@/components/ui/sidebar";
import { 
    LayoutDashboard, 
    Package, 
    Ruler,
    ShapesIcon,
    ImageIcon,
    LayoutList,
    Tag,
    ShieldCheck,
    Truck as ShippingIcon,
    CreditCard,
    Camera
} from 'lucide-react';

const sidebarNavItems = [
   { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
   { title: "Shipping Prices", href: "/admin/shipping-prices", icon: ShippingIcon },
   { title: "Stripe Sync", href: "/admin/stripe-sync", icon: CreditCard },
   { title: "Sets", href: "/admin/sets", icon: LayoutList },
   { title: "Size Guides", href: "/admin/size-guides", icon: Ruler },
   { title: "Product Categories", href: "/admin/categories", icon: ShapesIcon },
   { title: "Products", href: "/admin/products", icon: Package },
   { title: "Hero Image", href: "/admin/hero-settings", icon: Camera, group: "Settings" },
   { title: "Homepage Layout", href: "/admin/home-design", icon: ImageIcon },
   { title: "Disclaimer", href: "/admin/disclaimer", icon: ShieldCheck, group: "Settings" },
   { title: "About Section", href: "/admin/about", icon: Tag, group: "Settings" },
];

export const AdminSidebar = React.memo(function AdminSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon" className='px-4 group-data-[state=collapsed]:px-2'>
            <SidebarHeader className='bg-card'>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild size="lg" className='px-0'>
                            <Link href="/admin/dashboard" prefetch={true}>
                                <div className="flex aspect-square size-8 items-center justify-center">
                                    <Package className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight group-data-[state=collapsed]:hidden">
                                    <span className="truncate font-semibold">Admin Panel</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            
            <SidebarContent className='bg-card'>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {sidebarNavItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton 
                                        asChild 
                                        isActive={pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))}
                                    >
                                        <Link href={item.href} prefetch={true}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}); 