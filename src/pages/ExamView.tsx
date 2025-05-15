
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRequireAuth } from '@/hooks/useRequireAuth';

interface ExamData {
  id: string;
  title: string;
  class_id: string;
  created_at: string;
  status?: string;
  instructions?: string;
}

const ExamView: React.FC = () => {
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();
  const { user } = useRequireAuth();
  const [exam, setExam] = useState<ExamData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (examId && user) {
      fetchExam();
    }
  }, [examId, user]);

  const fetchExam = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single();

      if (error) throw error;
      
      setExam(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load exam",
        variant: "destructive",
      });
      console.error("Error loading exam:", error);
      navigate('/classes');
    } finally {
      setIsLoading(false);
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
    <div className="max-w-3xl mx-auto">
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

      {exam.instructions && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{exam.instructions}</div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Exam Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Status:</strong> {exam.status || 'In Progress'}</p>
            <p><strong>Created:</strong> {new Date(exam.created_at).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-sm text-muted-foreground">
        Created: {new Date(exam.created_at).toLocaleString()}
      </div>
    </div>
  );
};

export default ExamView;
