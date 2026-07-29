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
import {
  GraduationCap,
  Users,
  Calendar,
  Phone,
  Mail,
  ArrowRight,
  Star,
  MapPin,
  Clock,
  CreditCard,
  FileCheck,
  Theater,
  Info,
  CheckCircle,
  Euro
} from 'lucide-react';

// Mapping des noms d'icones vers les composants
const iconMap: { [key: string]: any } = {
  FileCheck,
  Euro,
  Calendar,
  Theater,
  Info,
  CheckCircle,
  GraduationCap,
  Users,
  Star,
  Clock,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  ArrowRight
};

// Helper pour obtenir l'icone
const getIcon = (icon: any) => {
  if (typeof icon === 'function') return icon;
  if (typeof icon === 'string' && iconMap[icon]) return iconMap[icon];
  return Info; // Default icon
};

interface ContactInfo {
  phone: string;
  email: string;
}

interface TheaterGroup {
  _id: string;
  name: string;
  ageRange: string;
  description?: string;
  schedule?: string;
  location?: string;
  price?: number;
  color?: string;
  order?: number;
}

interface GalleryImage {
  _id: string;
  url: string;
  alt: string;
}

const defaultModalites = [
  {
    icon: FileCheck,
    title: 'Inscription',
    color: '#844cfc',
    items: [
      'Inscriptions en septembre au Forum des associations',
      'Formulaire d\'inscription à remplir',
      'Certificat médical de non contre-indication',
      'Autorisation parentale pour les mineurs'
    ]
  },
  {
    icon: Euro,
    title: 'Tarifs & Paiement',
    color: '#f02822',
    items: [
      'Paiement en 1, 2 ou 3 fois',

      'Tarif famille à partir du 2e enfant',
      'Cheques, espèces ou virement'
    ]
  },
  {
    icon: Calendar,
    title: 'Organisation',
    color: '#6a3acc',
    items: [
      'De septembre a juin (hors vacances scolaires)',
      '30 séances de 1h30 a 2h selon les groupes',
      'Spectacle de fin d\'année en juin',
      'Répétitions supplémentaires avant le spectacle'
    ]
  },
  {
    icon: Theater,
    title: 'Engagement',
    color: '#844cfc',
    items: [
      'Assiduité aux cours demandée',
      'Participation au spectacle de fin d\'année',
      'Respect du groupe et de l\'equipe',
      'Tenue confortable pour les cours'
    ]
  }
];

