"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Download, FileIcon, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import type { ComplaintAttachmentWithUrl } from "@/data/complaints/getComplaintAttachments";

interface AttachmentsGalleryProps {
  attachments: ComplaintAttachmentWithUrl[];
}

export function AttachmentsGallery({ attachments }: AttachmentsGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ComplaintAttachmentWithUrl | null>(null);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const images = attachments.filter((att) => att.file_type.startsWith("image/"));
  const files = attachments.filter((att) => !att.file_type.startsWith("image/"));

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Images Gallery */}
      {images.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-green-600" />
            الصور المرفقة ({images.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-green-500 transition-colors group bg-gray-50"
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={image.publicUrl}
                  alt={image.file_name}
                  fill
                  className="object-contain p-2"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FileIcon className="h-5 w-5 text-green-600" />
            الملفات المرفقة ({files.length})
          </h3>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border hover:border-green-500 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.file_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.file_size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex-shrink-0"
                >
                  <a
                    href={file.publicUrl}
                    download={file.file_name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Viewer Dialog */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0">
            <div className="relative w-full h-[80vh]">
              <Image
                src={selectedImage.publicUrl}
                alt={selectedImage.file_name}
                fill
                className="object-contain"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4">
                <p className="font-medium">{selectedImage.file_name}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span>{formatFileSize(selectedImage.file_size)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-white hover:text-white hover:bg-white/20"
                  >
                    <a
                      href={selectedImage.publicUrl}
                      download={selectedImage.file_name}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      تحميل
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
