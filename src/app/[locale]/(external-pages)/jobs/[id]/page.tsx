import { getJobById } from '@/data/jobs/queries';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Briefcase, Clock, Calendar, Eye, Users, Building } from 'lucide-react';
import Link from 'next/link';
import { JOB_CATEGORIES, WORK_LOCATIONS, EMPLOYMENT_TYPES } from '@/types/jobs';

// Force dynamic rendering
export const revalidate = 0;

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    notFound();
  }

  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    if (!min && !max) return 'حسب الخبرة';
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
    if (min) return `من ${min.toLocaleString()} ${currency}`;
    if (max) return `حتى ${max.toLocaleString()} ${currency}`;
    return 'حسب الخبرة';
  };

  const getWorkLocationLabel = (value: string) => {
    return WORK_LOCATIONS.find((loc) => loc.value === value)?.label || value;
  };

  const getCategoryLabel = (value: string) => {
    return JOB_CATEGORIES.find((cat) => cat.value === value)?.label || value;
  };

  const getEmploymentTypeLabel = (value: string) => {
    return EMPLOYMENT_TYPES.find((type) => type.value === value)?.label || value;
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Back Button */}
          <Button variant="ghost" asChild>
            <Link href="/jobs">← العودة إلى الوظائف</Link>
          </Button>

          {/* Job Header */}
          <Card>
            {job.image_url && (
              <div className="w-full h-64 overflow-hidden rounded-t-lg">
                <img
                  src={job.image_url}
                  alt={job.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                  <CardDescription className="text-lg">
                    {job.description}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {getCategoryLabel(job.category)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Key Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">مكان العمل</p>
                    <p className="font-medium">
                      {getWorkLocationLabel(job.work_location)}
                      {job.governorate && ` - ${job.governorate}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">الراتب</p>
                    <p className="font-medium">
                      {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">نوع الوظيفة</p>
                    <p className="font-medium">{getEmploymentTypeLabel(job.employment_type)}</p>
                  </div>
                </div>

                {job.work_hours && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">ساعات العمل</p>
                      <p className="font-medium">{job.work_hours}</p>
                    </div>
                  </div>
                )}

                {job.office_address && (
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">العنوان</p>
                      <p className="font-medium">{job.office_address}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">الوظائف المتاحة</p>
                    <p className="font-medium">{job.positions_available} وظيفة</p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              {job.statistics && (
                <div className="flex items-center gap-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-bold">{job.statistics.views_count}</span> مشاهدة
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-bold">{job.statistics.applications_count}</span> متقدم
                    </span>
                  </div>
                </div>
              )}

              <Separator />

              {/* Apply Button */}
              <div className="flex justify-center">
                <Button size="lg" asChild className="px-12">
                  <Link href={`/jobs/${job.id}/apply`}>
                    قدم طلبك الآن
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>المتطلبات</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>المسؤوليات</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>المزايا</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Apply Button (Bottom) */}
          <Card className="bg-primary/5">
            <CardContent className="py-8 text-center space-y-4">
              <h3 className="text-2xl font-bold">هل أنت مهتم بهذه الوظيفة؟</h3>
              <p className="text-muted-foreground">
                قدم طلبك الآن وانضم إلى فريق نائبك
              </p>
              <Button size="lg" asChild className="px-12">
                <Link href={`/jobs/${job.id}/apply`}>
                  قدم طلبك الآن
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
