"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Pin,
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "@/app/actions/admin-actions";

// Helper to format dates consistently (avoids hydration mismatch)
function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: "INFO" | "WARNING" | "SUCCESS" | "URGENT";
  priority: number;
  isActive: boolean;
  isPinned: boolean;
  showOnBanner: boolean;
  targetAudience: "ALL" | "TEAMS" | "FREE_AGENTS" | "ADMINS";
  expiresAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface AnnouncementsClientProps {
  announcements: Announcement[];
}

const typeConfig = {
  INFO: {
    icon: Info,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  WARNING: {
    icon: AlertTriangle,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
  },
  SUCCESS: {
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
  },
  URGENT: {
    icon: Zap,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
};

export default function AnnouncementsClient({
  announcements,
}: AnnouncementsClientProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "INFO" as "INFO" | "WARNING" | "SUCCESS" | "URGENT",
    priority: 0,
    isPinned: false,
    showOnBanner: false,
    targetAudience: "ALL" as "ALL" | "TEAMS" | "FREE_AGENTS" | "ADMINS",
    expiresAt: "",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      type: "INFO",
      priority: 0,
      isPinned: false,
      showOnBanner: false,
      targetAudience: "ALL",
      expiresAt: "",
    });
    setEditingAnnouncement(null);
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.content) {
      alert("Title and content are required");
      return;
    }

    setSaving(true);
    const result = await createAnnouncement({
      ...formData,
      expiresAt: formData.expiresAt || null,
    });
    setSaving(false);

    if (result.success) {
      alert("✅ Announcement created!");
      setCreateDialogOpen(false);
      resetForm();
      window.location.reload();
    } else {
      alert("❌ " + result.message);
    }
  };

  const handleUpdate = async () => {
    if (!editingAnnouncement) return;

    setSaving(true);
    const result = await updateAnnouncement(editingAnnouncement._id, {
      ...formData,
      expiresAt: formData.expiresAt || null,
    });
    setSaving(false);

    if (result.success) {
      alert("✅ Announcement updated!");
      resetForm();
      window.location.reload();
    } else {
      alert("❌ " + result.message);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete announcement "${title}"?`)) return;

    const result = await deleteAnnouncement(id);
    if (result.success) {
      alert("✅ Announcement deleted!");
      window.location.reload();
    } else {
      alert("❌ " + result.message);
    }
  };

  const handleToggleActive = async (announcement: Announcement) => {
    const result = await updateAnnouncement(announcement._id, {
      isActive: !announcement.isActive,
    });
    if (result.success) {
      window.location.reload();
    } else {
      alert("❌ " + result.message);
    }
  };

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority,
      isPinned: announcement.isPinned,
      showOnBanner: announcement.showOnBanner,
      targetAudience: announcement.targetAudience,
      expiresAt: announcement.expiresAt?.split("T")[0] || "",
    });
  };

  const activeCount = announcements.filter((a) => a.isActive).length;
  const pinnedCount = announcements.filter((a) => a.isPinned).length;
  const bannerCount = announcements.filter((a) => a.showOnBanner).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-yellow-500" />
            Announcements
          </h1>
          <p className="text-zinc-400 mt-1">
            Manage tournament announcements and notifications
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
              <Plus className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-500" />
                Create Announcement
              </DialogTitle>
              <DialogDescription>
                Create a new announcement for players and teams
              </DialogDescription>
            </DialogHeader>
            <AnnouncementForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreate}
              saving={saving}
              submitLabel="Create Announcement"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Megaphone className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {announcements.length}
                </p>
                <p className="text-sm text-zinc-400">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Eye className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{activeCount}</p>
                <p className="text-sm text-zinc-400">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Pin className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{pinnedCount}</p>
                <p className="text-sm text-zinc-400">Pinned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Bell className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{bannerCount}</p>
                <p className="text-sm text-zinc-400">On Banner</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingAnnouncement}
        onOpenChange={(open) => !open && resetForm()}
      >
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-yellow-500" />
              Edit Announcement
            </DialogTitle>
          </DialogHeader>
          <AnnouncementForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdate}
            saving={saving}
            submitLabel="Save Changes"
          />
        </DialogContent>
      </Dialog>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-8 text-center">
              <Megaphone className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                No Announcements
              </h3>
              <p className="text-zinc-400 mb-4">
                Create your first announcement for the tournament
              </p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Announcement
              </Button>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => {
            const TypeIcon = typeConfig[announcement.type].icon;
            const typeColors = typeConfig[announcement.type];

            return (
              <Card
                key={announcement._id}
                className={`bg-zinc-900 border-zinc-800 ${!announcement.isActive ? "opacity-50" : ""}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${typeColors.bg} rounded-lg`}>
                        <TypeIcon className={`w-5 h-5 ${typeColors.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                          {announcement.title}
                          {announcement.isPinned && (
                            <Pin className="w-4 h-4 text-blue-400" />
                          )}
                          {announcement.showOnBanner && (
                            <Bell className="w-4 h-4 text-orange-400" />
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            className={`${typeColors.bg} ${typeColors.color} ${typeColors.border}`}
                          >
                            {announcement.type}
                          </Badge>
                          <Badge variant="outline" className="text-zinc-400">
                            {announcement.targetAudience}
                          </Badge>
                          {!announcement.isActive && (
                            <Badge className="bg-zinc-700 text-zinc-400">
                              INACTIVE
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(announcement)}
                        className={
                          announcement.isActive
                            ? "text-green-400"
                            : "text-zinc-500"
                        }
                      >
                        {announcement.isActive ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(announcement)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDelete(announcement._id, announcement.title)
                        }
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-300 whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-xs text-zinc-500">
                    <span>Priority: {announcement.priority}</span>
                    {announcement.expiresAt && (
                      <span>Expires: {formatDate(announcement.expiresAt)}</span>
                    )}
                    {announcement.createdAt && (
                      <span>Created: {formatDate(announcement.createdAt)}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

// Reusable form component
function AnnouncementForm({
  formData,
  setFormData,
  onSubmit,
  saving,
  submitLabel,
}: {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: () => void;
  saving: boolean;
  submitLabel: string;
}) {
  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label>Title *</Label>
        <Input
          placeholder="e.g., Registration Deadline Extended!"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="bg-black border-zinc-700"
        />
      </div>

      <div className="space-y-2">
        <Label>Content *</Label>
        <textarea
          placeholder="Announcement content..."
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          className="w-full bg-black border border-zinc-700 rounded-md p-3 text-white min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="announcement-type">Type</Label>
          <select
            id="announcement-type"
            title="Select announcement type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full bg-black border border-zinc-700 rounded-md p-2 text-white"
          >
            <option value="INFO">ℹ️ Info</option>
            <option value="WARNING">⚠️ Warning</option>
            <option value="SUCCESS">✅ Success</option>
            <option value="URGENT">🚨 Urgent</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target-audience">Target Audience</Label>
          <select
            id="target-audience"
            title="Select target audience"
            value={formData.targetAudience}
            onChange={(e) =>
              setFormData({ ...formData, targetAudience: e.target.value })
            }
            className="w-full bg-black border border-zinc-700 rounded-md p-2 text-white"
          >
            <option value="ALL">Everyone</option>
            <option value="TEAMS">Teams Only</option>
            <option value="FREE_AGENTS">Free Agents</option>
            <option value="ADMINS">Admins Only</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Priority (0-100)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={formData.priority}
            onChange={(e) =>
              setFormData({
                ...formData,
                priority: parseInt(e.target.value) || 0,
              })
            }
            className="bg-black border-zinc-700"
          />
        </div>

        <div className="space-y-2">
          <Label>Expires On (optional)</Label>
          <Input
            type="date"
            value={formData.expiresAt}
            onChange={(e) =>
              setFormData({ ...formData, expiresAt: e.target.value })
            }
            className="bg-black border-zinc-700"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isPinned}
            onChange={(e) =>
              setFormData({ ...formData, isPinned: e.target.checked })
            }
            className="w-4 h-4 accent-yellow-500"
          />
          <span className="text-sm text-zinc-300">📌 Pin to top</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.showOnBanner}
            onChange={(e) =>
              setFormData({ ...formData, showOnBanner: e.target.checked })
            }
            className="w-4 h-4 accent-yellow-500"
          />
          <span className="text-sm text-zinc-300">🔔 Show on site banner</span>
        </label>
      </div>

      <Button
        onClick={onSubmit}
        disabled={saving || !formData.title || !formData.content}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
      >
        {saving ? "Saving..." : submitLabel}
      </Button>
    </div>
  );
}
