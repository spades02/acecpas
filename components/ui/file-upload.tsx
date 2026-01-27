"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, File, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface UploadedFile {
    id: string
    filename: string
    size: number
    type: string
    url: string
    storagePath: string
}

interface FileUploadProps {
    token: string
    itemId: string
    onUploadComplete?: (file: UploadedFile) => void
    maxFiles?: number
}

const ALLOWED_EXTENSIONS = ['pdf', 'xls', 'xlsx', 'csv', 'png', 'jpg', 'jpeg', 'gif', 'webp']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export function FileUpload({ token, itemId, onUploadComplete, maxFiles = 5 }: FileUploadProps) {
    const [files, setFiles] = useState<UploadedFile[]>([])
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const validateFile = (file: File): string | null => {
        const ext = file.name.split('.').pop()?.toLowerCase()
        if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
            return `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`
        }
        if (file.size > MAX_SIZE) {
            return 'File too large. Maximum size is 10MB.'
        }
        return null
    }

    const uploadFile = async (file: File) => {
        const validationError = validateFile(file)
        if (validationError) {
            setError(validationError)
            return
        }

        if (files.length >= maxFiles) {
            setError(`Maximum ${maxFiles} files allowed`)
            return
        }

        setError(null)
        setUploading(true)
        setUploadProgress(0)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('itemId', itemId)

            // Simulate progress (since fetch doesn't support upload progress)
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90))
            }, 200)

            const res = await fetch(`/api/portal/${token}/upload`, {
                method: 'POST',
                body: formData
            })

            clearInterval(progressInterval)
            setUploadProgress(100)

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Upload failed')
            }

            const uploadedFile: UploadedFile = {
                id: data.file.id || Date.now().toString(),
                filename: data.file.filename,
                size: data.file.size,
                type: data.file.type,
                url: data.file.url,
                storagePath: data.file.storagePath
            }

            setFiles([...files, uploadedFile])
            onUploadComplete?.(uploadedFile)

        } catch (err) {
            console.error('Upload error:', err)
            setError(err instanceof Error ? err.message : 'Upload failed')
        } finally {
            setUploading(false)
            setUploadProgress(0)
        }
    }

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            uploadFile(e.dataTransfer.files[0])
        }
    }, [files])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            uploadFile(e.target.files[0])
        }
    }

    const removeFile = (fileId: string) => {
        setFiles(files.filter(f => f.id !== fileId))
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const getFileIcon = (type: string) => {
        if (type.includes('image')) return '🖼️'
        if (type.includes('pdf')) return '📄'
        if (type.includes('excel') || type.includes('spreadsheet')) return '📊'
        if (type.includes('csv')) return '📋'
        return '📁'
    }

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={handleChange}
                    accept={ALLOWED_EXTENSIONS.map(e => `.${e}`).join(',')}
                    disabled={uploading}
                />

                {uploading ? (
                    <div className="space-y-3">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                        <div className="text-sm font-medium">Uploading...</div>
                        <Progress value={uploadProgress} className="h-2 max-w-xs mx-auto" />
                    </div>
                ) : (
                    <>
                        <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                        <div className="text-sm font-medium">
                            {dragActive ? 'Drop file here' : 'Drag files here or click to browse'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            PDF, Excel, CSV, Images (Max 10MB per file)
                        </div>
                    </>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* Uploaded Files */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase">
                        Uploaded Files ({files.length}/{maxFiles})
                    </div>
                    {files.map(file => (
                        <div
                            key={file.id}
                            className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                        >
                            <span className="text-xl">{getFileIcon(file.type)}</span>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{file.filename}</div>
                                <div className="text-xs text-muted-foreground">
                                    {formatFileSize(file.size)}
                                </div>
                            </div>
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    removeFile(file.id)
                                }}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
