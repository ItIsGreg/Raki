"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User, Menu, X, ChevronDown, Plus, HardDrive, Cloud, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigationWithLoading } from "@/hooks/useNavigationWithLoading";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TopNavbarProps {
  className?: string;
}

const navigationItems = [
  {
    name: "Home",
    href: "/home",
  },
  {
    name: "Datapoint Extraction",
    href: "/dataPointExtraction",
  },
  {
    name: "Text Segmentation",
    href: "/textSegmentation",
  },
  {
    name: "Help",
    href: "/help",
    submenu: [
      {
        name: "Tutorial",
        href: "/help/tutorial",
      },
      {
        name: "Contact",
        href: "/help/contact",
      },
    ],
  },
];

export default function TopNavbar({ className }: TopNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState("local");
  const [storages, setStorages] = useState([
    { id: "local", name: "Local", type: "local" },
  ]);
  const [newStorageName, setNewStorageName] = useState("");
  const [newStorageType, setNewStorageType] = useState("local");
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { navigateWithLoading } = useNavigationWithLoading();

  const isActive = (href: string) => {
    if (href === "/home") {
      return pathname === "/home" || pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const isSubmenuActive = (submenu: any[]) => {
    return submenu.some(item => pathname.startsWith(item.href));
  };

  const handleAddStorage = () => {
    if (newStorageName.trim()) {
      const newStorage = {
        id: `storage_${Date.now()}`,
        name: newStorageName.trim(),
        type: newStorageType,
      };
      setStorages([...storages, newStorage]);
      setSelectedStorage(newStorage.id);
      setNewStorageName("");
      setNewStorageType("local");
      setIsStorageModalOpen(false);
    }
  };

  const handleCloseStorageModal = () => {
    setIsStorageModalOpen(false);
    setNewStorageName("");
    setNewStorageType("local");
    
    // Ensure body styles are cleaned up
    setTimeout(() => {
      document.body.removeAttribute("data-scroll-locked");
      document.body.style.pointerEvents = "";
      document.body.style.overflow = "";
    }, 100);
  };

  const getStorageIcon = (type: string) => {
    return type === "local" ? <HardDrive className="w-4 h-4" /> : <Cloud className="w-4 h-4" />;
  };

  const getCurrentStorage = () => {
    return storages.find(s => s.id === selectedStorage) || storages[0];
  };

  const handleSignInClick = () => {
    if (isAuthenticated) {
      logout();
    } else {
      navigateWithLoading("/auth");
    }
  };

  return (
    <nav className={cn("bg-white shadow-lg border-b", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/home" className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Raki</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navigationItems.map((item) => (
                item.submenu ? (
                  <DropdownMenu key={item.name}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          isSubmenuActive(item.submenu)
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        )}
                      >
                        {item.name}
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {item.submenu.map((subItem) => (
                        <DropdownMenuItem 
                          key={subItem.name}
                          onClick={() => navigateWithLoading(subItem.href)}
                          className={cn(
                            "w-full cursor-pointer",
                            isActive(subItem.href)
                              ? "bg-blue-100 text-blue-700"
                              : ""
                          )}
                        >
                          {subItem.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    key={item.name}
                    variant="ghost"
                    onClick={() => navigateWithLoading(item.href)}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    {item.name}
                  </Button>
                )
              ))}
            </div>
          </div>

          {/* Right side - Storage and Sign In */}
          <div className="hidden md:flex items-center gap-4">
            {/* Storage Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  {getStorageIcon(getCurrentStorage().type)}
                  {getCurrentStorage().name}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {storages.map((storage) => (
                  <DropdownMenuItem
                    key={storage.id}
                    onClick={() => setSelectedStorage(storage.id)}
                    className={cn(
                      "flex items-center gap-2",
                      selectedStorage === storage.id && "bg-blue-100 text-blue-700"
                    )}
                  >
                    {getStorageIcon(storage.type)}
                    <span className="flex-1">{storage.name}</span>
                    <span className="text-xs text-gray-500 capitalize">{storage.type}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  onClick={() => setIsStorageModalOpen(true)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add New Storage
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {user?.full_name || user?.email}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem disabled>
                    <User className="w-4 h-4 mr-2" />
                    <div className="flex flex-col">
                      <span className="font-medium">{user?.full_name}</span>
                      <span className="text-xs text-gray-500">{user?.email}</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={handleSignInClick}
              >
                <User className="w-4 h-4" />
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 rounded-lg mt-2">
              {navigationItems.map((item) => (
                item.submenu ? (
                  <div key={item.name} className="space-y-1">
                    <div className="px-3 py-2 text-base font-medium text-gray-900">
                      {item.name}
                    </div>
                    {item.submenu.map((subItem) => (
                      <button
                        key={subItem.name}
                        onClick={() => {
                          navigateWithLoading(subItem.href);
                          setIsMobileMenuOpen(false);
                        }}
                        className={cn(
                          "block w-full text-left px-6 py-2 rounded-md text-sm font-medium transition-colors",
                          isActive(subItem.href)
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        )}
                      >
                        {subItem.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigateWithLoading(item.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    {item.name}
                  </button>
                )
              ))}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {/* Mobile Storage Selection */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Storage:</div>
                  <div className="space-y-1">
                    {storages.map((storage) => (
                      <button
                        key={storage.id}
                        onClick={() => setSelectedStorage(storage.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                          selectedStorage === storage.id
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        )}
                      >
                        {getStorageIcon(storage.type)}
                        <span className="flex-1 text-left">{storage.name}</span>
                        <span className="text-xs text-gray-500 capitalize">{storage.type}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => setIsStorageModalOpen(true)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Storage
                    </button>
                  </div>
                </div>
                
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm text-gray-700">
                      <div className="font-medium">{user?.full_name}</div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full flex items-center justify-center gap-2 text-red-600"
                      onClick={logout}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleSignInClick}
                  >
                    <User className="w-4 h-4" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Storage Modal */}
        <Dialog open={isStorageModalOpen} onOpenChange={(open) => {
          if (!open) {
            handleCloseStorageModal();
          } else {
            setIsStorageModalOpen(true);
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Storage</DialogTitle>
              <DialogDescription>
                Create a new storage location for your data. Choose between local or cloud storage.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="storage-name">Storage Name</Label>
                <Input
                  id="storage-name"
                  value={newStorageName}
                  onChange={(e) => setNewStorageName(e.target.value)}
                  placeholder="Enter storage name"
                />
              </div>
              <div>
                <Label>Storage Type</Label>
                <div className="mt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => setNewStorageType("local")}
                    className={cn(
                      "w-full flex items-center gap-2 p-3 rounded-lg border transition-colors",
                      newStorageType === "local"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      newStorageType === "local"
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    )}>
                      {newStorageType === "local" && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <HardDrive className="w-4 h-4" />
                    <span>Local Storage</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => isAuthenticated && setNewStorageType("cloud")}
                    disabled={!isAuthenticated}
                    className={cn(
                      "w-full flex items-center gap-2 p-3 rounded-lg border transition-colors",
                      newStorageType === "cloud"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300",
                      !isAuthenticated && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      newStorageType === "cloud"
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    )}>
                      {newStorageType === "cloud" && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <Cloud className="w-4 h-4" />
                    <span>Cloud Storage</span>
                    {!isAuthenticated && (
                      <span className="text-xs text-gray-400 ml-auto">(Sign in required)</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCloseStorageModal}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddStorage}
                disabled={!newStorageName.trim() || (newStorageType === "cloud" && !isAuthenticated)}
              >
                Add Storage
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </nav>
  );
}
