import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, 
  Loader2, 
  MoreHorizontal, 
  CheckCircle, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import SubmissionUploader from '@/components/submissions/SubmissionUploader';
import type { Tables, Json } from '@/integrations/supabase/types';

interface ExamData {
  id: string;
  title: string;
  class_id: string;
  created_at: string;
  status?: string;
  instructions?: string;
  total_submissions?: number;
  graded_submissions?: number;
  remaining_submissions?: number;
}

interface SubmissionData {
  id: string;
  student_name: string;
  student_id: string;
  student_email?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  grade: number | null;
  submitted_at: string | null;
  graded_at?: string;
  grading_progress: number;
  feedback?: Json;
}

const ExamView: React.FC = () => {
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();
  const { user } = useRequireAuth();
  const [exam, setExam] = useState<ExamData | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [overrideGrade, setOverrideGrade] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionData | null>(null);
  const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);

      const fetchSubmissions = useCallback(async () => {
        if (!examId) return;
        try {
          const { data: initialData, error } = await supabase
            .from("submissions")
            .select(
              `
          *,
          students(
            id,
            name,
            email
          )
        `
            )
            .eq("exam_id", examId);

          const data = initialData;

          if (!data || data.length === 0) {
            setSubmissions([]);
            setExam((prev) =>
              prev
                ? {
                    ...prev,
                    total_submissions: 0,
                    graded_submissions: 0,
                    remaining_submissions: 0,
                  }
                : null
            );
            return;
          }

          // Transform the data to match our interface
          const transformedSubmissions: SubmissionData[] = data.map(
            (submission) => {
              // Determine status based on grade and feedback
              let status: "not_started" | "in_progress" | "completed" =
                "not_started";
              let grading_progress = 0;
              let graded_at: string | undefined;

              if (submission.feedback) {
                try {
                  const feedbackData =
                    typeof submission.feedback === "string"
                      ? JSON.parse(submission.feedback)
                      : submission.feedback;

                  status =
                    feedbackData.status ||
                    (submission.grade !== null ? "completed" : "in_progress");
                  graded_at = feedbackData.graded_at;
                } catch (e) {
                  console.warn("Failed to parse feedback JSON:", e);
                }
              }

              // If we have a grade but no status, assume completed
              if (submission.grade !== null && status === "not_started") {
                status = "completed";
              }

              // Set grading progress based on status
              if (status === "completed") {
                grading_progress = 100;
              } else if (status === "in_progress") {
                grading_progress = 60; // Arbitrary progress for in-progress
              }

              return {
                id: submission.id,
                student_name:
                submission.students?.name,
                student_id: submission.student_id,
                student_email: submission.students?.email,
                status,
                grade: submission.grade,
                submitted_at: submission.submitted_at,
                graded_at,
                grading_progress,
                feedback: submission.feedback,
              };
            }
          );

          setSubmissions(transformedSubmissions);

          // Update exam stats
          const total = transformedSubmissions.length;
          const graded = transformedSubmissions.filter(
            (s) => s.status === "completed"
          ).length;
          const remaining = total - graded;

          setExam((prev) =>
            prev
              ? {
                  ...prev,
                  total_submissions: total,
                  graded_submissions: graded,
                  remaining_submissions: remaining,
                }
              : null
          );
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          console.error("Error loading submissions:", errorMessage);
          toast({
            title: "Error",
            description: "Failed to load submissions",
            variant: "destructive",
          });
        }
      }, [examId])
  
    
  
  const fetchExam = useCallback(async () => {
    if (!examId) return;
    
    try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("exams")
          .select("*")
          .eq("id", examId)
          .single();

        if (error) throw error;

        setExam(data);

        // Fetch submissions after exam is loaded
        await fetchSubmissions();

      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        toast({
          title: "Error",
          description: "Failed to load exam",
          variant: "destructive",
        });
        console.error("Error loading exam:", errorMessage);
        navigate("/classes");
      } finally {
        setIsLoading(false);
      }
    }, [examId, fetchSubmissions, navigate])


  
  useEffect(() => {
      fetchExam();
  }, [fetchExam]);



  const handleOverrideGrade = async () => {
    if (!selectedSubmission) return;
    
    try {
      // Prepare the feedback object - safely handle the Json type
      let updatedFeedback: Json = {
        status: 'completed',
        graded_at: new Date().toISOString(),
      };

      // If there's existing feedback, try to merge it
      if (selectedSubmission.feedback && typeof selectedSubmission.feedback === 'object' && selectedSubmission.feedback !== null) {
        updatedFeedback = {
          ...(selectedSubmission.feedback as Record<string, unknown>),
          status: 'completed',
          graded_at: new Date().toISOString(),
        };
      }

      // Update the grade in the database
      const { error } = await supabase
        .from('submissions')
        .update({ 
          grade: Number(overrideGrade),
          feedback: updatedFeedback
        })
        .eq('id', selectedSubmission.id);

      if (error) throw error;

      // Update local state
      const updatedSubmissions = submissions.map(sub => {
        if (sub.id === selectedSubmission.id) {
          return {
            ...sub,
            grade: Number(overrideGrade),
            status: 'completed' as const,
            graded_at: new Date().toISOString(),
            grading_progress: 100
          };
        }
        return sub;
      });
      
      setSubmissions(updatedSubmissions);
      setIsOverrideDialogOpen(false);
      setOverrideGrade('');
      setSelectedSubmission(null);
      
      toast({
        title: "Grade Updated",
        description: "The grade has been successfully updated."
      });

      // Refresh exam stats
      fetchSubmissions();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: "Failed to update grade",
        variant: "destructive",
      });
      console.error("Error updating grade:", errorMessage);
    }
  };

  const getStatusBadge = (status: SubmissionData['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'not_started':
        return <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: SubmissionData['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'not_started':
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-rubric-navy" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-10">
        <p>Exam not found.</p>
        <Button 
          onClick={() => navigate('/classes')}
          className="mt-4"
        >
          Back to Classes
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(`/classes/${exam.class_id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-rubric-navy">
          {exam.title}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Exam Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(exam.status as SubmissionData['status'] || 'in_progress')}
              <span className="text-xl font-medium">
                {exam.status ? exam.status.charAt(0).toUpperCase() + exam.status.slice(1).replace('_', ' ') : 'In Progress'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{exam.total_submissions || 0}</span>
              <span className="text-sm text-muted-foreground">Total submissions</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Grading Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{exam.graded_submissions || 0} Graded</span>
                <span>{exam.remaining_submissions || 0} Remaining</span>
              </div>
              <Progress 
                value={exam.total_submissions ? ((exam.graded_submissions || 0) / exam.total_submissions) * 100 : 0} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {exam.instructions && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{exam.instructions}</div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">Upload Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <SubmissionUploader 
            examId={examId || ''} 
            classId={exam.class_id}
            onUploadComplete={() => {
              fetchExam();
              fetchSubmissions();
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Student Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Grading Status</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Graded</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{submission.student_name}</div>
                        {submission.student_email && (
                          <div className="text-sm text-muted-foreground">{submission.student_email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(submission.status)}
                        <Progress value={submission.grading_progress} className="h-2 w-full" />
                      </div>
                    </TableCell>
                    <TableCell>
                      {submission.grade !== null ? `${submission.grade}%` : '—'}
                    </TableCell>
                    <TableCell>
                      {submission.submitted_at 
                        ? new Date(submission.submitted_at).toLocaleDateString()
                        : '—'
                      }
                    </TableCell>
                    <TableCell>
                      {submission.graded_at 
                        ? new Date(submission.graded_at).toLocaleDateString()
                        : '—'
                      }
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setOverrideGrade(submission.grade?.toString() || '');
                              setIsOverrideDialogOpen(true);
                            }}
                          >
                            Override Grade
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/submissions/${submission.id}`)}>
                            View Submission
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No submissions yet</p>
              <p className="text-sm">Submissions will appear here once students upload their work</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOverrideDialogOpen} onOpenChange={setIsOverrideDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override Grade</DialogTitle>
            <DialogDescription>
              Enter a new grade for {selectedSubmission?.student_name}'s submission.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="grade" className="text-right">
                Grade (%)
              </Label>
              <Input
                id="grade"
                type="number"
                min="0"
                max="100"
                value={overrideGrade}
                onChange={(e) => setOverrideGrade(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOverrideDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleOverrideGrade}>Save Grade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-6 text-sm text-muted-foreground">
        Exam created: {new Date(exam.created_at).toLocaleString()}
      </div>
    </div>
  );
};

export default ExamView;