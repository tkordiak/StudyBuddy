import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle, Edit2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const companyRoleSchema = z.object({
  company: z.string().min(2, "Company name must be at least 2 characters"),
  role: z.string().min(2, "Role must be at least 2 characters"),
  jobUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type CompanyRoleForm = z.infer<typeof companyRoleSchema>;

interface CompanyRoleFormProps {
  onSubmit: (data: CompanyRoleForm) => void;
  initialData?: Partial<CompanyRoleForm>;
  isCompleted: boolean;
  isEditable: boolean;
}

export function CompanyRoleForm({ 
  onSubmit, 
  initialData, 
  isCompleted, 
  isEditable 
}: CompanyRoleFormProps) {
  const [isEditing, setIsEditing] = useState(!isCompleted);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<CompanyRoleForm>({
    resolver: zodResolver(companyRoleSchema),
    defaultValues: {
      company: initialData?.company || "",
      role: initialData?.role || "",
      jobUrl: initialData?.jobUrl || "",
    },
    mode: "onChange",
  });

  const watchedValues = watch();

  const handleFormSubmit = (data: CompanyRoleForm) => {
    onSubmit(data);
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (isEditable) {
      setIsEditing(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Company & Role Details</CardTitle>
          {isCompleted && (
            <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="company">Target Company *</Label>
            <Input
              id="company"
              {...register("company")}
              placeholder="e.g., Google, Apple, Microsoft"
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
            {errors.company && (
              <p className="text-sm text-red-600 mt-1">{errors.company.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="role">Job Title/Role *</Label>
            <Input
              id="role"
              {...register("role")}
              placeholder="e.g., Senior Software Engineer, Product Manager"
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
            {errors.role && (
              <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="jobUrl">Job Description URL (Optional)</Label>
            <Input
              id="jobUrl"
              type="url"
              {...register("jobUrl")}
              placeholder="https://careers.company.com/jobs/123456"
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
            {errors.jobUrl && (
              <p className="text-sm text-red-600 mt-1">{errors.jobUrl.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              We'll analyze the job posting for better tailoring
            </p>
          </div>

          {isEditing ? (
            <Button 
              type="submit" 
              disabled={!isValid}
              className="w-full"
            >
              Continue to Resume Input
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={handleEdit}
              disabled={!isEditable}
              className="flex items-center"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
