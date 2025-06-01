import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Student = Tables<'students'>;

interface StudentSelectProps {
  value?: string;
  onValueChange: (studentId: string, studentName: string) => void;
  classId?: string;
  examId?: string;
  placeholder?: string;
  disabled?: boolean;
}

const StudentSelect: React.FC<StudentSelectProps> = ({
  value,
  onValueChange,
  classId,
  examId,
  placeholder = "Select student...",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [existingSubmissions, setExistingSubmissions] = useState<string[]>([]);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const fetchExistingSubmissions = useCallback(async () => {
    if (!examId) {
      setExistingSubmissions([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('student_id')
        .eq('exam_id', examId);

      if (error) throw error;

      const submittedStudentIds = data?.map(submission => submission.student_id) || [];
      setExistingSubmissions(submittedStudentIds);
    } catch (error: unknown) {
      console.error('Error fetching existing submissions:', error);
      setExistingSubmissions([]);
    }
  }, [examId]);

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);

      // Build the query for students table
      let query = supabase.from("students").select("*");

      // If classId is provided, filter students by class
      if (classId) {
        query = query.eq("class_id", classId);
      }

      const { data, error } = await query.order("name");

      if (error) {
        throw error;
      }

      setStudents(data || []);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load students";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error loading students:", error);
      // Set empty array on error
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, [classId]);
  
  useEffect(() => {
    fetchStudents();
    fetchExistingSubmissions();
  }, [fetchStudents, fetchExistingSubmissions]);


  const selectedStudent = students.find(student => student.id === value);

  // Filter out students who already have submissions
  const availableStudents = students.filter(student => 
    !existingSubmissions.includes(student.id)
  );

  const filteredStudents = availableStudents.filter(student =>
    student.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    student.email.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading students...
            </div>
          ) : selectedStudent ? (
            <div className="flex items-center justify-between w-full">
              <span>{selectedStudent.name}</span>
              <span className="text-sm text-muted-foreground">
                {selectedStudent.email}
              </span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0"
        style={{ width: triggerRef.current?.offsetWidth }}
      >
        <Command>
          <CommandInput
            placeholder="Search students..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {students.length === 0 
                ? "No students found in this class." 
                : availableStudents.length === 0
                ? "All students in this class have already submitted."
                : "No students match your search."}
            </CommandEmpty>
            <CommandGroup>
              {filteredStudents.map((student) => (
                <CommandItem
                  key={student.id}
                  value={`${student.name} ${student.email}`}
                  onSelect={() => {
                    onValueChange(student.id, student.name);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === student.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{student.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {student.email}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default StudentSelect; 