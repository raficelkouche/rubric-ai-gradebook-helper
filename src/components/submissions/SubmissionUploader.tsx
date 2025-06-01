import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { UploadCloud, File, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import StudentSelect from '@/components/common/StudentSelect';

interface FileWithPreview extends File {
  preview?: string;
  progress?: number;
  error?: string;
  success?: boolean;
}

interface SubmissionUploaderProps {
  examId: string;
  classId?: string;
  onUploadComplete?: () => void;
}

const SubmissionUploader: React.FC<SubmissionUploaderProps> = ({ 
  examId, 
  classId,
  onUploadComplete 
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        progress: 0,
      })
    );
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
    },
    maxSize: 10485760, // 10MB
    multiple: false, // Only allow one file at a time since we're associating it with one student
  });

  const removeFile = (index: number) => {
    setFiles(files => {
      const newFiles = [...files];
      // Revoke object URL to avoid memory leaks
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const parseFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          resolve(content.trim());
        } catch (error) {
          reject(new Error('Failed to parse file content.'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      if (file.type === 'application/pdf') {
        // For demo purposes, we'll use a placeholder for PDF parsing
        // In a real app, you would use a PDF parsing library like pdf-parse
        resolve('This is a placeholder for PDF content that would be extracted using a PDF parser library like pdf-parse or PDF.js.');
      } else {
        reader.readAsText(file);
      }
    });
  };

  const updateFileProgress = (index: number, progress: number) => {
    setFiles(files => {
      const newFiles = [...files];
      newFiles[index] = { ...newFiles[index], progress };
      return newFiles;
    });
  };

  const setFileError = (index: number, error: string) => {
    setFiles(files => {
      const newFiles = [...files];
      newFiles[index] = { ...newFiles[index], error, success: false };
      return newFiles;
    });
  };

  const setFileSuccess = (index: number) => {
    setFiles(files => {
      const newFiles = [...files];
      newFiles[index] = { ...newFiles[index], success: true, progress: 100 };
      return newFiles;
    });
  };

  const handleStudentSelect = (studentId: string, studentName: string) => {
    setSelectedStudentId(studentId);
    setSelectedStudentName(studentName);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!selectedStudentId) {
      toast({
        title: "No student selected",
        description: "Please select a student before uploading",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    let allSucceeded = true;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Update progress to show parsing has started
          updateFileProgress(i, 10);
          
          // Parse the file to extract content
          const content = await parseFile(file);
          
          // Update progress after parsing
          updateFileProgress(i, 50);
          
          // Save to Supabase
          const { error } = await supabase
            .from('submissions')
            .insert({
              exam_id: examId,
              student_id: selectedStudentId,
              submission_text: content,
              submitted_at: new Date().toISOString(),
              feedback: {
                comments: [],
                status: 'in_progress',
                graded_at: null,
              },
            });
          
          if (error) {
            throw error;
          }
          
          // Mark file as successfully uploaded
          setFileSuccess(i);
          
        } catch (error) {
          allSucceeded = false;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          setFileError(i, errorMessage);
          console.error(`Error uploading ${file.name}:`, error);
        }
      }

      if (allSucceeded) {
        toast({
          title: "Upload complete",
          description: `Submission uploaded successfully for ${selectedStudentName}`,
        });
        
        // Trigger callback to refresh data
        if (onUploadComplete) {
          onUploadComplete();
        }
        
        // Clear files and selection after a successful upload
        setTimeout(() => {
          setFiles([]);
          setSelectedStudentId('');
          setSelectedStudentName('');
        }, 2000);
      } else {
        toast({
          title: "Upload failed",
          description: "The submission could not be uploaded. Check the error message for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload submission. Please try again.",
        variant: "destructive",
      });
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const canUpload = files.length > 0 && selectedStudentId && !isUploading;

  return (
    <div className="space-y-6">
      {/* Student Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Student</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="student-select">Choose the student for this submission:</Label>
            <StudentSelect
              value={selectedStudentId}
              onValueChange={handleStudentSelect}
              classId={classId}
              examId={examId}
              placeholder="Select a student..."
              disabled={isUploading}
            />
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Submission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 ${
              isDragActive ? 'border-rubric-blue bg-blue-50' : 'border-gray-300'
            } cursor-pointer transition-colors text-center ${
              !selectedStudentId ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <input {...getInputProps()} disabled={!selectedStudentId} />
            <div className="flex flex-col items-center">
              <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                {!selectedStudentId
                  ? "Please select a student first"
                  : isDragActive
                  ? "Drop the file here..."
                  : "Drag 'n' drop a PDF or TXT file here, or click to select"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Maximum file size: 10MB
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center p-3 border rounded-lg">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-gray-100 mr-3">
                    <File className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div className="text-sm font-medium overflow-hidden whitespace-nowrap text-ellipsis max-w-xs">
                        {file.name}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex-1 mr-3">
                        <Progress value={file.progress} className="h-1" />
                      </div>
                      {file.error ? (
                        <div className="flex items-center text-red-500 text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          <span className="max-w-[150px] truncate">{file.error}</span>
                        </div>
                      ) : file.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(0)}KB
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {files.length > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={handleUpload}
                disabled={!canUpload}
                className="flex items-center"
              >
                {isUploading ? 'Uploading...' : 'Upload Submission'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmissionUploader; 