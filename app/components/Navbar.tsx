"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle, // Import SheetTitle
} from "@/components/ui/sheet";
import { ShoppingCart, Menu, User } from "lucide-react";
import { useCartStore } from "@/lib/store";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const { user, userRole, signOut } = useAuth();
  const pathname = usePathname();
  // const [userRole, setUserRole] = useState<string | null>(null);
  const { itemCount } = useCartStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Update cart count from local storage
  useEffect(() => {
    setCartCount(itemCount());
    const interval = setInterval(() => {
      setCartCount(itemCount());
    }, 500);
    return () => clearInterval(interval);
  }, [itemCount]);

  const hanleSignOut = async () => {
    try {
      const res = await signOut();
      if (!res.success) {
        throw new Error(res.error?.message || 'Sign out failed');
      }
      setIsMobileMenuOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getNavLinkClass = (path: string) => {
    const isActive =
      path === pathname ||
      (path !== '/' && pathname.startsWith(path));

    return `py-2 text-sm font-light transition-colors hover:text-black ${isActive ? 'text-black border-b-2 border-black' : 'text-gray-500'
      }`;
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 w-full">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="font-bold text-xl text-black">
          NaifBleu
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm">
          <Link href="/" className={getNavLinkClass('/')}>
            Home
          </Link>
          {/* Show regular nav for customers and guests */}
          {(!userRole || userRole === 'user') && (
            <>
              <Link href="/products" className={getNavLinkClass('/products')}>
                Products
              </Link>
              <Link href="/schools" className={getNavLinkClass('/schools')}>
                Schools
              </Link>
              <Link href="/contact" className={getNavLinkClass('/contact')}>
                Contact
              </Link>
            </>
          )}
          {/* Admin navigation */}
          {userRole === 'admin' && (
            <>
              <Link href="/dashboard/admin" className={getNavLinkClass('/dashboard/admin')}>
                Dashboard
              </Link>
              <Link href="/dashboard/admin/products" className={getNavLinkClass('/dashboard/admin/products')}>
                Products
              </Link>
              <Link href="/dashboard/admin/orders" className={getNavLinkClass('/dashboard/admin/orders')}>
                Orders
              </Link>
            </>
          )}
          {/* Warehouse navigation */}
          {userRole === 'warehouse' && (
            <>
              <Link href="/dashboard/warehouse" className={getNavLinkClass('/dashboard/warehouse')}>
                Dashboard
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Actions and Menu Trigger */}
        <div className="md:hidden flex items-center gap-3">
          {/* Cart icon - only show for regular users and guests */}
          {(!userRole || userRole === 'user') && (
            <Link href="/checkout/cart" className="relative">
              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs font-light rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
          )}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col border-l border-gray-200 w-full sm:max-w-sm">
              <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
              <div className="px-4 py-6">
                <Link href="/" className="font-bold text-xl text-black mb-6 block">
                  Naif Bleu
                </Link>
                <nav className="flex flex-col gap-4 mt-4">
                  <Link href="/" className="text-lg font-light py-2">
                    Home
                  </Link>
                  {/* Show regular nav for customers and guests */}
                  {(!userRole || userRole === 'user') && (
                    <>
                      <Link href="/products" className="text-lg font-light py-2">
                        Products
                      </Link>
                      <Link href="/about" className="text-lg font-light py-2">
                        About Us
                      </Link>
                      <Link href="/schools" className="text-lg font-light py-2">
                        Schools
                      </Link>
                      <Link href="/contact" className="text-lg font-light py-2">
                        Contact
                      </Link>
                    </>
                  )}
                  {/* Admin navigation */}
                  {userRole === 'admin' && (
                    <>
                      <Link href="/dashboard/admin" className="text-lg font-light py-2">
                        Dashboard
                      </Link>
                      <Link href="/dashboard/admin/products" className="text-lg font-light py-2">
                        Manage Products
                      </Link>
                      <Link href="/dashboard/admin/orders" className="text-lg font-light py-2">
                        Manage Orders
                      </Link>
                    </>
                  )}
                  {/* Warehouse navigation */}
                  {userRole === 'warehouse' && (
                    <>
                      <Link href="/dashboard/warehouse" className="text-lg font-light py-2">
                        Warehouse Dashboard
                      </Link>
                    </>
                  )}
                </nav>
              </div>
              <div className="mt-auto px-4 py-6">
                <div className="flex flex-col gap-2 mt-6">
                  {user ? (
                    <>
                      {userRole && (
                        <div className="mb-2 px-3 py-2 bg-gray-100 rounded text-xs text-center">
                          <span className="text-gray-500 uppercase font-medium">{userRole}</span>
                        </div>
                      )}
                      {(userRole === 'user' || !userRole) && (
                        <>
                          <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="outline" className="w-full justify-start border-black text-black hover:bg-black hover:text-white font-light">
                              <User className="mr-2 h-4 w-4" />
                              Profile
                            </Button>
                          </Link>
                          <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="outline" className="w-full justify-start border-black text-black hover:bg-black hover:text-white font-light">
                              My Orders
                            </Button>
                          </Link>
                        </>
                      )}
                      <Button
                        variant="outline"
                        className="w-full justify-start border-black text-black hover:bg-black hover:text-white font-light"
                        onClick={hanleSignOut}
                      >
                        Log out
                      </Button>
                    </>
                  ) : (
                    <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start border-black text-black hover:bg-black hover:text-white font-light">
                        <User className="mr-2 h-4 w-4" />
                        Sign in
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          {/* Cart icon - only show for regular users and guests */}
          {(!userRole || userRole === 'user') && (
            <Link href="/checkout/cart" className="relative">
              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs font-light rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ''} />
                    <AvatarFallback className="bg-black text-white">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border border-gray-200">
                <DropdownMenuLabel className="font-light">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-light leading-none">{user.user_metadata?.full_name || user.email}</p>
                    <p className="text-xs leading-none text-gray-500">{user.email}</p>
                    {userRole && (
                      <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded uppercase font-medium">
                        {userRole}
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200" />
                {/* Regular user menu items */}
                {(userRole === 'user' || !userRole) && (
                  <>
                    <DropdownMenuItem asChild className="font-light">
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="font-light">
                      <Link href="/orders">My Orders</Link>
                    </DropdownMenuItem>
                  </>
                )}
                {/* Admin menu items */}
                {userRole === 'admin' && (
                  <>
                    <DropdownMenuItem asChild className="font-light">
                      <Link href="/dashboard/admin">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="font-light">
                      <Link href="/dashboard/admin/products">Manage Products</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="font-light">
                      <Link href="/dashboard/admin/orders">Manage Orders</Link>
                    </DropdownMenuItem>
                  </>
                )}
                {/* Warehouse menu items */}
                {userRole === 'warehouse' && (
                  <>
                    <DropdownMenuItem asChild className="font-light">
                      <Link href="/dashboard/warehouse">Dashboard</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem onClick={hanleSignOut} className="font-light">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" className="border-black text-black hover:bg-black hover:text-white font-light text-sm">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}