"use client";

import { createComplaintAction } from "@/data/complaints/complaints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

const categories = [
  { value: "infrastructure", label: "Infrastructure" },
  { value: "education", label: "Education" },
  { value: "health", label: "Health" },
  { value: "security", label: "Security" },
  { value: "environment", label: "Environment" },
  { value: "transportation", label: "Transportation" },
  { value: "utilities", label: "Utilities" },
  { value: "housing", label: "Housing" },
  { value: "employment", label: "Employment" },
  { value: "social_services", label: "Social Services" },
  { value: "legal", label: "Legal" },
  { value: "corruption", label: "Corruption" },
  { value: "other", label: "Other" },
];

export function ComplaintForm() {
  const [category, setCategory] = useState<string>("");

  const { execute, status, result } = useAction(createComplaintAction, {
    onSuccess: ({ data }) => {
      toast.success("Complaint submitted successfully!");
      // Reset form
      const form = document.getElementById("complaint-form") as HTMLFormElement;
      form?.reset();
      setCategory("");
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Failed to submit complaint");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    execute({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: category as any,
      governorate: formData.get("governorate") as string || null,
      district: formData.get("district") as string || null,
      address: formData.get("address") as string || null,
      citizen_phone: formData.get("citizen_phone") as string || null,
      citizen_email: formData.get("citizen_email") as string || null,
    });
  };

  const isLoading = status === "executing";

  return (
    <form id="complaint-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          name="title"
          placeholder="Brief description of the issue"
          required
          minLength={5}
          maxLength={200}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select
          value={category}
          onValueChange={setCategory}
          disabled={isLoading}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Provide detailed information about your complaint"
          required
          minLength={20}
          maxLength={5000}
          rows={6}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="governorate">Governorate</Label>
          <Input
            id="governorate"
            name="governorate"
            placeholder="e.g., Cairo"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="district">District</Label>
          <Input
            id="district"
            name="district"
            placeholder="e.g., Nasr City"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          placeholder="Specific location or address"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="citizen_phone">Phone Number</Label>
          <Input
            id="citizen_phone"
            name="citizen_phone"
            type="tel"
            placeholder="+20 123 456 7890"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="citizen_email">Email</Label>
          <Input
            id="citizen_email"
            name="citizen_email"
            type="email"
            placeholder="your.email@example.com"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading || !category}>
          {isLoading ? "Submitting..." : "Submit Complaint"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => {
            const form = document.getElementById("complaint-form") as HTMLFormElement;
            form?.reset();
            setCategory("");
          }}
        >
          Clear Form
        </Button>
      </div>

      {result?.data && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 font-medium">
            ✓ Complaint submitted successfully!
          </p>
          <p className="text-sm text-green-700 mt-1">
            Complaint ID: {result.data.complaint.id}
          </p>
        </div>
      )}
    </form>
  );
}

