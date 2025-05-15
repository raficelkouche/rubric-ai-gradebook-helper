
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusIcon, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface ClassData {
  id: string;
  name: string;
  created_at: string;
}

interface ExamData {
  id: string;
  title: string;
  created_at: string;
  status: string;
}

const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useRequireAuth();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [exams, setExams] = useState<ExamData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      fetchClassDetails();
    }
  }, [id, user]);

  const fetchClassDetails = async () => {
    try {
      setIsLoading(true);
      
      // Fetch class details
      const { data: classDetails, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', id)
        .single();

      if (classError) throw classError;
      
      // Fetch exams for this class
      const { data: examsData, error: examsError } = await supabase
        .from('exams')
        .select('*')
        .eq('class_id', id)
        .order('created_at', { ascending: false });

      if (examsError) throw examsError;
      
      setClassData(classDetails);
      setExams(examsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load class details",
        variant: "destructive",
      });
      console.error("Error loading class details:", error);
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

  if (!classData) {
    return (
      <div className="text-center py-10">
        <p>Class not found.</p>
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/classes')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-rubric-navy">{classData.name}</h1>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Exams</h2>
        <Button 
          onClick={() => navigate(`/classes/${id}/exams/new`)}
          className="bg-rubric-navy hover:bg-rubric-navy-light"
        >
          <PlusIcon className="mr-2 h-4 w-4" /> New Exam
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Exams</CardTitle>
        </CardHeader>
        <CardContent>
          {exams.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell>{new Date(exam.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{exam.status || "Draft"}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/exams/${exam.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No exams found. Create a new exam to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassDetail;
