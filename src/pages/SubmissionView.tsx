import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Loader2, CheckCircle, MessageSquare, Pencil } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import type { Tables, Json } from '@/integrations/supabase/types';

interface Comment {
  id: string;
  text: string;
  startOffset: number;
  endOffset: number;
  score?: number;
  category?: string;
  color?: string;
}

interface SubmissionData {
  id: string;
  student_id: string;
  exam_id: string;
  submission_text: string;
  grade: number | null;
  feedback: Json; // JSONB data
  submitted_at: string | null;
  // Joined data
  student_name?: string;
  student_email?: string;
  exam_title?: string;
  // Derived fields for UI
  status: 'not_started' | 'in_progress' | 'completed';
  graded_at?: string;
  comments: Comment[];
}

const SubmissionView: React.FC = () => {
  const navigate = useNavigate();
  const { submissionId } = useParams<{ submissionId: string }>();
  const { user } = useRequireAuth();
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeComment, setActiveComment] = useState<Comment | null>(null);
  
  useEffect(() => {
    if (submissionId && user) {
      fetchSubmission();
    }
  }, [submissionId, user]);

  const fetchSubmission = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          students(
            id,
            name,
            email
          ),
          exams(
            id,
            title
          )
        `)
        .eq('id', submissionId)
        .single();
      
  
        if (!data) {
          throw new Error('Submission not found');
        }

        // Parse feedback
        let comments: Comment[] = [];
        let graded_at: string | undefined;

        if (data && data.feedback) {
          try {
            // Parse feedback - it's simply an array of comment objects
            comments = typeof data.feedback === "string" 
              ? JSON.parse(data.feedback) 
              : data.feedback;
            
            // Ensure comments is an array
            if (!Array.isArray(comments)) {
              comments = [];
            }
          } catch (e) {
            console.warn('Failed to parse feedback JSON:', e);
            comments = [];
          }
        }

        // Determine status based on grade
        const status: 'not_started' | 'in_progress' | 'completed' = 
          data.grade !== null ? 'completed' : 'not_started';

        setSubmission({
          id: data.id,
          student_id: data.student_id,
          exam_id: data.exam_id,
          submission_text: data.submission_text,
          grade: data.grade,
          feedback: data.feedback,
          submitted_at: data.submitted_at,
          student_name: data.students?.name || `Student ${data.student_id}`,
          student_email: data.students?.email,
          exam_title: data.exams?.title || 'Unknown Exam',
          status,
          graded_at,
          comments: comments,
        });
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: "Failed to load submission",
        variant: "destructive",
      });
      console.error("Full error details:", error);
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
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

  const renderEssayWithHighlights = () => {
    if (!submission) return null;
    
    const { submission_text, comments } = submission;
    const segments: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Sort comments by startOffset to process them in order
    const sortedComments = [...comments].sort((a, b) => a.startOffset - b.startOffset);
    
    for (const comment of sortedComments) {
      // Add non-highlighted text before this comment
      if (comment.startOffset > lastIndex) {
        segments.push(
          <span key={`text-${lastIndex}`}>{submission_text.substring(lastIndex, comment.startOffset)}</span>
        );
      }
      
      // Add highlighted text for this comment
      segments.push(
        <span 
          key={`highlight-${comment.id}`}
          className={`bg-yellow-50 cursor-pointer hover:bg-yellow-100 transition-colors`}
          style={{ backgroundColor: comment.color || '#fef3c7' }}
          onClick={() => setActiveComment(comment)}
        >
          {submission_text.substring(comment.startOffset, comment.endOffset)}
        </span>
      );
      
      lastIndex = comment.endOffset;
    }
    
    // Add any remaining text after the last comment
    if (lastIndex < submission_text.length) {
      segments.push(
        <span key={`text-end`}>{submission_text.substring(lastIndex)}</span>
      );
    }
    
    return (
      <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed">
        {segments}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-rubric-navy" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-10">
        <p>Submission not found.</p>
        <Button 
          onClick={() => navigate('/dashboard')}
          className="mt-4"
        >
          Back to Dashboard
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
          onClick={() => navigate(`/exams/${submission.exam_id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-rubric-navy">
            {submission.exam_title || 'Student Submission'}
          </h1>
          <p className="text-muted-foreground">
            {submission.student_name} • Submitted {submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : 'Unknown date'}
          </p>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="min-h-[80vh] border rounded-lg">
        {/* Essay Content Panel (2/3) */}
        <ResizablePanel defaultSize={66}>
          <div className="h-full p-6 overflow-auto">
            <div className="space-y-4">
              {submission.submission_text ? (
                renderEssayWithHighlights()
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>No submission text available.</p>
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle />
        
        {/* Grading & Comments Panel (1/3) */}
        <ResizablePanel defaultSize={34}>
          <div className="h-full flex flex-col">
            <Tabs defaultValue="submission" className="w-full">
              <div className="px-4 pt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="submission" className="flex-1">Submission</TabsTrigger>
                  <TabsTrigger value="comments" className="flex-1">Comments</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="submission" className="flex-grow overflow-auto p-4 space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Grading Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(submission.status)}
                      </div>
                      <div className="space-y-2">
                        <Progress value={submission.status === 'completed' ? 100 : 0} className="h-2" />
                        <p className="text-sm text-muted-foreground">
                          {submission.status === 'completed' 
                            ? 'Grading completed' 
                            : 'Grading not started'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Grade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold">{submission.grade !== null ? `${submission.grade}%` : '-'}</span>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Grade
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Submission Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Student:</dt>
                        <dd className="font-medium">{submission.student_name}</dd>
                      </div>
                      {submission.student_email && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Email:</dt>
                          <dd className="text-sm">{submission.student_email}</dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Submitted:</dt>
                        <dd>{submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : 'Unknown'}</dd>
                      </div>
                      {submission.graded_at && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Graded:</dt>
                          <dd>{new Date(submission.graded_at).toLocaleString()}</dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="comments" className="flex-grow overflow-auto p-4">
                <div className="space-y-4">
                  {activeComment ? (
                    <div className="space-y-4">
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="flex justify-between items-start mb-2">
                          {activeComment.category && <Badge>{activeComment.category}</Badge>}
                          {activeComment.score && (
                            <div className="flex items-center">
                              <span className="text-sm font-medium mr-1">Score:</span>
                              <span className="text-sm">{activeComment.score}/5</span>
                            </div>
                          )}
                        </div>
                        <p>{activeComment.text}</p>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setActiveComment(null)}
                      >
                        ← Back to all comments
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">All Comments</h3>
                        <Badge variant="outline">{submission.comments.length}</Badge>
                      </div>
                      
                      {submission.comments.length > 0 ? (
                        <div className="space-y-3">
                          {submission.comments.map((comment) => (
                            <div 
                              key={comment.id} 
                              className="p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors"
                              onClick={() => setActiveComment(comment)}
                            >
                              <div className="flex justify-between items-start mb-1">
                                {comment.category && <Badge variant="outline">{comment.category}</Badge>}
                                {comment.score && <span className="text-sm">{comment.score}/5</span>}
                              </div>
                              <p className="text-sm line-clamp-2">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No comments yet</p>
                          <p className="text-sm">Comments will appear here as the submission is graded</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default SubmissionView; 