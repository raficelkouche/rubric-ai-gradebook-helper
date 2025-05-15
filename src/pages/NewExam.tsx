
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const examFormSchema = z.object({
  title: z.string().min(1, { message: "Exam title is required" }),
  instructions: z.string().optional(),
});

type ExamFormValues = z.infer<typeof examFormSchema>;

const NewExam: React.FC = () => {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const { user } = useRequireAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      title: '',
      instructions: '',
    },
  });

  const onSubmit = async (values: ExamFormValues) => {
    if (!user || !classId) return;
    
    setIsLoading(true);
    try {
      // Insert the exam into the exams table
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .insert([
          { 
            title: values.title,
            class_id: classId,
            instructions: values.instructions,
          }
        ])
        .select();
      
      if (examError) throw examError;
      
      toast({
        title: "Exam created",
        description: `${values.title} has been created successfully.`,
      });
      
      navigate(`/classes/${classId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create exam",
        variant: "destructive",
      });
      console.error("Error creating exam:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(`/classes/${classId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-rubric-navy">Create New Exam</h1>
      </div>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Exam Details</CardTitle>
              <CardDescription>
                Enter the information for your new exam.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Midterm Exam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Instructions for students taking this exam..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate(`/classes/${classId}`)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-rubric-navy hover:bg-rubric-navy-light"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Exam"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default NewExam;
