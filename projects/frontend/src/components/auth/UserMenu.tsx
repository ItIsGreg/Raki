"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "./AuthModal";
import { MoveToCloudButton } from "./MoveToCloudButton";

export function UserMenu() {
  const { user, logout, isAuthenticated } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const handleLogin = () => {
    setAuthMode("login");
    setAuthModalOpen(true);
  };

  const handleRegister = () => {
    setAuthMode("register");
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleLogin}>
            Sign in
          </Button>
          <Button onClick={handleRegister}>Sign up</Button>
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultMode={authMode}
        />
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user?.email.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:inline">{user?.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.email}</span>
            <span className="text-xs text-gray-500">
              Joined {new Date(user?.created_at || "").toLocaleDateString()}
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
