"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Menu, User } from "lucide-react";
import { useCartStore } from "@/lib/store";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const { itemCount } = useCartStore();

  // Update cart count from local storage
  useEffect(() => {
    // Update cart count directly from the itemCount function
    setCartCount(itemCount());
    
    // Set up interval to check for changes
    const interval = setInterval(() => {
      setCartCount(itemCount());
    }, 500);
    
    // Cleanup
    return () => clearInterval(interval);
  }, [itemCount]);

  // Get user role
  useEffect(() => {
    async function getUserRole() {
      if (!user) {
        setUserRole(null);
        return;
      }

      try {
        const { data, error } = await fetch('/api/user/role').then(res => res.json());
        if (error) throw error;
        setUserRole(data?.role || null);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    }

    getUserRole();
  }, [user]);

  const getNavLinkClass = (path: string) => {
    const isActive = 
      path === pathname || 
      (path !== '/' && pathname.startsWith(path));
    
    return `py-2 text-sm font-medium transition-colors hover:text-primary ${
      isActive ? 'text-black border-b-2 border-blue-600' : 'text-gray-500'
    }`;
  };

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="font-bold text-xl text-blue-600">
          Naif Bleu
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className={getNavLinkClass('/')}>
            Home
          </Link>
          <Link href="/products" className={getNavLinkClass('/products')}>
            Products
          </Link>
          <Link href="/schools" className={getNavLinkClass('/schools')}>
            Schools
          </Link>
          <Link href="/contact" className={getNavLinkClass('/contact')}>
            Contact
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/checkout/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ''} />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/orders">Orders</Link>
                </DropdownMenuItem>
                {userRole === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                {userRole === 'warehouse' && (
                  <DropdownMenuItem asChild>
                    <Link href="/warehouse">Warehouse Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col">
            <div className="px-2">
              <Link href="/" className="font-bold text-xl text-blue-600 mb-6 block">
                Naif Bleu
              </Link>
              <nav className="flex flex-col gap-4 mt-4">
                <Link href="/" className="text-lg font-medium py-2">
                  Home
                </Link>
                <Link href="/products" className="text-lg font-medium py-2">
                  Products
                </Link>
                <Link href="/schools" className="text-lg font-medium py-2">
                  Schools
                </Link>
                <Link href="/contact" className="text-lg font-medium py-2">
                  Contact
                </Link>
              </nav>
            </div>
            <div className="mt-auto px-2 pb-8">
              <div className="flex flex-col gap-2 mt-6">
                <Link href="/checkout/cart">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Cart {cartCount > 0 && `(${cartCount})`}
                  </Button>
                </Link>
                {user ? (
                  <>
                    <Link href="/profile">
                      <Button variant="outline" className="w-full justify-start">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                    <Button 
                      variant="destructive" 
                      className="w-full" 
                      onClick={() => signOut()}
                    >
                      Log out
                    </Button>
                  </>
                ) : (
                  <Button asChild className="w-full">
                    <Link href="/sign-in">Sign in</Link>
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
} 