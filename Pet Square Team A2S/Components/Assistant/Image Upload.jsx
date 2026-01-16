import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, Upload, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function ImageUpload({ onImageUploaded, disabled }) {
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        setIsUploading(true);
        try {
            const result = await base44.integrations.Core.UploadFile({ file });
            setUploadedImage(result.file_url);
            onImageUploaded(result.file_url);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const clearImage = () => {
        setUploadedImage(null);
        onImageUploaded(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex items-center gap-2">
            {uploadedImage ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                >
                    <img
                        src={uploadedImage}
                        alt="Uploaded"
                        className="h-12 w-12 rounded-lg object-cover border-2 border-emerald-200"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                        onClick={clearImage}
                    >
                        <X className="w-3 h-3" />
                    </Button>
                </motion.div>
            ) : (
                <>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={disabled || isUploading}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled || isUploading}
                        className="rounded-full"
                    >
                        {isUploading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <ImageIcon className="w-5 h-5" />
                        )}
                    </Button>
                </>
            )}
        </div>
    );
}