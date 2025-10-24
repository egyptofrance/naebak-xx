interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function DeputyPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">صفحة النائب</h1>
        <p className="text-muted-foreground">
          Slug: {slug}
        </p>
        <p className="mt-4">
          هذه صفحة فارغة مؤقتة. سيتم إضافة المحتوى قريباً.
        </p>
      </div>
    </div>
  );
}

