"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  FileText,
  Globe,
  Headphones,
  Link2,
  Menu,
  NotebookPen,
  Plus,
  Search,
  Sparkles,
  Video,
  X,
  Loader2,
  AlertCircle,
  Check,
  UploadCloud,
  FileUp,
  CheckCircle2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const WORKSPACE_ICONS = [
  "📁", "📚", "🧠", "💡", "🔬", "💻", "🚀", "📝",
  "📊", "🎯", "🌐", "⚡", "🎨", "🏛️", "💼", "🤖",
];

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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useWorkspace,
  useUpdateWorkspace,
} from "@/features/workspace";
import {
  useUploadPdf,
  useListSources,
  useDeleteSource,
  type Source,
  type SourceType,
} from "@/features/source";
import { SourceChatPanel } from "@/features/chat";

function formatFileSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}


export default function WorkspaceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId =
    typeof params?.workspaceId === "string"
      ? params.workspaceId
      : Array.isArray(params?.workspaceId)
      ? params.workspaceId[0]
      : "";

  // Fetch workspace details from API
  const {
    data: workspace,
    isLoading,
    isError,
    error,
  } = useWorkspace(workspaceId);

  const updateWorkspaceMutation = useUpdateWorkspace(workspaceId);
  const uploadPdfMutation = useUploadPdf();
  const { data: sources = [], isLoading: sourcesLoading } = useListSources(workspaceId);
  const deleteSourceMutation = useDeleteSource(workspaceId);

  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sourceSearch, setSourceSearch] = useState("");
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  // Settings form state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editModel, setEditModel] = useState("gpt-3.5-turbo");
  const [editIcon, setEditIcon] = useState("📁");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // PDF Upload form state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    if (workspace) {
      setEditTitle(workspace.title || workspace.name || "");
      setEditDescription(workspace.description || "");
      setEditModel(workspace.defaultModel || "gpt-3.5-turbo");
      setEditIcon(workspace.icon || "📁");
    }
  }, [workspace]);

  useEffect(() => {
    if (sources.length > 0 && !selectedSourceId) {
      setSelectedSourceId(String(sources[0]!.id));
    }
  }, [sources, selectedSourceId]);

  const handleUpdateSettings = async () => {
    if (!editTitle.trim()) return;
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateWorkspaceMutation.mutateAsync({
        title: editTitle.trim(),
        description: editDescription.trim(),
        defaultModel: editModel.trim(),
        icon: editIcon || "📁",
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setSettingsOpen(false);
      }, 800);
    } catch (err: any) {
      setSaveError(err?.message || "Failed to update workspace settings.");
    }
  };

  // PDF File Selection & Validation
  const handleFileChange = (file: File | null) => {
    setUploadError(null);
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Only PDF files are allowed.");
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      setUploadError("File size exceeds maximum limit of 10MB.");
      return;
    }

    setSelectedFile(file);
    if (!uploadTitle.trim()) {
      setUploadTitle(file.name.replace(/\.pdf$/i, ""));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !workspaceId) return;
    setUploadError(null);

    try {
      await uploadPdfMutation.mutateAsync({
        workspaceId,
        file: selectedFile,
        title: uploadTitle.trim() || undefined,
      });

      setUploadSuccess(true);

      setTimeout(() => {
        setUploadSuccess(false);
        setSelectedFile(null);
        setUploadTitle("");
        setUploadModalOpen(false);
      }, 1000);
    } catch (err: any) {
      setUploadError(
        err?.message || "Failed to upload PDF. Please check file and try again."
      );
    }
  };

  const filteredSources = sources.filter((source) =>
    (source.title || source.name || "").toLowerCase().includes(sourceSearch.toLowerCase())
  );

  const selectedSource =
    sources.find((source) => String(source.id) === selectedSourceId) ?? null;

  const displayName = workspace?.title || workspace?.name || "Workspace";
  const displayDescription =
    workspace?.description || "Ask anything about your sources";

  if (isError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Workspace not found</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {error?.message ||
            "The requested workspace could not be loaded or does not exist."}
        </p>
        <Link href="/workspaces">
          <Button className="mt-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to workspaces
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Mobile sidebar overlay */}
      {mobileSidebar && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebar(false)}
        />
      )}

      {/* ───────────────── Sidebar ───────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col
          border-r bg-background transition-transform duration-200
          lg:static lg:translate-x-0
          ${mobileSidebar ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/workspaces">
            <div className="flex min-w-0 items-center gap-2">
              <NotebookPen className="h-5 w-5 shrink-0 text-primary" />
              <span className="truncate font-semibold">Quire</span>
            </div>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileSidebar(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Back */}
        <div className="px-3 pt-3">
          <Link href="/workspaces">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              All workspaces
            </Button>
          </Link>
        </div>

        {/* Workspace Info */}
        <div className="px-5 pb-4 pt-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Workspace
          </p>

          {isLoading ? (
            <div className="mt-2 space-y-1">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ) : (
            <>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xl shrink-0">{workspace?.icon || "📁"}</span>
                <h1 className="truncate font-semibold">{displayName}</h1>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {sources.length} sources
              </p>
            </>
          )}
        </div>

        <Separator />

        {/* Sources List */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">Resources</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted"
              title="Upload PDF source"
              onClick={() => setUploadModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 px-3">
            <div className="space-y-1 pb-4">
              {sourcesLoading ? (
                <div className="space-y-1 px-3 py-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3.5 w-3/4" />
                        <Skeleton className="h-2.5 w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredSources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center px-3">
                  <FileText className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground">No sources yet</p>
                </div>
              ) : (
                filteredSources.map((source) => (
                  <SourceSidebarItem
                    key={source.id}
                    source={source}
                    selected={selectedSourceId === source.id}
                    onSelect={() => setSelectedSourceId(String(source.id))}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Sidebar Footer: Settings Dialog Trigger */}
        <div className="border-t p-3">
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                disabled={isLoading}
              >
                <Sparkles className="h-4 w-4" />
                Workspace settings
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Workspace settings</DialogTitle>
                <DialogDescription>
                  Update your workspace icon, name, description, and AI model.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3">
                {saveError && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Workspace Icon
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {WORKSPACE_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setEditIcon(icon)}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg border text-base transition-all hover:scale-105 hover:bg-muted",
                          editIcon === icon
                            ? "border-primary bg-primary/15 ring-2 ring-primary/30"
                            : "border-border bg-background"
                        )}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="edit-title" className="text-sm font-medium">
                    Workspace Title
                  </label>
                  <Input
                    id="edit-title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    disabled={updateWorkspaceMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="edit-desc" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="edit-desc"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="resize-none"
                    disabled={updateWorkspaceMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="edit-model" className="text-sm font-medium">
                    Default AI Model
                  </label>
                  <Input
                    id="edit-model"
                    value={editModel}
                    onChange={(e) => setEditModel(e.target.value)}
                    placeholder="e.g. gpt-3.5-turbo, gpt-4o"
                    disabled={updateWorkspaceMutation.isPending}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setSettingsOpen(false)}
                  disabled={updateWorkspaceMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateSettings}
                  disabled={!editTitle.trim() || updateWorkspaceMutation.isPending}
                  className="gap-2"
                >
                  {updateWorkspaceMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {saveSuccess && <Check className="h-4 w-4 text-emerald-400" />}
                  <span>
                    {updateWorkspaceMutation.isPending
                      ? "Saving..."
                      : saveSuccess
                      ? "Saved!"
                      : "Save changes"}
                  </span>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </aside>

      {/* ───────────────── Main Chat Area ───────────────── */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileSidebar(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="min-w-0">
              {isLoading ? (
                <div className="space-y-1">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-lg shrink-0">{workspace?.icon || "📁"}</span>
                    <h2 className="truncate text-sm font-semibold md:text-base">
                      {displayName}
                    </h2>
                  </div>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {displayDescription}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Topbar Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setUploadModalOpen(true)}
              className="gap-2"
              size="sm"
            >
              <FileUp className="h-4 w-4" />
              <span className="hidden sm:inline">Upload PDF</span>
            </Button>

            {/* Sources Button */}
            <Dialog open={sourceModalOpen} onOpenChange={setSourceModalOpen}>
              <DialogTrigger>
                <Button variant="outline" size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Sources</span>
                  <Badge variant="secondary" className="ml-1">
                    {sources.length}
                  </Badge>
                </Button>
              </DialogTrigger>

              {/* Source Modal */}
              <DialogContent className="max-h-[85vh] overflow-hidden p-0 sm:max-w-[650px]">
                <DialogHeader className="border-b px-6 py-5">
                  <DialogTitle>Workspace sources</DialogTitle>
                  <DialogDescription>
                    Manage all the resources used by your AI workspace.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex min-h-0 flex-col">
                  <div className="flex items-center gap-3 border-b px-6 py-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search sources..."
                        value={sourceSearch}
                        onChange={(e) => setSourceSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Button
                      className="gap-2"
                      onClick={() => {
                        setSourceModalOpen(false);
                        setUploadModalOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add source
                    </Button>
                  </div>

                  <ScrollArea className="max-h-[400px] px-6 py-4">
                    <div className="space-y-2">
                      {filteredSources.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
                          <p className="text-sm text-muted-foreground">
                            {sourceSearch ? "No sources match your search." : "No sources yet. Upload a PDF to get started."}
                          </p>
                        </div>
                      ) : (
                        filteredSources.map((source) => (
                          <SourceModalItem
                            key={source.id}
                            source={source}
                            onDelete={() => deleteSourceMutation.mutate(String(source.id))}
                            isDeleting={deleteSourceMutation.isPending}
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Conversation View */}
        <SourceChatPanel
          workspaceId={workspaceId}
          source={selectedSource}
          workspaceIcon={workspace?.icon}
          workspaceName={displayName}
        />
      </main>

      {/* ───────────────── PDF Upload Modal ───────────────── */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload PDF Source</DialogTitle>
            <DialogDescription>
              Upload a research paper, notes, or document (max 10MB).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {uploadError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-500">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>PDF uploaded and queued for processing successfully!</span>
              </div>
            )}

            {/* Drop Zone */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all",
                  dragActive
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-muted/40"
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-medium">
                  Click to select or drag and drop a PDF file
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF documents up to 10 MB
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSelectedFile(null);
                    setUploadTitle("");
                    setUploadError(null);
                  }}
                  disabled={uploadPdfMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Custom Title Input */}
            {selectedFile && (
              <div className="space-y-2">
                <label htmlFor="upload-title" className="text-sm font-medium">
                  Source Title <span className="text-xs text-muted-foreground">(optional)</span>
                </label>
                <Input
                  id="upload-title"
                  placeholder="e.g. Attention Is All You Need"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  disabled={uploadPdfMutation.isPending}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setUploadModalOpen(false);
                setSelectedFile(null);
                setUploadError(null);
              }}
              disabled={uploadPdfMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadSubmit}
              disabled={!selectedFile || uploadPdfMutation.isPending}
              className="gap-2"
            >
              {uploadPdfMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <span>
                {uploadPdfMutation.isPending
                  ? "Uploading..."
                  : "Upload PDF"}
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ───────────────── Source Sidebar Item ───────────────── */

function SourceSidebarItem({
  source,
  selected,
  onSelect,
}: {
  source: Source;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const Icon = getSourceIcon(source.type);
  const displayName = source.title || source.name || "Untitled Source";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent",
        selected && "bg-accent ring-1 ring-primary/20",
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="truncate text-sm">{displayName}</p>
        <span className="text-xs text-green-300 rounded-full bg-green-900 py-1 px-2">{source.status}</span>
        </div>
        <p className="truncate text-[11px] text-muted-foreground">
          {source.meta || "PDF"}
        </p>
      </div>
    </button>
  );
}

/* ───────────────── Source Modal Item ───────────────── */

function SourceModalItem({
  source,
  onDelete,
  isDeleting,
}: {
  source: Source;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const Icon = getSourceIcon(source.type);
  const displayName = source.title || source.name || "Untitled Source";

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-muted/50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{displayName}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{source.meta || "PDF"}</p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive"
        onClick={onDelete}
        disabled={isDeleting}
        title="Delete source"
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

/* ───────────────── Source Icon ───────────────── */

function getSourceIcon(type: SourceType) {
  switch (type) {
    case "pdf":
      return FileText;
    case "web":
    case "website":
      return Globe;
    case "audio":
      return Headphones;
    case "video":
    case "youtube":
      return Video;
    case "text":
    case "markdown":
      return NotebookPen;
    default:
      return Link2;
  }
}
