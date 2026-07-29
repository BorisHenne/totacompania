'use client';

import { useEffect, useState } from 'react';
import { getImageUrl } from '@/lib/utils';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ZigzagSeparator from '@/components/ui/ZigzagSeparator';
import { AuroraHero } from '@/components/ui/AuroraBackground';
import { Sparkles, Calendar, MapPin, Users, Phone, Mail, ArrowRight, Theater } from 'lucide-react';

interface Stage {
  _id: string;
  title: string;
  theme?: string;
  description?: string;
  ageRange?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  price?: string;
}

interface ContactInfo {
  phone: string;
  email: string;
}

interface GalleryImage {
  _id: string;
  url: string;
  alt: string;
}

export default function StagesPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stagesRes, contactRes, galleryRes] = await Promise.all([
          fetch('/api/stages'),
          fetch('/api/settings/contact_info'),
          fetch('/api/gallery?limit=8'),
        ]);

        if (stagesRes.ok) setStages(await stagesRes.json());
        if (contactRes.ok) setContactInfo(await contactRes.json());
        if (galleryRes.ok) {
          const data = await galleryRes.json();
          setGalleryImages(Array.isArray(data) ? data : data.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDates = (stage: Stage) => {
    if (!stage.startDate) return '';
    const start = new Date(stage.startDate);
    const end = stage.endDate ? new Date(stage.endDate) : null;
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    if (end) {
      return `Du ${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au ${end.toLocaleDateString('fr-FR', options)}`;
    }
    return start.toLocaleDateString('fr-FR', options);
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
          <div className="animate-spin w-8 h-8 border-4 border-[#844cfc] border-t-transparent rounded-full" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />

      {/* Hero Section avec Aurora */}
      <AuroraHero className="min-h-[50vh]">
        <div className="container-custom pt-32 pb-20 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-20 h-20 bg-[#844cfc] mb-6"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>

            <h1 className="font-title text-5xl md:text-6xl lg:text-7xl text-white mb-4 uppercase tracking-wide">
              Stages Enfants
            </h1>
            <p className="text-xl md:text-2xl text-[#dbcbff] max-w-2xl mx-auto">
              Découvrir le théâtre pendant les vacances scolaires
            </p>
          </motion.div>
        </div>
      </AuroraHero>

      {/* Wave: Dark -> Light violet */}
      <ZigzagSeparator topColor="var(--brand-violet)" bottomColor="var(--brand-violet-light)" />

      {/* Introduction */}
      <section className="py-16" style={{ backgroundColor: 'var(--brand-violet-light)' }}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <p className="text-xl text-gray-700 leading-relaxed">
              Pendant les vacances scolaires, Tota Compania propose des stages de théâtre
              pour les enfants et adolescents. Une semaine pour découvrir le jeu théâtral,
              la narration, l&apos;improvisation et le travail en groupe, le tout encadré par
              des professionnels du spectacle vivant.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Wave: Light violet -> White */}
      <ZigzagSeparator topColor="var(--brand-violet-light)" bottomColor="#ffffff" />

      {/* Stages à venir */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-title text-3xl md:text-4xl inline-flex items-center gap-3">
              <Calendar className="w-8 h-8 text-[#844cfc]" />
              Stages de l&apos;année scolaire
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {stages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 card-violet"
              >
                <Sparkles className="w-12 h-12 text-[#844cfc]/40 mx-auto mb-4" />
                <p className="font-title text-xl text-gray-600">Aucun stage prevu pour le moment</p>
                <p className="text-gray-500 mt-2">Revenez bientôt pour découvrir nos prochains stages !</p>
              </motion.div>
            ) : (
              <div className="grid gap-6">
                {stages.map((stage, index) => (
                  <motion.div
                    key={stage._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="card p-8"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-[#844cfc]/20 flex items-center justify-center">
                          <Sparkles className="w-10 h-10 text-[#844cfc]" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-title text-2xl">{stage.title}</h3>
                        {stage.theme && <p className="text-[#844cfc] font-title mt-1 italic">&quot;{stage.theme}&quot;</p>}
                        {stage.description && <p className="text-gray-600 mt-3">{stage.description}</p>}
                        <div className="mt-4 space-y-2 text-gray-600">
                          {stage.ageRange && (
                            <p className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-[#844cfc]" />
                              <span>{stage.ageRange}</span>
                            </p>
                          )}
                          {stage.startDate && (
                            <p className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[#844cfc]" />
                              <span>{formatDates(stage)}</span>
                            </p>
                          )}
                          {stage.location && (
                            <p className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[#844cfc]" />
                              <span>{stage.location}</span>
                            </p>
                          )}
                        </div>
                        {stage.price && (
                          <div className="mt-4 p-3 bg-[#dbcbff]/30">
                            <p className="font-title text-lg">{stage.price}</p>
                            <p className="text-sm text-gray-600">Journees 9h-17h, repas et gouters compris</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Wave: White -> Light violet */}
      <ZigzagSeparator topColor="#ffffff" bottomColor="var(--brand-violet-light)" />

      {/* Programme type */}
      <section className="py-20" style={{ backgroundColor: 'var(--brand-violet-light)' }}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-title text-3xl md:text-4xl">Une semaine type</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { title: 'Échauffement', desc: 'Exercices corporels et vocaux pour se préparer' },
              { title: 'Jeu théâtral', desc: 'Improvisation, scènes et travail de personnage' },
              { title: 'Création', desc: "Construction d'une petite forme théâtrale collective" },
              { title: 'Restitution', desc: 'Présentation du travail aux familles le dernier jour' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 shadow-lg text-center"
              >
                <div className="w-12 h-12 bg-[#844cfc] text-white flex items-center justify-center mx-auto mb-4 font-title text-xl">
                  {index + 1}
                </div>
                <h3 className="font-title text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Wave: Light violet -> Dark */}
      <ZigzagSeparator topColor="var(--brand-violet-light)" bottomColor="var(--brand-violet)" />

      {/* Contact avec Aurora */}
      <AuroraHero className="min-h-[40vh]">
        <div className="container-custom py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-title text-3xl md:text-4xl text-white mb-4">
              Inscriptions et renseignements
            </h2>
            {contactInfo && (
              <div className="flex flex-wrap justify-center gap-6 mb-8 text-white/80">
                <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />{contactInfo.phone}
                </a>
                <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />{contactInfo.email}
                </a>
              </div>
            )}
            <Link href="/contact" className="btn-primary inline-flex items-center gap-2 text-lg">
              Nous contacter <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </AuroraHero>

      {/* Bandeau Galerie Photos */}
      {galleryImages.length > 0 && (
        <section className="py-8 overflow-hidden" style={{ backgroundColor: '#faf8f5' }}>
          <div className="flex animate-scroll-gallery">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex gap-4 px-2">
                {galleryImages.map((img) => (
                  <div key={`${setIndex}-${img._id}`} className="flex-shrink-0 w-64 h-48 relative overflow-hidden">
                    <Image src={getImageUrl(img.url)} alt={img.alt || 'Galerie Tota Compania'} fill className="object-cover hover:scale-110 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <style jsx>{`
            @keyframes scrollGallery { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            .animate-scroll-gallery { animation: scrollGallery 30s linear infinite; }
            .animate-scroll-gallery:hover { animation-play-state: paused; }
          `}</style>
        </section>
      )}

      <Footer />
    </>
  );
}
