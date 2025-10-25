'use client';

import { motion } from 'framer-motion';
import { 
  Calendar, 
  Trophy, 
  FileText, 
  User, 
  MessageCircle, 
  Star,
  CheckCircle,
  TrendingUp,
  Users,
  MapPin,
  Sparkles,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { BentoCard, BentoGrid } from '@/components/magicui/bento-grid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function ForDeputiesPage() {
  const features = [
    {
      name: "توثيق المناسبات",
      description: "سجّل حضورك في الأفراح، العزاءات، والفعاليات المجتمعية. كل مناسبة تحضرها تُضاف إلى سجلك.",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-[#F87B1B]/20 to-[#E6690A]/10">
          <Calendar className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 text-[#F87B1B] opacity-20" />
        </div>
      ),
      className: "md:col-span-2"
    },
    {
      name: "سجل الإنجازات",
      description: "وثّق كل مشكلة حلّيتها لمواطن. اعرض إنجازاتك بشكل واضح ومنظم.",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-[#004030]/20 to-[#003020]/10">
          <Trophy className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 text-[#004030] opacity-20" />
        </div>
      ),
      className: "md:col-span-1"
    },
    {
      name: "البرنامج الانتخابي",
      description: "اعرض برنامجك الانتخابي وأهدافك بوضوح للمواطنين.",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-[#F87B1B]/20 to-[#E6690A]/10">
          <FileText className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 text-[#F87B1B] opacity-20" />
        </div>
      ),
      className: "md:col-span-1"
    },
    {
      name: "صفحة شخصية احترافية",
      description: "اعرض بياناتك الشخصية وخبراتك بشكل احترافي.",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-[#004030]/20 to-[#003020]/10">
          <User className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 text-[#004030] opacity-20" />
        </div>
      ),
      className: "md:col-span-1"
    },
    {
      name: "تواصل مباشر",
      description: "استقبل الشكاوى والمقترحات مباشرة من المواطنين.",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-[#F87B1B]/20 to-[#E6690A]/10">
          <MessageCircle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 text-[#F87B1B] opacity-20" />
        </div>
      ),
      className: "md:col-span-1"
    }
  ];

  const stats = [
    { icon: Users, value: "1000+", label: "نائب مسجل", color: "text-[#F87B1B]" },
    { icon: Users, value: "50K+", label: "مواطن نشط", color: "text-[#004030]" },
    { icon: CheckCircle, value: "10K+", label: "شكوى تم حلها", color: "text-[#F87B1B]" },
    { icon: MapPin, value: "27", label: "محافظة", color: "text-[#004030]" }
  ];

  const benefits = [
    {
      icon: BarChart3,
      title: "سيرة ذاتية حية للشعب",
      description: "كل نشاط تقوم به يُسجل ويُعرض. أبناء دائرتك يرون جهودك الحقيقية."
    },
    {
      icon: TrendingUp,
      title: "زيادة الثقة والمصداقية",
      description: "الشفافية في عرض إنجازاتك تزيد من ثقة المواطنين بك."
    },
    {
      icon: Users,
      title: "فهم احتياجات دائرتك",
      description: "من خلال الشكاوى تفهم بدقة ما يحتاجه أبناء دائرتك."
    },
    {
      icon: MessageCircle,
      title: "تواصل مستمر وفعال",
      description: "ابقَ على تواصل دائم واصنع علاقة قوية ومستدامة."
    },
    {
      icon: Star,
      title: "قياس أدائك",
      description: "نظام التقييم يساعدك على معرفة مستوى أدائك وتحسينه."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#004030] via-[#005040] to-[#003020] text-white py-24 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-0 left-0 w-96 h-96 bg-[#F87B1B] rounded-full filter blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-0 right-0 w-96 h-96 bg-[#F87B1B] rounded-full filter blur-3xl"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-5xl mx-auto text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-[#F87B1B]" />
              <span className="text-sm">المنصة الأولى للنواب في مصر</span>
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold mb-6">
              انضم إلى{' '}
              <span className="bg-gradient-to-r from-[#F87B1B] to-[#E6690A] bg-clip-text text-transparent">
                نائبك.com
              </span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto leading-relaxed">
              المنصة الأولى التي تربطك بأبناء دائرتك، توثق إنجازاتك، وتبني سيرتك الذاتية الحقيقية أمام الشعب
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-[#F87B1B] to-[#E6690A] hover:from-[#E6690A] hover:to-[#D45800] text-white px-8 py-6 text-lg font-bold shadow-2xl transform hover:scale-105 transition-all"
              >
                <Link href="/sign-up">
                  ابدأ الآن مجاناً
                  <ArrowRight className="mr-2 w-5 h-5" />
                </Link>
              </Button>
              <Button 
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-6 text-lg font-bold"
              >
                <a href="#features">
                  اكتشف المميزات
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white relative">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={fadeIn}>
                <Card className="text-center hover:shadow-xl transition-all transform hover:-translate-y-2 border-2">
                  <CardContent className="pt-6">
                    <stat.icon className={`w-12 h-12 mx-auto mb-4 ${stat.color}`} />
                    <div className={`text-5xl font-bold mb-2 ${stat.color}`}>{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section with Bento Grid */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-[#F87B1B] hover:bg-[#E6690A]">
              <Sparkles className="w-3 h-3 ml-1" />
              المميزات
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              لماذا <span className="text-[#F87B1B]">نائبك.com</span>؟
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              منصة شاملة توثق كل نشاطاتك وإنجازاتك وتربطك بأبناء دائرتك بشكل مباشر وفعال
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <BentoGrid className="max-w-7xl mx-auto md:auto-rows-[20rem]">
              {features.map((feature, idx) => (
                <motion.div key={idx} variants={fadeIn}>
                  <BentoCard {...feature} />
                </motion.div>
              ))}
            </BentoGrid>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              كيف يعمل <span className="text-[#F87B1B]">نائبك.com</span>؟
            </h2>
            <p className="text-xl text-gray-600">ثلاث خطوات بسيطة للبدء</p>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { step: 1, title: "سجّل حسابك", desc: "أنشئ حسابك مجاناً وأكمل بياناتك", color: "from-[#F87B1B] to-[#E6690A]" },
              { step: 2, title: "وثّق نشاطاتك", desc: "سجّل مناسباتك وإنجازاتك بشكل منتظم", color: "from-[#004030] to-[#003020]" },
              { step: 3, title: "تواصل مع دائرتك", desc: "استقبل الشكاوى وحل المشاكل", color: "from-[#F87B1B] to-[#E6690A]" }
            ].map((item, index) => (
              <motion.div key={index} variants={fadeIn}>
                <Card className="text-center hover:shadow-xl transition-all transform hover:-translate-y-2 h-full">
                  <CardContent className="pt-6">
                    <div className={`w-20 h-20 bg-gradient-to-br ${item.color} text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg`}>
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-[#004030] to-[#003020] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F87B1B] rounded-full filter blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">ماذا تستفيد كنائب؟</h2>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {benefits.map((benefit, index) => (
              <motion.div key={index} variants={fadeIn}>
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all transform hover:-translate-y-2 h-full">
                  <CardContent className="pt-6">
                    <benefit.icon className="w-12 h-12 text-[#F87B1B] mb-4" />
                    <h3 className="text-xl font-bold mb-2 text-white">{benefit.title}</h3>
                    <p className="text-gray-200">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#F87B1B] to-[#E6690A] text-white relative overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 5,
            repeat: Infinity
          }}
          className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"
        />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">جاهز للانضمام؟</h2>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              انضم الآن إلى مئات النواب الذين يستخدمون نائبك.com لخدمة دوائرهم بشكل أفضل
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg"
                className="bg-white text-[#F87B1B] hover:bg-gray-100 px-10 py-6 text-lg font-bold shadow-2xl transform hover:scale-105 transition-all"
              >
                <Link href="/sign-up">
                  ابدأ الآن - مجاناً
                  <ArrowRight className="mr-2 w-5 h-5" />
                </Link>
              </Button>
              <Button 
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-2 border-white px-10 py-6 text-lg font-bold"
              >
                <Link href="/contact">تواصل معنا</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

