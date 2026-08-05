'use client';

import { createIncident } from "@/app/actions";
import { useFormStatus } from "react-dom";
import { useEffect, useState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      disabled={pending}
      className="w-full bg-blue-900 text-white py-2 rounded-md hover:bg-blue-800 disabled:opacity-50 transition-colors"
    >
      {pending ? "Submitting..." : "Submit Report"}
    </button>
  );
}

export function CreateIncidentForm() {
  const [students, setStudents] = useState<any[]>([]);
  
  // In a real app, fetch students via an API route or server action prop
  // For brevity, this is a static placeholder structure
  useEffect(() => {
    // Fetch logic would go here
  }, []);

  return (
    <form action={createIncident} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Student</label>
        <select name="studentId" required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 border bg-white">
          <option value="">Select Student...</option>
          {/* Map students here */}
          <option value="demo-id">Demo Student (Add via DB)</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700">Category</label>
        <select name="category" required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 border bg-white">
          <option value="Bullying">Bullying</option>
          <option value="Welfare">Welfare Concern</option>
          <option value="Attendance">Attendance</option>
          <option value="Behavior">Behavior</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Severity</label>
        <select name="severity" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 border bg-white">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Title</label>
        <input name="title" type="text" required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 border" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Details</label>
        <textarea name="description" rows={4} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 border"></textarea>
      </div>

      <SubmitButton />
    </form>
  );
}
