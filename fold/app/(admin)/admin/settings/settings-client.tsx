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
import { 
  Settings as SettingsIcon, 
  Save, 
  Gamepad2, 
  Users, 
  Calendar,
  Globe,
  Megaphone
} from "lucide-react";
import { updateSiteSettings } from "@/app/actions/admin-actions";

interface SettingsClientProps {
  initialSettings: {
    _id?: string;
    siteName: string;
    eventDate: string;
    registrationOpen: boolean;
    maxTeamSize: number;
    minTeamSize: number;
    allowTeamCreation: boolean;
    allowJoinRequests: boolean;
    heroTitle: string;
    heroSubtitle: string;
    announcementBanner: string;
  };
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(initialSettings);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateSiteSettings(settings);
    setSaving(false);
    
    if (result.success) {
      alert("✅ Settings saved successfully!");
    } else {
      alert("❌ " + result.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-yellow-500" />
          Site Settings
        </h1>
        <p className="text-zinc-400 mt-2">
          Configure the Clash of Clans Tournament platform
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* General Settings */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              General Settings
            </CardTitle>
            <CardDescription>Basic site configuration for Spring Fiesta</CardDescription>
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
                placeholder="Spring Fiesta 2026 - Clash of Clans"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-400" />
                Event Date
              </Label>
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
            <div className="flex items-center gap-2 p-3 bg-zinc-800 rounded-lg">
              <input
                type="checkbox"
                id="registrationOpen"
                title="Toggle registration status"
                checked={settings.registrationOpen}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    registrationOpen: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-yellow-500"
              />
              <Label htmlFor="registrationOpen" className="cursor-pointer flex-1">
                Registration Open
              </Label>
              {settings.registrationOpen ? (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">OPEN</span>
              ) : (
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">CLOSED</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Settings */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              Team Configuration
            </CardTitle>
            <CardDescription>Control team creation and clan sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minTeamSize">Min Clan Size</Label>
                <Input
                  id="minTeamSize"
                  type="number"
                  min={1}
                  max={5}
                  value={settings.minTeamSize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      minTeamSize: parseInt(e.target.value) || 1,
                    })
                  }
                  className="bg-black border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTeamSize">Max Clan Size</Label>
                <Input
                  id="maxTeamSize"
                  type="number"
                  min={1}
                  max={15}
                  value={settings.maxTeamSize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxTeamSize: parseInt(e.target.value) || 5,
                    })
                  }
                  className="bg-black border-zinc-700 text-white"
                />
              </div>
            </div>
            <div className="text-xs text-zinc-500 bg-zinc-800 p-2 rounded">
              💡 For Clash of Clans, typical team sizes are 5-15 members
            </div>
            <div className="flex items-center gap-2 p-3 bg-zinc-800 rounded-lg">
              <input
                type="checkbox"
                id="allowTeamCreation"
                title="Toggle clan creation"
                checked={settings.allowTeamCreation}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    allowTeamCreation: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-yellow-500"
              />
              <Label htmlFor="allowTeamCreation" className="cursor-pointer">
                Allow Clan Creation
              </Label>
            </div>
            <div className="flex items-center gap-2 p-3 bg-zinc-800 rounded-lg">
              <input
                type="checkbox"
                id="allowJoinRequests"
                title="Toggle join requests"
                checked={settings.allowJoinRequests}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    allowJoinRequests: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-yellow-500"
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
            <CardTitle className="text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-yellow-400" />
              Landing Page Content
            </CardTitle>
            <CardDescription>Customize the hero section for Clash of Clans tournament</CardDescription>
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
                placeholder="Clash of Clans Tournament"
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
                placeholder="Spring Fiesta 2026 • IIIT Surat"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Banner */}
        <Card className="bg-zinc-900 border-zinc-800 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-orange-400" />
              Quick Announcement Banner
            </CardTitle>
            <CardDescription>
              Display a quick message banner across the site. For more announcements, use the Announcements page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="announcementBanner">
                Banner Text (leave empty to hide)
              </Label>
              <Input
                id="announcementBanner"
                placeholder="e.g., Registration closes on March 1st! 🏆"
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
            {settings.announcementBanner && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-sm text-yellow-400">
                  <strong>Preview:</strong> {settings.announcementBanner}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save All Settings"}
        </Button>
        <Button
          onClick={() => setSettings(initialSettings)}
          variant="outline"
          className="border-zinc-700 text-zinc-400 hover:text-white"
        >
          Reset Changes
        </Button>
      </div>
    </div>
  );
}
