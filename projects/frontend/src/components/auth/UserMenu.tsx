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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "./AuthModal";
import { MoveToCloudButton } from "./MoveToCloudButton";

export function UserMenu() {
  const { user, logout, isAuthenticated, deleteAccount } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      // User will be automatically logged out after successful deletion
    } catch (error) {
      console.error("Failed to delete account:", error);
      // You might want to show an error toast here
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteAccountClick = () => {
    // Close the dropdown first
    setDropdownOpen(false);

    // Wait for body pointer-events to reset before opening dialog
    const waitForPointerEventsReset = () => {
      const bodyStyle = document.body.style.pointerEvents;
      if (bodyStyle === "auto" || bodyStyle === "") {
        setDeleteDialogOpen(true);
      } else {
        setTimeout(waitForPointerEventsReset, 10);
      }
    };

    setTimeout(waitForPointerEventsReset, 10);
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
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
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
          <DropdownMenuItem
            onClick={handleDeleteAccountClick}
            className="text-red-600 hover:text-red-700"
            data-cy="delete-account-button"
          >
            Delete Account
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-cy="delete-account-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to permanently delete your account? This
                action cannot be undone.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-3">
                <p className="text-sm text-red-800 font-medium">
                  This will permanently delete:
                </p>
                <ul className="text-sm text-red-700 mt-1 ml-4 list-disc">
                  <li>All your workspaces</li>
                  <li>All your profiles and data points</li>
                  <li>All your datasets and texts</li>
                  <li>All your annotated datasets and annotations</li>
                  <li>All your settings and configurations</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-cy="delete-account-cancel">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              data-cy="delete-account-confirm"
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
