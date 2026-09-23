"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Upload, Download, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { processCSV } from "./actions"
import { useRouter } from "next/navigation"

export default function ImportStudentsPage() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleDownloadTemplate = () => {
    const headers = "student_id,first_name,last_name,gender,date_of_birth,class_name,section,academic_year,father_name,mother_name,phone,email,address,city,state,pin_code,total_fee\n"
    const sample = "STU1001,John,Doe,Male,2010-05-15,Class 5,A,2024-2025,Robert Doe,Mary Doe,9876543210,john@example.com,123 Street,New York,NY,10001,15000\n"
    const blob = new Blob([headers + sample], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "student_import_template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUploading(true)
    setResult(null)

    const formData = new FormData(e.currentTarget)
    try {
      const res = await processCSV(formData)
      setResult(res)
      if (res.redirect) {
        setTimeout(() => {
          router.push("/admin/students")
        }, 2000)
      }
    } catch (err: any) {
      setResult({ error: "Something went wrong" })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/students">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Import Students</h2>
          <p className="text-slate-500">Upload a CSV file to add multiple students at once</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mass Upload</CardTitle>
          <CardDescription>
            Download the template, fill in your student data, and upload the CSV file here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-slate-50 border rounded-lg flex items-center justify-between">
            <div>
              <h3 className="font-medium text-slate-900">Step 1: Download Template</h3>
              <p className="text-sm text-slate-500">Includes all required columns and sample data.</p>
            </div>
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="w-4 h-4 mr-2" /> Download CSV
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
            <div>
              <h3 className="font-medium text-slate-900 mb-1">Step 2: Upload Data</h3>
              <p className="text-sm text-slate-500 mb-4">Select your completed CSV file.</p>
            </div>
            <Input 
              type="file" 
              name="file" 
              accept=".csv" 
              required 
              disabled={isUploading}
            />
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Import Students"}
              <Upload className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {result && (
            <div className={`p-4 rounded-lg ${result.error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
              <div className="flex items-start gap-2">
                {result.error ? <AlertCircle className="w-5 h-5 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 mt-0.5" />}
                <div>
                  <div className="font-medium">{result.error || result.message}</div>
                  {result.details && result.details.length > 0 && (
                    <ul className="mt-2 text-sm space-y-1 list-disc list-inside">
                      {result.details.map((d: string, i: number) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
