"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { JobWithStatistics } from '@/types/jobs';
import type { JobCategory, Governorate } from '@/data/jobs/lookups';
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
  categories: JobCategory[];
  workLocations: Array<{ value: string; label: string; labelAr: string }>;
  employmentTypes: Array<{ value: string; label: string; labelAr: string }>;
  governorates: Governorate[];
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
    return workLocations.find((loc) => loc.value === value)?.labelAr || value;
  };

  const getEmploymentTypeLabel = (value: string) => {
    return employmentTypes.find((type) => type.value === value)?.labelAr || value;
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
              value={searchParams.get('category_id') || 'all'}
              onValueChange={(value) => handleFilterChange('category_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name_ar}
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
                    {loc.labelAr}
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
                    {type.labelAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Governorate Filter */}
            <Select
              value={searchParams.get('governorate_id') || 'all'}
              onValueChange={(value) => handleFilterChange('governorate_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="المحافظة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المحافظات</SelectItem>
                {governorates.map((gov) => (
                  <SelectItem key={gov.id} value={gov.id}>
                    {gov.name_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Grid */}
      {initialJobs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">لا توجد وظائف متاحة حالياً</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialJobs.map((job) => (
            <Card key={job.id} className="flex flex-col hover:shadow-lg transition-shadow">
              {job.image_url && (
                <div className="w-full h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={job.image_url}
                    alt={job.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl line-clamp-2">{job.title}</CardTitle>
                  {job.category && (
                    <Badge variant="secondary" className="shrink-0">
                      {job.category.name_ar || job.category.name_en}
                    </Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2">
                  {job.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{getWorkLocationLabel(job.work_location)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>{getEmploymentTypeLabel(job.employment_type)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</span>
                </div>

                {job.statistics && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{job.statistics.views_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{job.statistics.applications_count}</span>
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
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            السابق
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                onClick={() => handlePageChange(page)}
                className="w-10"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            التالي
          </Button>
        </div>
      )}
    </div>
  );
}
