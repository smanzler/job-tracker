"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Lock, Unlock } from "lucide-react";

export function AuthButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [secret, setSecret] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch("/api/auth/status");
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(data.authenticated);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleAuth = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsAuthenticated(true);
        setIsOpen(false);
        setSecret("");
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
      setIsAuthenticated(false);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      {isAuthenticated ? (
        <Button
          variant="outline"
          size="icon"
          onClick={handleLogout}
          title="Logout"
        >
          <Unlock className="h-4 w-4" />
        </Button>
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" title="Authenticate">
              <Lock className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Authentication Required</DialogTitle>
              <DialogDescription>
                Enter your secret key to enable mutations (save/archive
                actions).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="secret">Secret Key</Label>
                <Input
                  id="secret"
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                  placeholder="Enter your secret key"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAuth} disabled={loading || !secret}>
                {loading ? "Authenticating..." : "Authenticate"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
