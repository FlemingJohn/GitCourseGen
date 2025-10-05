'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound } from 'lucide-react';
import Link from 'next/link';

interface GithubTokenDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (token: string) => void;
}

export default function GithubTokenDialog({ isOpen, onOpenChange, onSave }: GithubTokenDialogProps) {
  const [token, setToken] = useState('');

  const handleSave = () => {
    if (token) {
      onSave(token);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="text-primary" />
            Set GitHub API Token
          </DialogTitle>
          <DialogDescription>
            A GitHub Personal Access Token with repository write access is required. Your token is stored only in your browser's local storage.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="token">
              Personal Access Token
            </Label>
            <Input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_..."
            />
            <p className="text-sm text-muted-foreground">
              Create a new token{' '}
              <Link href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                with 'repo' scope.
              </Link>
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSave} disabled={!token}>Save Token</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
