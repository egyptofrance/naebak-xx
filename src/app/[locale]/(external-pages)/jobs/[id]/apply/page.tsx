import { getJobById } from '@/data/jobs/queries';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import JobApplicationForm from './JobApplicationForm';

// Force dynamic rendering
export const revalidate = 0;

export default async function JobApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Back Button */}
          <Button variant="ghost" asChild>
            <Link href={`/jobs/${id}`}>
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى تفاصيل الوظيفة
            </Link>
          </Button>

          {/* Job Summary Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
                  <CardDescription className="mt-2">
                    قدم طلبك الآن للانضمام إلى فريق نائبك
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {job.category}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Application Form */}
          <Card>
            <CardHeader>
              <CardTitle>نموذج التقديم</CardTitle>
              <CardDescription>
                يرجى ملء جميع الحقول المطلوبة بدقة. سيتم مراجعة طلبك والتواصل معك في أقرب وقت.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JobApplicationForm jobId={id} jobTitle={job.title} />
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                🔒 جميع بياناتك محمية ولن يتم مشاركتها مع أي جهة خارجية.
                سيتم استخدامها فقط لأغراض التوظيف.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
