import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusIcon, ArrowLeft, Loader2, UserPlus } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Tables } from '@/integrations/supabase/types';

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

type Student = Tables<'students'>;

const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useRequireAuth();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [exams, setExams] = useState<ExamData[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateStudentOpen, setIsCreateStudentOpen] = useState(false);
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
  });

  // Form validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const isFormValid = () => {
    const name = studentForm.name.trim();
    const email = studentForm.email.trim();
    return name.length > 0 && email.length > 0 && isValidEmail(email);
  };

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

      // Fetch students for this class
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', id)
        .order('name', { ascending: true });

      if (studentsError) throw studentsError;
      
      setClassData(classDetails);
      setExams(examsData || []);
      setStudents(studentsData || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
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

  const handleCreateStudent = async () => {
    // Use the validation function instead of inline checks
    if (!isFormValid()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both name and email fields with valid information",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreatingStudent(true);

      const { data, error } = await supabase
        .from('students')
        .insert({
          name: studentForm.name.trim(),
          email: studentForm.email.trim().toLowerCase(),
          class_id: id!,
        })
        .select()
        .single();

      if (error) {
        // Handle unique constraint violation
        if (error.code === '23505') {
          if (error.message.includes('email')) {
            toast({
              title: "Email Already Exists",
              description: "A student with this email address already exists in the system. Please use a different email address.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Duplicate Entry",
              description: "This student information already exists. Please check the details and try again.",
              variant: "destructive",
            });
          }
        } else {
          // Handle other database errors
          toast({
            title: "Database Error",
            description: error.message || "Failed to create student. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      // Success - add student to local state and reset form
      setStudents(prev => [...prev, data]);
      setStudentForm({ name: '', email: '' });
      setIsCreateStudentOpen(false);
      
      toast({
        title: "Student Created",
        description: `${data.name} has been successfully added to the class.`,
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: `Failed to create student: ${errorMessage}`,
        variant: "destructive",
      });
      console.error("Error creating student:", error);
    } finally {
      setIsCreatingStudent(false);
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

      {/* Students Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Students</h2>
        <Dialog open={isCreateStudentOpen} onOpenChange={setIsCreateStudentOpen}>
          <DialogTrigger asChild>
            <Button className="bg-rubric-navy hover:bg-rubric-navy-light">
              <UserPlus className="mr-2 h-4 w-4" /> Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Add a new student to {classData.name}. Make sure to use a unique email address.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="student-name" className="text-right">
                  Name *
                </Label>
                <div className="col-span-3">
                  <Input
                    id="student-name"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter student's full name"
                    className={studentForm.name.trim().length === 0 && studentForm.name !== '' ? 'border-red-500' : ''}
                  />
                  {studentForm.name.trim().length === 0 && studentForm.name !== '' && (
                    <p className="text-sm text-red-500 mt-1">Name is required</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="student-email" className="text-right">
                  Email *
                </Label>
                <div className="col-span-3">
                  <Input
                    id="student-email"
                    type="email"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter student's email address"
                    className={studentForm.email.trim().length > 0 && !isValidEmail(studentForm.email) ? 'border-red-500' : ''}
                  />
                  {studentForm.email.trim().length > 0 && !isValidEmail(studentForm.email) && (
                    <p className="text-sm text-red-500 mt-1">Please enter a valid email address</p>
                  )}
                  {studentForm.email.trim().length === 0 && studentForm.email !== '' && (
                    <p className="text-sm text-red-500 mt-1">Email is required</p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateStudentOpen(false);
                  setStudentForm({ name: '', email: '' });
                }}
                disabled={isCreatingStudent}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateStudent}
                disabled={isCreatingStudent || !isFormValid()}
                className="bg-rubric-navy hover:bg-rubric-navy-light disabled:opacity-50"
              >
                {isCreatingStudent ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Student'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Students ({students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{new Date(student.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No students found. Add students to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exams Section */}
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
