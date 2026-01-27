"use client"

import { useState, useEffect, useCallback } from 'react';
import { Upload, File, CheckCircle2, XCircle, AlertCircle, FileSpreadsheet, Trash2, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"

interface FilesTabProps {
    dealId: string;
    onNavigate: (view: string) => void;
}

interface FileItem {
    id: string;
    name: string;
    size: string;
    status: 'uploading' | 'validating' | 'success' | 'error';
    progress: number;
    error?: string;
    rows?: number;
    file_type?: string;
}

export function FilesTab({ dealId, onNavigate }: FilesTabProps) {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial fetch of files
    useEffect(() => {
        fetchFiles();
    }, [dealId]);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/deals/${dealId}/files`);
            if (!res.ok) throw new Error('Failed to fetch files');

            const data = await res.json();

            // Transform API data to UI state
            const mappedFiles: FileItem[] = data.files.map((f: any) => ({
                id: f.id,
                name: f.original_filename || f.filename,
                size: formatSize(f.file_size),
                status: f.status === 'processing' ? 'validating' : 'success',
                progress: 100,
                rows: undefined,
                file_type: f.file_type
            }));

            setFiles(mappedFiles);
        } catch (error) {
            console.error('Error fetching files:', error);
            toast.error("Failed to load existing files");
        } finally {
            setLoading(false);
        }
    };

    const formatSize = (bytes: number) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        // Create temp file items for UI immediately
        const newFilesInUi = acceptedFiles.map(file => ({
            id: Math.random().toString(36).substring(7), // Temp ID
            name: file.name,
            size: formatSize(file.size),
            status: 'uploading' as const,
            progress: 0,
        }));

        setFiles(prev => [...prev, ...newFilesInUi]);

        // Process uploads
        for (let i = 0; i < acceptedFiles.length; i++) {
            const file = acceptedFiles[i];
            const uiFile = newFilesInUi[i];

            try {
                // Update progress to show uploading
                setFiles(prev => prev.map(f =>
                    f.id === uiFile.id ? { ...f, progress: 30, status: 'uploading' } : f
                ));

                // Create FormData and upload via API (service role bypasses RLS)
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch(`/api/deals/${dealId}/upload`, {
                    method: 'POST',
                    body: formData
                });

                // Update progress to 60%
                setFiles(prev => prev.map(f =>
                    f.id === uiFile.id ? { ...f, progress: 60, status: 'validating' } : f
                ));

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Upload failed');
                }

                const { file: dbFile } = await response.json();

                // Success - update with real ID
                setFiles(prev => prev.map(f =>
                    f.id === uiFile.id ? {
                        ...f,
                        id: dbFile.id,
                        status: 'success',
                        progress: 100,
                        rows: undefined
                    } : f
                ));

                toast.success(`Uploaded ${file.name}`);

            } catch (error) {
                console.error('Upload failed:', error);
                const errorMessage = error instanceof Error ? error.message : 'Upload failed';
                setFiles(prev => prev.map(f =>
                    f.id === uiFile.id ? { ...f, status: 'error', error: errorMessage, progress: 0 } : f
                ));
                toast.error(`Failed to upload ${file.name}`);
            }
        }
    }, [dealId]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'text/csv': ['.csv']
        },
        maxSize: 50 * 1024 * 1024 // 50MB
    });

    const handleRemoveFile = async (id: string) => {
        // If it's a temp ID (upload failed), just remove from UI
        if (id.length < 10) {
            setFiles(files.filter(f => f.id !== id));
            return;
        }

        try {
            const res = await fetch(`/api/deals/${dealId}/files/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setFiles(files.filter(f => f.id !== id));
                toast.success('File removed');
            } else {
                // Fallback: just remove from UI
                setFiles(files.filter(f => f.id !== id));
                toast.success('File removed');
            }
        } catch {
            // Fallback: just remove from UI
            setFiles(files.filter(f => f.id !== id));
            toast.success('File removed');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle2 className="w-5 h-5 text-green-600" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'uploading':
            case 'validating':
                return <AlertCircle className="w-5 h-5 text-blue-600 animate-pulse" />;
            default:
                return <File className="w-5 h-5 text-muted-foreground" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return <Badge className="bg-green-100 text-green-800 border-green-200">Uploaded</Badge>;
            case 'error':
                return <Badge className="bg-red-100 text-red-800 border-red-200">Error</Badge>;
            case 'validating':
                return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Processing</Badge>;
            case 'uploading':
                return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Uploading</Badge>;
            default:
                return null;
        }
    };

    const successCount = files.filter(f => f.status === 'success').length;

    return (
        <div className="space-y-6 w-full">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
                <Card className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileSpreadsheet className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{files.length}</div>
                            <div className="text-xs text-muted-foreground">Files Uploaded</div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{successCount}</div>
                            <div className="text-xs text-muted-foreground">Ready</div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <File className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-muted-foreground">--</div>
                            <div className="text-xs text-muted-foreground">Total Rows</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Upload Zone */}
            <Card
                {...getRootProps()}
                className={cn(
                    "p-12 border-2 border-dashed transition-colors cursor-pointer",
                    isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary"
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-1">Drag & drop files here</h3>
                        <p className="text-sm text-muted-foreground">or click to browse</p>
                    </div>
                    <Button type="button">
                        <Upload className="w-4 h-4 mr-2" />
                        Select Files
                    </Button>
                    <div className="text-xs text-muted-foreground">
                        Supported formats: .xlsx, .csv, .xls (Max 50MB per file)
                    </div>
                </div>
            </Card>

            {/* Uploaded Files */}
            {files.length > 0 && (
                <Card>
                    <div className="p-6 border-b">
                        <h3 className="font-semibold">Uploaded Files ({files.length})</h3>
                    </div>

                    <div className="divide-y">
                        {files.map((file) => (
                            <div key={file.id} className="p-6 hover:bg-muted/50 transition-colors">
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className="mt-1">
                                        {getStatusIcon(file.status)}
                                    </div>

                                    {/* File Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="font-medium text-foreground truncate">{file.name}</div>
                                            {getStatusBadge(file.status)}
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                            <span>{file.size}</span>
                                            {file.rows && <span>{file.rows.toLocaleString()} rows detected</span>}
                                        </div>

                                        {/* Progress Bar */}
                                        {(file.status === 'uploading' || file.status === 'validating') && (
                                            <div className="space-y-1">
                                                <Progress value={file.progress} className="h-2" />
                                                <div className="text-xs text-muted-foreground">
                                                    {file.status === 'uploading' ? 'Uploading...' : 'Processing...'}
                                                </div>
                                            </div>
                                        )}

                                        {/* Error Message */}
                                        {file.status === 'error' && file.error && (
                                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                                                {file.error}
                                            </div>
                                        )}

                                        {/* Success Details */}
                                        {file.status === 'success' && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) && (
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div className="p-3 bg-green-50 rounded border border-green-200">
                                                    <div className="text-green-900 font-medium">Format</div>
                                                    <div className="text-green-700">
                                                        {file.name.endsWith('.xlsx') ? 'Excel (.xlsx)' :
                                                            file.name.endsWith('.xls') ? 'Excel (.xls)' : 'CSV'}
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-green-50 rounded border border-green-200">
                                                    <div className="text-green-900 font-medium">Status</div>
                                                    <div className="text-green-700">Ready</div>
                                                </div>
                                                <div className="p-3 bg-green-50 rounded border border-green-200">
                                                    <div className="text-green-900 font-medium">Size</div>
                                                    <div className="text-green-700">{file.size}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveFile(file.id)}
                                        disabled={file.status === 'uploading' || file.status === 'validating'}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4">
                <div></div> {/* Spacer */}
                <Button
                    size="lg"
                    onClick={() => {
                        toast.success("Proceeding to mapper...");
                        setTimeout(() => onNavigate('mapper'), 500);
                    }}
                    disabled={successCount === 0}
                >
                    Proceed to Mapping
                    <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
    );
}
