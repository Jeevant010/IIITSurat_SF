"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Save } from "lucide-react";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "Spring Fiesta 2026",
    eventDate: "2026-03-15",
    registrationOpen: true,
    maxTeamSize: 5,
    minTeamSize: 1,
    allowTeamCreation: true,
    allowJoinRequests: true,
    heroTitle: "Welcome to Spring Fiesta 2026",
    heroSubtitle: "IIIT Surat's Premier Cultural Event",
    announcementBanner: "",
  });

  const handleSave = async () => {
    setSaving(true);
    // TODO: Implement save to database
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    alert("Settings saved!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Site Settings</h1>
        <p className="text-zinc-400 mt-2">
          Configure the platform without touching code
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* General Settings */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              General Settings
            </CardTitle>
            <CardDescription>Basic site configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) =>
                  setSettings({ ...settings, siteName: e.target.value })
                }
                className="bg-black border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date</Label>
              <Input
                id="eventDate"
                type="date"
                value={settings.eventDate}
                onChange={(e) =>
                  setSettings({ ...settings, eventDate: e.target.value })
                }
                className="bg-black border-zinc-700 text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="registrationOpen"
                checked={settings.registrationOpen}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    registrationOpen: e.target.checked,
                  })
                }
                className="w-4 h-4"
              />
              <Label htmlFor="registrationOpen" className="cursor-pointer">
                Registration Open
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Team Settings */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Team Configuration</CardTitle>
            <CardDescription>Control team creation and sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxTeamSize">Maximum Team Size</Label>
              <Input
                id="maxTeamSize"
                type="number"
                min={1}
                max={10}
                value={settings.maxTeamSize}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxTeamSize: parseInt(e.target.value),
                  })
                }
                className="bg-black border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minTeamSize">Minimum Team Size</Label>
              <Input
                id="minTeamSize"
                type="number"
                min={1}
                max={5}
                value={settings.minTeamSize}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    minTeamSize: parseInt(e.target.value),
                  })
                }
                className="bg-black border-zinc-700 text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowTeamCreation"
                checked={settings.allowTeamCreation}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    allowTeamCreation: e.target.checked,
                  })
                }
                className="w-4 h-4"
              />
              <Label htmlFor="allowTeamCreation" className="cursor-pointer">
                Allow Team Creation
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowJoinRequests"
                checked={settings.allowJoinRequests}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    allowJoinRequests: e.target.checked,
                  })
                }
                className="w-4 h-4"
              />
              <Label htmlFor="allowJoinRequests" className="cursor-pointer">
                Allow Join Requests
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Landing Page Content */}
        <Card className="bg-zinc-900 border-zinc-800 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Landing Page Content</CardTitle>
            <CardDescription>Customize the hero section text</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="heroTitle">Hero Title</Label>
              <Input
                id="heroTitle"
                value={settings.heroTitle}
                onChange={(e) =>
                  setSettings({ ...settings, heroTitle: e.target.value })
                }
                className="bg-black border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
              <Input
                id="heroSubtitle"
                value={settings.heroSubtitle}
                onChange={(e) =>
                  setSettings({ ...settings, heroSubtitle: e.target.value })
                }
                className="bg-black border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcementBanner">
                Announcement Banner (optional)
              </Label>
              <Input
                id="announcementBanner"
                placeholder="e.g., Registration closes on March 1st!"
                value={settings.announcementBanner}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcementBanner: e.target.value,
                  })
                }
                className="bg-black border-zinc-700 text-white"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
      >
        <Save className="w-4 h-4 mr-2" />
        {saving ? "Saving..." : "Save All Settings"}
      </Button>
    </div>
  );
}
