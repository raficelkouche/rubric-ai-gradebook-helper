
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';

const NewClass: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    grade: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real app, we would send data to the backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Validate data
      if (!formData.name) {
        throw new Error("Class name is required");
      }

      toast({
        title: "Class created",
        description: `${formData.name} has been created successfully.`,
      });
      
      navigate('/classes');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create class";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
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
          onClick={() => navigate('/classes')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-rubric-navy">Create New Class</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Class Details</CardTitle>
            <CardDescription>
              Enter the information for your new class.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Class Name*</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Algebra 101"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="e.g., Mathematics"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grade">Grade Level</Label>
              <Input
                id="grade"
                name="grade"
                placeholder="e.g., 10th Grade, Freshman, etc."
                value={formData.grade}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe what this class is about..."
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate('/classes')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-rubric-navy hover:bg-rubric-navy-light"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Class"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default NewClass;
