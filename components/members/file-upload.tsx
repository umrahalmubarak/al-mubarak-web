// components/members/file-upload.tsx
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Upload, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  accept?: Record<string, string[]>;
  multiple?: boolean;
  maxSize?: number;
}

export function FileUpload({
  files,
  onChange,
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
  },
  multiple = true,
  maxSize = 10 * 1024 * 1024, // 10MB
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (multiple) {
        onChange([...files, ...acceptedFiles]);
      } else {
        onChange(acceptedFiles.slice(0, 1));
      }
    },
    [files, onChange, multiple]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              Drop images here or click to select
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {multiple ? "Select multiple images" : "Select a image"} up to{" "}
              {formatFileSize(maxSize)}
            </p>
            <Button type="button" variant="outline">
              Choose images
            </Button>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Selected Images ({files.length})</h4>
          <div className="grid gap-2">
            {files.map((file, index) => (
              <Card key={index}>
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <File className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
