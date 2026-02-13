"use client"

import { useState, useEffect, useCallback } from 'react';
import { Upload, File as FileIcon, CheckCircle2, XCircle, AlertCircle, FileSpreadsheet, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [deletingIds, setDeletingIds] = useState<string[]>([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [selectedFileType, setSelectedFileType] = useState<string>("gl_detail");

    // Initial fetch of files
    useEffect(() => {
        fetchFiles();
    }, [dealId]);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
            const res = await fetch(`${backendUrl}/api/v1/deals/${dealId}/files`);
            if (!res.ok) throw new Error('Failed to fetch files');

            const data = await res.json();

            // Transform API data to UI state
            const mappedFiles: FileItem[] = data.map((f: any) => ({
                id: f.id,
                name: f.original_filename || f.filename,
                size: formatSize(f.file_size_bytes || f.file_size),
                status: f.status === 'processing' ? 'validating' : f.status === 'completed' ? 'success' : 'success', // Treat pending as success for now
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
                // Create XHR for tracking progress
                const xhr = new XMLHttpRequest();
                const formData = new FormData();
                formData.append('file', file);

                const uploadPromise = new Promise<any>((resolve, reject) => {
                    xhr.upload.addEventListener('progress', (event) => {
                        if (event.lengthComputable) {
                            const percentComplete = (event.loaded / event.total) * 100;
                            // Cap at 90% until server confirms
                            const smoothProgress = Math.min(percentComplete, 95);

                            setFiles(prev => prev.map(f =>
                                f.id === uiFile.id ? {
                                    ...f,
                                    progress: smoothProgress,
                                    status: smoothProgress >= 95 ? 'validating' : 'uploading'
                                } : f
                            ));
                        }
                    });

                    xhr.addEventListener('load', () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                const response = JSON.parse(xhr.responseText);
                                resolve(response);
                            } catch (e) {
                                reject(new Error('Invalid response'));
                            }
                        } else {
                            try {
                                const error = JSON.parse(xhr.responseText);
                                reject(new Error(error.error || 'Upload failed'));
                            } catch {
                                reject(new Error('Upload failed'));
                            }
                        }
                    });

                    xhr.addEventListener('error', () => reject(new Error('Network error')));
                    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
                    xhr.open('POST', `${backendUrl}/api/v1/deals/${dealId}/files?file_type=${selectedFileType}`);
                    xhr.send(formData);
                });

                const dbFile = await uploadPromise;

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

    const handleDelete = async (id: string, event?: React.MouseEvent) => {
        if (event) event.stopPropagation();

        // If it's a temp ID (upload failed), just remove from UI
        if (id.length < 10) {
            setFiles(prev => prev.filter(f => f.id !== id));
            return;
        }

        setDeletingIds(prev => [...prev, id]);

        try {
            const res = await fetch(`/api/deals/${dealId}/files/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setFiles(prev => prev.filter(f => f.id !== id));
                setSelectedIds(prev => prev.filter(sid => sid !== id));
                toast.success('File removed');
            } else {
                toast.error('Failed to remove file');
            }
        } catch {
            toast.error('Error removing file');
        } finally {
            setDeletingIds(prev => prev.filter(did => did !== id));
        }
    };

    const handleBulkDelete = async () => {
        const idsToDelete = selectedIds.length > 0 ? selectedIds : files.map(f => f.id);

        if (idsToDelete.length === 0) return;

        if (!confirm(`Are you sure you want to delete ${idsToDelete.length} files?`)) return;

        setIsBulkDeleting(true);
        setDeletingIds(idsToDelete);

        try {
            // Since we don't have a bulk delete endpoint, we'll do it in parallel
            await Promise.all(idsToDelete.map(id =>
                fetch(`/api/deals/${dealId}/files/${id}`, { method: 'DELETE' })
            ));

            setFiles(prev => prev.filter(f => !idsToDelete.includes(f.id)));
            setSelectedIds([]);
            toast.success(`Deleted ${idsToDelete.length} files`);
        } catch (error) {
            console.error('Bulk delete failed:', error);
            toast.error('Some files could not be deleted');
            // Refresh logic to ensure state matches server
            fetchFiles();
        } finally {
            setIsBulkDeleting(false);
            setDeletingIds([]);
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
                return <FileIcon className="w-5 h-5 text-muted-foreground" />;
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
    const allSelected = files.length > 0 && selectedIds.length === files.length;

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
                            <FileIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-muted-foreground">--</div>
                            <div className="text-xs text-muted-foreground">Total Rows</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* File Type Selection */}
            <div className="flex items-center gap-4">
                <div className="text-sm font-medium">File Type:</div>
                <Select value={selectedFileType} onValueChange={setSelectedFileType}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select file type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="monthly_pl">Monthly P&L</SelectItem>
                        <SelectItem value="monthly_bs">Monthly Balance Sheet</SelectItem>
                        <SelectItem value="gl_detail">GL Detail</SelectItem>
                        <SelectItem value="trial_balance">Trial Balance</SelectItem>
                    </SelectContent>
                </Select>
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

            {/* Uploaded Files List */}
            {files.length > 0 && (
                <Card>
                    <div className="p-4 border-b flex items-center justify-between bg-muted/40">
                        <div className="flex items-center gap-4">
                            <Checkbox
                                checked={allSelected}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        setSelectedIds(files.map(f => f.id));
                                    } else {
                                        setSelectedIds([]);
                                    }
                                }}
                            />
                            <h3 className="font-semibold text-sm">
                                {selectedIds.length > 0 ? `${selectedIds.length} Selected` : `Uploaded Files (${files.length})`}
                            </h3>
                        </div>

                        {(selectedIds.length > 0 || files.length > 0) && (
                            <Button
                                variant={selectedIds.length > 0 ? "destructive" : "outline"}
                                size="sm"
                                onClick={handleBulkDelete}
                                disabled={isBulkDeleting}
                            >
                                {isBulkDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                {selectedIds.length > 0 ? `Delete Selected (${selectedIds.length})` : "Delete All"}
                            </Button>
                        )}
                    </div>

                    <div className="divide-y max-h-[500px] overflow-auto">
                        {files.map((file) => {
                            const isDeleting = deletingIds.includes(file.id);
                            return (
                                <div
                                    key={file.id}
                                    className={cn(
                                        "p-6 hover:bg-muted/50 transition-colors cursor-pointer",
                                        selectedIds.includes(file.id) && "bg-muted/30"
                                    )}
                                    onClick={() => {
                                        if (selectedIds.includes(file.id)) {
                                            setSelectedIds(prev => prev.filter(id => id !== file.id));
                                        } else {
                                            setSelectedIds(prev => [...prev, file.id]);
                                        }
                                    }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex items-center h-full pt-1" onClick={e => e.stopPropagation()}>
                                            <Checkbox
                                                checked={selectedIds.includes(file.id)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedIds(prev => [...prev, file.id]);
                                                    } else {
                                                        setSelectedIds(prev => prev.filter(id => id !== file.id));
                                                    }
                                                }}
                                            />
                                        </div>

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
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                        <span>
                                                            {file.status === 'uploading'
                                                                ? `Uploading ${Math.round(file.progress)}%`
                                                                : 'Processing on server...'}
                                                        </span>
                                                        {file.status === 'uploading' && (
                                                            <span>{Math.round(file.progress)}%</span>
                                                        )}
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
                                            onClick={(e) => handleDelete(file.id, e)}
                                            disabled={file.status === 'uploading' || file.status === 'validating' || isDeleting}
                                        >
                                            {isDeleting ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                                            ) : (
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
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
