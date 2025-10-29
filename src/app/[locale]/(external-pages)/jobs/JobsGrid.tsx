'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { JobWithStatistics } from '@/types/jobs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, Clock, Eye, Users, Search } from 'lucide-react';
import Link from 'next/link';

interface JobsGridProps {
  initialJobs: JobWithStatistics[];
  total: number;
  currentPage: number;
  limit: number;
  categories: Array<{ value: string; label: string; labelEn: string }>;
  workLocations: Array<{ value: string; label: string; labelEn: string }>;
  employmentTypes: Array<{ value: string; label: string; labelEn: string }>;
  governorates: Array<{ value: string; label: string }>;
}

export default function JobsGrid({
  initialJobs,
  total,
  currentPage,
  limit,
  categories,
  workLocations,
  employmentTypes,
  governorates,
}: JobsGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  const totalPages = Math.ceil(total / limit);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to page 1 when filtering
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    if (!min && !max) return 'حسب الخبرة';
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
    if (min) return `من ${min.toLocaleString()} ${currency}`;
    if (max) return `حتى ${max.toLocaleString()} ${currency}`;
    return 'حسب الخبرة';
  };

  const getWorkLocationLabel = (value: string) => {
    return workLocations.find((loc) => loc.value === value)?.label || value;
  };

  const getCategoryLabel = (value: string) => {
    return categories.find((cat) => cat.value === value)?.label || value;
  };

  return (
    <div className="space-y-8">
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            البحث والفلترة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="ابحث عن وظيفة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">بحث</Button>
          </form>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <Select
              value={searchParams.get('category') || 'all'}
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Work Location Filter */}
            <Select
              value={searchParams.get('work_location') || 'all'}
              onValueChange={(value) => handleFilterChange('work_location', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="مكان العمل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأماكن</SelectItem>
                {workLocations.map((loc) => (
                  <SelectItem key={loc.value} value={loc.value}>
                    {loc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Employment Type Filter */}
            <Select
              value={searchParams.get('employment_type') || 'all'}
              onValueChange={(value) => handleFilterChange('employment_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="نوع الوظيفة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {employmentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Governorate Filter */}
            <Select
              value={searchParams.get('governorate') || 'all'}
              onValueChange={(value) => handleFilterChange('governorate', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="المحافظة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المحافظات</SelectItem>
                {governorates.map((gov) => (
                  <SelectItem key={gov.value} value={gov.value}>
                    {gov.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          عرض {initialJobs.length} من أصل {total} وظيفة
        </p>
        {searchParams.toString() && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/jobs')}
          >
            مسح الفلاتر
          </Button>
        )}
      </div>

      {/* Jobs Grid */}
      {initialJobs.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-lg text-muted-foreground">
            لا توجد وظائف متاحة حالياً
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialJobs.map((job) => (
            <Card key={job.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                {job.image_url && (
                  <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
                    <img
                      src={job.image_url}
                      alt={job.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardTitle className="text-xl">{job.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {job.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-3">
                {/* Category Badge */}
                <Badge variant="secondary">{getCategoryLabel(job.category)}</Badge>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{getWorkLocationLabel(job.work_location)}</span>
                    {job.governorate && <span>- {job.governorate}</span>}
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</span>
                  </div>

                  {job.work_hours && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{job.work_hours}</span>
                    </div>
                  )}
                </div>

                {/* Statistics */}
                {job.statistics && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{job.statistics.views_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{job.statistics.applications_count} متقدم</span>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/jobs/${job.id}`}>عرض التفاصيل</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            السابق
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            التالي
          </Button>
        </div>
      )}
    </div>
  );
}
