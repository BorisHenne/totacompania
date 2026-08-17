'use client';

import { useEffect, useState } from 'react';
import { getImageUrl } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ZigzagSeparator from '@/components/ui/ZigzagSeparator';
import { AuroraHero } from '@/components/ui/AuroraBackground';
import { Sparkles, Calendar, MapPin, Users, Phone, Mail, ArrowRight, X, CheckCircle, AlertCircle, ClipboardList } from 'lucide-react';

interface Stage { _id: string; title: string; theme?: string; description?: string; ageRange?: string; startDate?: string; endDate?: string; location?: string; price?: string; }
interface ContactInfo { phone: string; email: string; }
interface GalleryImage { _id: string; url: string; alt: string; }
interface RegForm { childLastName: string; childFirstName: string; birthDate: string; address: string; phone: string; email: string; allergies: string; notes: string; }

const emptyForm: RegForm = { childLastName: '', childFirstName: '', birthDate: '', address: '', phone: '', email: '', allergies: '', notes: '' };

export default function StagesPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [form, setForm] = useState<RegForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle'|'success'|'error'>('idle');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stagesRes, contactRes, galleryRes] = await Promise.all([
          fetch('/api/stages'), fetch('/api/settings/contact_info'), fetch('/api/gallery?limit=8'),
        ]);
        if (stagesRes.ok) setStages(await stagesRes.json());
        if (contactRes.ok) setContactInfo(await contactRes.json());
        if (galleryRes.ok) { const data = await galleryRes.json(); setGalleryImages(Array.isArray(data) ? data : data.data || []); }
      } catch (error) { console.error('Error:', error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const formatDates = (stage: Stage) => {
    if (!stage.startDate) return '';
    const start = new Date(stage.startDate);
    const end = stage.endDate ? new Date(stage.endDate) : null;
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return end ? `Du ${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au ${end.toLocaleDateString('fr-FR', opts)}` : start.toLocaleDateString('fr-FR', opts);
  };

  const openReg = (stage: Stage) => { setSelectedStage(stage); setForm(emptyForm); setSubmitStatus('idle'); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await fetch('/api/stages/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, stageTitle: selectedStage?.title || 'Stage', stageDates: selectedStage ? formatDates(selectedStage) : '' }),
      });
      setSubmitStatus(res.ok ? 'success' : 'error');
    } catch { setSubmitStatus('error'); }
    finally { setSubmitting(false); }
  };

  if (loading) return (<><Navigation /><div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]"><div className="animate-spin w-8 h-8 border-4 border-[#844cfc] border-t-transparent rounded-full" /></div><Footer /></>);

  return (
    <>
      <Navigation />
      <AuroraHero className="min-h-[50vh]">
        <div className="container-custom pt-32 pb-20 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="inline-flex items-center justify-center w-20 h-20 bg-[#844cfc] mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="font-title text-5xl md:text-6xl lg:text-7xl text-white mb-4 uppercase tracking-wide">Stages Enfants</h1>
            <p className="text-xl md:text-2xl text-[#dbcbff] max-w-2xl mx-auto">{"D\u00e9couvrir le th\u00e9\u00e2tre pendant les vacances scolaires"}</p>
          </motion.div>
        </div>
      </AuroraHero>

      <ZigzagSeparator topColor="var(--brand-violet)" bottomColor="var(--brand-violet-light)" />
      <section className="py-16" style={{ backgroundColor: 'var(--brand-violet-light)' }}>
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
            <p className="text-xl text-gray-700 leading-relaxed">
              Pendant les vacances scolaires, Tota Compania propose des stages de th&eacute;&acirc;tre
              pour les enfants et adolescents. Une semaine pour d&eacute;couvrir le jeu th&eacute;&acirc;tral,
              la narration, l&apos;improvisation et le travail en groupe, le tout encadr&eacute; par
              des professionnels du spectacle vivant.
            </p>
          </motion.div>
        </div>
      </section>

      <ZigzagSeparator topColor="var(--brand-violet-light)" bottomColor="#ffffff" />
      <section className="py-20 bg-white">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="font-title text-3xl md:text-4xl inline-flex items-center gap-3"><Calendar className="w-8 h-8 text-[#844cfc]" /> Stages de l'année scolaire</h2>
          </motion.div>
          <div className="max-w-4xl mx-auto">
            {stages.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 card-violet">
                <Sparkles className="w-12 h-12 text-[#844cfc]/40 mx-auto mb-4" />
                <p className="font-title text-xl text-gray-600">Aucun stage pr&eacute;vu pour le moment</p>
                <p className="text-gray-500 mt-2">Revenez bient&ocirc;t pour d&eacute;couvrir nos prochains stages !</p>
              </motion.div>
            ) : (
              <div className="grid gap-6">
                {stages.map((stage, i) => (
                  <motion.div key={stage._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card p-8">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0"><div className="w-20 h-20 bg-[#844cfc]/20 flex items-center justify-center"><Sparkles className="w-10 h-10 text-[#844cfc]" /></div></div>
                      <div className="flex-1">
                        <h3 className="font-title text-2xl">{stage.title}</h3>
                        {stage.theme && <p className="text-[#844cfc] font-title mt-1 italic">&laquo; {stage.theme} &raquo;</p>}
                        {stage.description && <p className="text-gray-600 mt-3">{stage.description}</p>}
                        <div className="mt-4 space-y-2 text-gray-600">
                          {stage.ageRange && <p className="flex items-center gap-2"><Users className="w-4 h-4 text-[#844cfc]" />{stage.ageRange}</p>}
                          {stage.startDate && <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#844cfc]" />{formatDates(stage)}</p>}
                          {stage.location && <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#844cfc]" />{stage.location}</p>}
                        </div>
                        {stage.price && (<div className="mt-4 p-3 bg-[#dbcbff]/30"><p className="font-title text-lg">{stage.price}</p><p className="text-sm text-gray-600">Journ&eacute;es 9h-17h, repas et go&ucirc;ters compris</p></div>)}
                        <button onClick={() => openReg(stage)} className="mt-6 inline-flex items-center gap-2 bg-[#844cfc] hover:bg-[#7338e8] text-white px-6 py-3 rounded-lg font-title text-lg transition-colors">
                          <ClipboardList className="w-5 h-5" /> Inscrire mon enfant
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <ZigzagSeparator topColor="#ffffff" bottomColor="var(--brand-violet-light)" />
      <section className="py-20" style={{ backgroundColor: 'var(--brand-violet-light)' }}>
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-title text-3xl md:text-4xl">Une semaine type</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[{title:'Echauffement',desc:'Exercices corporels et vocaux'},{title:'Jeu th\u00e9\u00e2tral',desc:'Improvisation et travail de personnage'},{title:'Cr\u00e9ation',desc:'Construction collective'},{title:'Restitution',desc:'Pr\u00e9sentation aux familles'}].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white p-6 shadow-lg text-center">
                <div className="w-12 h-12 bg-[#844cfc] text-white flex items-center justify-center mx-auto mb-4 font-title text-xl">{i + 1}</div>
                <h3 className="font-title text-lg mb-2">{item.title}</h3><p className="text-sm text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ZigzagSeparator topColor="var(--brand-violet-light)" bottomColor="var(--brand-violet)" />
      <AuroraHero className="min-h-[40vh]">
        <div className="container-custom py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-title text-3xl md:text-4xl text-white mb-4">Inscriptions et renseignements</h2>
            {contactInfo && (<div className="flex flex-wrap justify-center gap-6 mb-8 text-white/80">
              <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-2 hover:text-white transition-colors"><Phone className="w-5 h-5" />{contactInfo.phone}</a>
              <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-2 hover:text-white transition-colors"><Mail className="w-5 h-5" />{contactInfo.email}</a>
            </div>)}
            <Link href="/contact" className="btn-primary inline-flex items-center gap-2 text-lg">Nous contacter <ArrowRight className="w-5 h-5" /></Link>
          </motion.div>
        </div>
      </AuroraHero>

      {galleryImages.length > 0 && (
        <section className="py-8 overflow-hidden" style={{ backgroundColor: '#faf8f5' }}>
          <div className="flex animate-scroll-gallery">
            {[...Array(2)].map((_, si) => (<div key={si} className="flex gap-4 px-2">{galleryImages.map((img) => (
              <div key={`${si}-${img._id}`} className="flex-shrink-0 w-64 h-48 relative overflow-hidden"><Image src={getImageUrl(img.url)} alt={img.alt || 'Galerie'} fill className="object-cover hover:scale-110 transition-transform duration-500" /></div>
            ))}</div>))}
          </div>
          <style jsx>{`@keyframes scrollGallery{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}.animate-scroll-gallery{animation:scrollGallery 30s linear infinite}.animate-scroll-gallery:hover{animation-play-state:paused}`}</style>
        </section>
      )}

      {/* Modal inscription */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-gradient-to-r from-[#5b21b6] to-[#844cfc] text-white p-6 rounded-t-2xl flex justify-between items-start z-10">
                <div><h2 className="font-title text-2xl">Inscription au stage</h2>{selectedStage && <p className="text-white/80 mt-1">{selectedStage.title}</p>}</div>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors"><X className="w-6 h-6" /></button>
              </div>
              {submitStatus === 'success' ? (
                <div className="p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="font-title text-2xl mb-2">Inscription envoy&eacute;e !</h3>
                  <p className="text-gray-600 mb-6">Nous avons bien re&ccedil;u votre demande. Nous vous recontacterons rapidement.</p>
                  <button onClick={() => setShowModal(false)} className="bg-[#844cfc] hover:bg-[#7338e8] text-white px-6 py-3 rounded-lg font-title transition-colors">Fermer</button>
                </div>
              ) : submitStatus === 'error' ? (
                <div className="p-8 text-center">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="font-title text-2xl mb-2">Erreur</h3>
                  <p className="text-gray-600 mb-6">Une erreur est survenue. Veuillez r&eacute;essayer ou nous contacter directement.</p>
                  <button onClick={() => setSubmitStatus('idle')} className="bg-[#844cfc] hover:bg-[#7338e8] text-white px-6 py-3 rounded-lg font-title transition-colors">R&eacute;essayer</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div className="bg-[#f5f0ff] p-4 rounded-lg">
                    <h3 className="font-title text-lg text-[#5b21b6] mb-3">Enfant</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label><input type="text" required value={form.childLastName} onChange={e => setForm({...form, childLastName: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#844cfc] focus:border-transparent outline-none" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Pr&eacute;nom *</label><input type="text" required value={form.childFirstName} onChange={e => setForm({...form, childFirstName: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#844cfc] focus:border-transparent outline-none" /></div>
                    </div>
                    <div className="mt-3"><label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance *</label><input type="date" required value={form.birthDate} onChange={e => setForm({...form, birthDate: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#844cfc] focus:border-transparent outline-none" /></div>
                  </div>
                  <div className="bg-[#f0f7ff] p-4 rounded-lg">
                    <h3 className="font-title text-lg text-[#1e40af] mb-3">Responsable</h3>
                    <div className="space-y-3">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label><input type="text" required value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#844cfc] focus:border-transparent outline-none" /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">T&eacute;l&eacute;phone *</label><input type="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#844cfc] focus:border-transparent outline-none" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#844cfc] focus:border-transparent outline-none" /></div>
                      </div>
                    </div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Allergies / R&eacute;gimes sp&eacute;cifiques</label><textarea rows={2} value={form.allergies} onChange={e => setForm({...form, allergies: e.target.value})} placeholder="Indiquez toute allergie ou regime alimentaire..." className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#844cfc] focus:border-transparent outline-none resize-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Informations diverses</label><textarea rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Toute information utile..." className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#844cfc] focus:border-transparent outline-none resize-none" /></div>
                  <button type="submit" disabled={submitting} className="w-full bg-[#844cfc] hover:bg-[#7338e8] disabled:bg-gray-400 text-white py-3 rounded-lg font-title text-lg transition-colors flex items-center justify-center gap-2">
                    {submitting ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Envoi en cours...</>) : (<><ClipboardList className="w-5 h-5" /> Envoyer l&apos;inscription</>)}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </>
  );
}
