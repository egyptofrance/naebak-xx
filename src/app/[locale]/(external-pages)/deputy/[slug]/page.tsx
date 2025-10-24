interface PageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export default async function DeputyPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">صفحة النائب</h1>
          <div className="bg-card p-8 rounded-lg shadow-sm border">
            <p className="text-xl text-muted-foreground mb-4">
              معرف النائب: <span className="font-mono text-primary">{slug}</span>
            </p>
            <p className="text-muted-foreground">
              هذه صفحة فارغة مؤقتة. سيتم إضافة المحتوى قريباً.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

