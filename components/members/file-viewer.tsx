// components/members/file-viewer.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Download,
  File,
  FileText,
  Image,
  FileArchive,
} from "lucide-react";
import { baseURL } from "@/lib/api";

interface FileViewerProps {
  documents: any[];
  memberName: string;
}

export function FileViewer({ documents, memberName }: FileViewerProps) {
  const [selectedFile, setSelectedFile] = useState<any>(null);

  if (!documents || documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <File className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No documents uploaded</p>
        </CardContent>
      </Card>
    );
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return Image;
    if (fileType === "application/pdf" || fileType.includes("document"))
      return FileText;
    if (fileType.includes("archive") || fileType.includes("zip"))
      return FileArchive;
    return File;
  };

  const getFileTypeColor = (fileType: string) => {
    if (fileType.startsWith("image/")) return "bg-green-100 text-green-800";
    if (fileType === "application/pdf") return "bg-red-100 text-red-800";
    if (fileType.includes("document")) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = async (file: any) => {
    try {
      const response = await fetch(`/api/files/${file.id}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Documents ({documents.length})</h3>
      </div>

      <div className="grid gap-3">
        {documents.map((file, index) => {
          const IconComponent = getFileIcon(file?.mimetype);

          return (
            <Card key={index} className="transition-all hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <IconComponent className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {file?.originalName?.slice(0, 10) || "Document"}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={getFileTypeColor(file?.mimetype)}
                        >
                          {file?.mimetype.split("/")[1]?.toUpperCase() ||
                            "FILE"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file?.size)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {file.mimetype?.startsWith("image/") ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedFile(file)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>
                              {file?.originalName?.slice(0, 10) ?? "Document"}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="flex justify-center">
                            <img
                              src={file.url}
                              alt={file.filename}
                              className="max-w-full max-h-[70vh] object-contain"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open("www.google.com", "_blank")}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(file)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