export default function EcolePage() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [groups, setGroups] = useState<TheaterGroup[]>([]);
  const [modalites, setModalites] = useState(defaultModalites);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactRes, groupsRes, galleryRes, modalitesRes] = await Promise.all([
          fetch('/api/settings/contact_info'),
          fetch('/api/theater-groups'),
          fetch('/api/gallery?limit=8'),
          fetch('/api/settings/theater_modalites'),
        ]);

        if (contactRes.ok) setContactInfo(await contactRes.json());
        if (groupsRes.ok) {
          const data = await groupsRes.json();
          setGroups(Array.isArray(data) ? data : data.data || []);
        }
        if (galleryRes.ok) {
          const data = await galleryRes.json();
          setGalleryImages(Array.isArray(data) ? data : data.data || []);
        }
        if (modalitesRes.ok) {
          const data = await modalitesRes.json();
          if (data && Array.isArray(data) && data.length > 0) setModalites(data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const defaultColors = ['#844cfc', '#f02822', '#6a3acc', '#844cfc', '#f02822', '#6a3acc'];

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
              <GraduationCap className="w-10 h-10 text-white" />
            </motion.div>

            <h1 className="font-title text-5xl md:text-6xl lg:text-7xl text-white mb-4 uppercase tracking-wide">
              TOTA COMPANIA
            </h1>
            <p className="font-title text-2xl md:text-3xl text-[#dbcbff]">
              L&apos;École de Théâtre
            </p>
          </motion.div>
        </div>
      </AuroraHero>

      {/* Wave: Dark -> Light violet */}
      <ZigzagSeparator topColor="var(--brand-violet)" bottomColor="var(--brand-violet-light)" />

      {/* Description */}
      <section className="py-16" style={{ backgroundColor: 'var(--brand-violet-light)' }}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <p className="text-xl text-gray-700 leading-relaxed">
              Tota Compania c&apos;est aussi plus de <strong className="text-[#844cfc]">100 amateurs</strong> encadrés par une équipe professionnelle,
              bénévoles lors des événements, des stages... Une véritable famille du théâtre !
            </p>
          </motion.div>
        </div>
      </section>

      {/* Wave: Light violet -> White */}
      <ZigzagSeparator topColor="var(--brand-violet-light)" bottomColor="#ffffff" />

      {/* Les 6 groupes */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-3 bg-[#dbcbff]/30 px-10 py-4">
              <Users className="w-7 h-7 text-[#844cfc]" />
              <h2 className="font-title text-3xl" style={{ color: '#f02822' }}>Nos Groupes</h2>
            </div>
            <p className="text-gray-600 mt-4 max-w-xl mx-auto">
              6 groupes pour tous les âges, du débutant au confirmé
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.length > 0 ? (
              groups.map((group, index) => (
                <motion.div
                  key={group._id}
                  initial={{ opacity: 0, y: 30, rotate: (index % 2 === 0 ? -2 : 2) }}
                  whileInView={{ opacity: 1, y: 0, rotate: (index % 2 === 0 ? -1 : 1) }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, rotate: 0 }}
                  className="bg-white border-2 border-[#844cfc]/10 p-6 shadow-lg hover:shadow-xl transition-all relative"
                >
                  <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-4"
                    style={{ backgroundColor: group.color || defaultColors[index % defaultColors.length], opacity: 0.6, transform: 'translateX(-50%) rotate(-3deg)' }}
                  />

                  <div
                    className="w-14 h-14 flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: group.color || defaultColors[index % defaultColors.length] }}
                  >
                    <Star className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="font-title text-xl mb-2 text-center">{group.name}</h3>
                  <p className="text-[#844cfc] font-medium text-center mb-4">{group.ageRange}</p>

                  {group.description && <p className="text-gray-600 text-sm text-center mb-4">{group.description}</p>}

                  <div className="space-y-2 text-sm text-gray-600">
                    {group.schedule && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#844cfc]" />
                        <span>{group.schedule}</span>
                      </div>
                    )}
                    {group.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#844cfc]" />
                        <span>{group.location}</span>
                      </div>
                    )}
                  </div>

                  {group.price && (
                    <div className="mt-4 pt-4 border-t border-[#844cfc]/20 text-center">
                      {group.price && <p className="font-title text-2xl text-[#f02822]">{group.price}EUR</p>}
                      
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              ['Tot apaloeil (6-10 ans)', 'Tot agrippine (11-14 ans)', 'Ados (15-17 ans)', 'Adultes Débutants', 'Adultes Confirmés', 'Atelier Maîtrise'].map((name, index) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border-2 border-[#844cfc]/10 p-6 shadow-lg text-center"
                >
                  <div
                    className="w-14 h-14 flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: defaultColors[index] }}
                  >
                    <Star className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-title text-xl">{name}</h3>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Wave: White -> Light violet */}
      <ZigzagSeparator topColor="#ffffff" bottomColor="var(--brand-violet-light)" />

      {/* Modalites */}
      <section className="py-20" style={{ backgroundColor: 'var(--brand-violet-light)' }}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-3 bg-white/50 px-10 py-4">
              <Info className="w-7 h-7 text-[#844cfc]" />
              <h2 className="font-title text-3xl" style={{ color: '#f02822' }}>Modalités</h2>
            </div>
            <p className="text-gray-600 mt-4 max-w-xl mx-auto">
              Tout ce qu&apos;il faut savoir pour rejoindre l&apos;école de théâtre
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {modalites.map((modalite, index) => {
              const Icon = getIcon(modalite.icon);
              return (
                <motion.div
                  key={modalite.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 shadow-lg border-l-4"
                  style={{ borderLeftColor: modalite.color }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 flex items-center justify-center"
                      style={{ backgroundColor: modalite.color }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-title text-xl">{modalite.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {modalite.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                        <CheckCircle className="w-4 h-4 text-[#844cfc] flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Wave: Light violet -> White */}
      <ZigzagSeparator topColor="var(--brand-violet-light)" bottomColor="#ffffff" />

      {/* Contact & Inscriptions */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto"
          >
            <div className="bg-gradient-to-br from-[#dbcbff]/30 to-white p-8 shadow-lg text-center border border-[#844cfc]/10">
              <Calendar className="w-12 h-12 text-[#844cfc] mx-auto mb-4" />
              <h3 className="font-title text-2xl mb-6" style={{ color: '#f02822' }}>Infos & Inscriptions</h3>
              {contactInfo && (
                <div className="border-t border-[#844cfc]/20 pt-6 space-y-3">
                  <a href={`tel:${contactInfo.phone}`} className="flex items-center justify-center gap-2 text-gray-600 hover:text-[#844cfc] transition-colors">
                    <Phone className="w-4 h-4" />{contactInfo.phone}
                  </a>
                  <a href={`mailto:${contactInfo.email}`} className="flex items-center justify-center gap-2 text-gray-600 hover:text-[#844cfc] transition-colors">
                    <Mail className="w-4 h-4" />{contactInfo.email}
                  </a>
                </div>
              )}
              <Link
                href="/contact"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-white transition-colors"
                style={{ backgroundColor: '#844cfc' }}
              >
                Nous contacter <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Wave: White -> Dark */}
      <ZigzagSeparator topColor="#ffffff" bottomColor="var(--brand-violet)" />

      {/* CTA avec Aurora */}
      <AuroraHero className="min-h-[40vh]">
        <div className="container-custom py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-title text-3xl md:text-4xl text-white mb-6">
              Rejoignez l&apos;aventure théâtrale !
            </h2>
            <p className="text-[#dbcbff] max-w-xl mx-auto mb-8">
              Découvrez le plaisir du jeu, l expression corporelle et vocale,
              et vivez l expérience unique d un spectacle de fin d année.
            </p>
            <Link href="/programmation" className="btn-primary inline-flex items-center gap-2">
              Voir la programmation <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </AuroraHero>

      {/* Bandeau Galerie Photos */}
      {galleryImages.length > 0 && (
        <section className="py-8 overflow-hidden" style={{ backgroundColor: '#faf8f5' }}>
          <div className="flex animate-scroll">
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
            @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            .animate-scroll { animation: scroll 30s linear infinite; }
            .animate-scroll:hover { animation-play-state: paused; }
          `}</style>
        </section>
      )}

      <Footer />
    </>
  );
}
