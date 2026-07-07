'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ZigzagSeparator from '@/components/ui/ZigzagSeparator';
import { AuroraHero } from '@/components/ui/AuroraBackground';
import { Calendar, MapPin, Clock, Ticket, Phone, Mail, ArrowRight, Sparkles, Home, GraduationCap, Filter, Loader2, X, ExternalLink, FileText, Download } from 'lucide-react';

interface ContactInfo {
  phone: string;
  email: string;
}

// Types d'evenements avec leurs couleurs (adaptees au theme violet)
const eventTypes: Record<string, { label: string; color: string; icon: typeof Calendar }> = {
  spectacle: { label: 'Spectacle', color: '#844cfc', icon: Sparkles },
  stage: { label: 'Stage', color: '#f02822', icon: GraduationCap },
  inscription: { label: 'Inscription', color: '#22c55e', icon: Calendar },
  residence: { label: 'Résidence', color: '#6a3acc', icon: Home },
  ag: { label: 'AG', color: '#f59e0b', icon: Calendar },
};

// Type pour un evenement depuis l'API
interface EventData {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  date: string;
  endDate?: string;
  time?: string;
  location: string;
  price?: string;
  ageRange?: string;
  type: string;
  image?: string;
  ticketUrl?: string;
  externalUrl?: string;
  documents?: { title: string; file: string }[];
  published: boolean;
}

// Grouper les evenements par mois
const groupByMonth = (events: EventData[]) => {
  const grouped: { [key: string]: { event: EventData; monthLabel: string }[] } = {};
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  events.forEach(event => {
    const dateStr = typeof event.date === 'string' ? event.date : new Date(event.date).toISOString();
    const date = new Date(dateStr);
    const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
    const monthLabel = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push({ event, monthLabel });
  });

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, items]) => ({
      key,
      month: items[0].monthLabel,
      events: items
        .map(item => item.event)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    }));
};

// Formater la date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return {
    day: date.getDate(),
    month: date.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(),
    year: date.getFullYear(),
    weekday: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
    full: date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  };
};

export default function ProgrammationPage() {
  const [allEvents, setAllEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, contactRes] = await Promise.all([
          fetch('/api/events?limit=100'),
          fetch('/api/settings/contact_info')
        ]);

        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setAllEvents(Array.isArray(eventsData) ? eventsData : eventsData.data || []);
        }

        if (contactRes.ok) {
          setContactInfo(await contactRes.json());
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const filteredEvents = useMemo(() => {
    let events = allEvents;

    if (filter !== 'all') {
      events = events.filter(e => e.type === filter);
    }

    if (timeFilter === 'upcoming') {
      events = events.filter(e => {
        // Utiliser endDate si disponible, sinon date de début
        const eventEndDate = e.endDate 
          ? e.endDate.split('T')[0]
          : e.date.split('T')[0];
        return eventEndDate >= today;
      });
    } else if (timeFilter === 'past') {
      events = events.filter(e => {
        // Un événement est passé si sa date de fin (ou date de début) est antérieure à aujourd'hui
        const eventEndDate = e.endDate 
          ? e.endDate.split('T')[0]
          : e.date.split('T')[0];
        return eventEndDate < today;
      });
    }

    return groupByMonth(events);
  }, [allEvents, filter, timeFilter, today]);

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-[#844cfc] animate-spin" />
            <p className="text-white/60">Chargement de la programmation...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main>
        {/* Hero Section avec Aurora Background */}
        <AuroraHero className="min-h-[45vh]">
          <div className="container-custom pt-24 pb-16 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mb-4"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#844cfc] text-white mb-2">
                  <Calendar className="w-10 h-10" />
                </div>
              </motion.div>
              <h1 className="font-title text-5xl md:text-6xl lg:text-7xl text-white mb-4 uppercase tracking-wide">
                Agenda
              </h1>
              <p className="text-xl text-[#dbcbff] max-w-2xl mx-auto">
                Spectacles, stages et ateliers... Toute notre programmation !
              </p>
            </motion.div>
          </div>
        </AuroraHero>

        {/* Wave: Dark -> White */}
        <ZigzagSeparator topColor="var(--brand-violet)" bottomColor="#ffffff" />

        {/* Filtres */}
        <section className="py-8 bg-white border-b sticky top-16 z-40">
          <div className="container-custom">
            {/* Filtres par temps */}
            <div className="flex justify-center gap-4 mb-4">
              {[
                { key: 'upcoming', label: 'A venir' },
                { key: 'all', label: 'Tout voir' },
                { key: 'past', label: 'Passés' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setTimeFilter(item.key as 'upcoming' | 'past' | 'all')}
                  className={`px-6 py-2 rounded-full transition-colors font-medium ${
                    timeFilter === item.key
                      ? 'bg-[#844cfc] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Filtres par type */}
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                  filter === 'all'
                    ? 'bg-[#0a0a0f] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4 inline mr-1" />
                Tous
              </button>
              {Object.entries(eventTypes).map(([key, { label, color }]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                    filter === key
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={filter === key ? { backgroundColor: color } : undefined}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Liste des evenements */}
        <section className="py-16" style={{ backgroundColor: '#faf8f5' }}>
          <div className="container-custom">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto text-[#844cfc]/30 mb-4" />
                <p className="text-gray-600 text-lg">Aucun evenement trouve.</p>
                {allEvents.length === 0 && (
                  <p className="text-gray-400 text-sm mt-2">
                    Aucun evenement n&apos;a ete ajoute dans l&apos;administration.
                  </p>
                )}
              </div>
            ) : (
              filteredEvents.map(({ key, month, events }) => (
                <div key={key} className="mb-12">
                  {/* Bandeau du mois */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative mb-8"
                  >
                    <div
                      className="inline-block py-3 px-8 rounded-r-lg"
                      style={{ backgroundColor: '#844cfc' }}
                    >
                      <h2 className="text-2xl md:text-3xl font-title text-white uppercase tracking-wider">
                        {month}
                      </h2>
                    </div>
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#f02822] rounded-l" />
                  </motion.div>

                  {/* Evenements du mois */}
                  <div className="space-y-6 pl-4 md:pl-8">
                    {events.map((event, index) => {
                      const dateInfo = formatDate(event.date);
                      const typeInfo = eventTypes[event.type] || { label: event.type, color: '#844cfc', icon: Calendar };
                      // Utiliser endDate si disponible pour déterminer si l'événement est passé
                      const eventEndDateStr = event.endDate 
                        ? event.endDate.split('T')[0]
                        : event.date.split('T')[0];
                      const isPast = eventEndDateStr < today;
                      const Icon = typeInfo.icon;

                      return (
                        <motion.div
                          key={event._id || `${event.date}-${event.title}-${index}`}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div
                            className={`bg-white rounded-xl shadow-sm overflow-hidden border-l-4 cursor-pointer hover:shadow-md transition-shadow ${isPast ? 'opacity-60' : ''}`}
                            style={{ borderLeftColor: typeInfo.color }}
                            onClick={() => setSelectedEvent(event)}
                          >
                            <div className="flex flex-col md:flex-row">
                              {/* Badge date */}
                              <div
                                className="text-white p-4 md:p-6 text-center md:w-28 flex-shrink-0"
                                style={{ backgroundColor: typeInfo.color }}
                              >
                                <div className="text-3xl font-bold">{dateInfo.day}</div>
                                <div className="text-sm">{dateInfo.month}</div>
                                {event.endDate && (
                                  <div className="text-xs mt-1 opacity-90">
                                    au {formatDate(event.endDate).day} {formatDate(event.endDate).month}
                                  </div>
                                )}
                                <Icon className="w-5 h-5 mx-auto mt-2 opacity-75" />
                              </div>

                              {/* Image */}
                              {event.image && (
                                <div className="relative w-full md:w-48 h-32 md:h-auto flex-shrink-0">
                                  <Image
                                    src={event.image.startsWith('/') || event.image.startsWith('http') ? event.image : `/media/${event.image}`}
                                    alt={event.title}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              )}

                              {/* Contenu */}
                              <div className="flex-1 p-4 md:p-6">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span
                                        className="text-xs px-2 py-0.5 rounded-full text-white"
                                        style={{ backgroundColor: typeInfo.color }}
                                      >
                                        {typeInfo.label}
                                      </span>
                                      {event.ageRange && (
                                        <span className="text-xs text-gray-500">({event.ageRange})</span>
                                      )}
                                    </div>
                                    <h3 className="font-title text-xl font-bold text-[#0a0a0f]">
                                      {event.title}
                                    </h3>
                                    {event.subtitle && (
                                      <p className="text-[#844cfc] font-medium mt-1">{event.subtitle}</p>
                                    )}
                                    {event.description && (
                                      <p className="text-gray-600 mt-2 text-sm line-clamp-2">{event.description}</p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                                  {event.time && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {event.time}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {event.location}
                                  </div>
                                  {event.price && (
                                    <div className="flex items-center gap-1 font-medium text-[#844cfc]">
                                      <Ticket className="w-4 h-4" />
                                      {event.price}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Wave: Light -> Dark */}
        <ZigzagSeparator topColor="#faf8f5" bottomColor="var(--brand-violet)" />

        {/* CTA Section avec Aurora */}
        <AuroraHero className="min-h-[40vh]">
          <div className="container-custom py-20 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Ticket className="w-12 h-12 text-[#dbcbff] mx-auto mb-4" />
              <h2 className="font-title text-3xl md:text-4xl text-white mb-4">
                Réservations & Informations
              </h2>
              <p className="text-white/60 mb-6 max-w-2xl mx-auto">
                Pour réserver vos places ou obtenir plus d&apos;informations sur nos événements, contactez-nous directement.
              </p>
              {contactInfo && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 text-white/80">
                  <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                    <Phone className="w-4 h-4" />
                    {contactInfo.phone}
                  </a>
                  <span className="hidden sm:inline text-white/40">|</span>
                  <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                    <Mail className="w-4 h-4" />
                    {contactInfo.email}
                  </a>
                </div>
              )}
              <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
                Nous contacter <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </AuroraHero>
      </main>

      {/* Modal details evenement */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header avec image */}
              {selectedEvent.image && (
                <div className="relative h-48 w-full bg-[#0a0a0f]">
                  <Image
                    src={selectedEvent.image.startsWith('/') || selectedEvent.image.startsWith('http') ? selectedEvent.image : `/media/${selectedEvent.image}`}
                    alt={selectedEvent.title}
                    fill
                    className="object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {!selectedEvent.image && (
                <div className="flex justify-end p-4 border-b">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              <div className="p-6">
                {/* Type badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-xs px-3 py-1 rounded-full text-white"
                    style={{ backgroundColor: eventTypes[selectedEvent.type]?.color || '#844cfc' }}
                  >
                    {eventTypes[selectedEvent.type]?.label || selectedEvent.type}
                  </span>
                  {selectedEvent.ageRange && (
                    <span className="text-xs text-gray-500">({selectedEvent.ageRange})</span>
                  )}
                </div>

                {/* Titre */}
                <h2 className="font-title text-2xl font-bold text-[#0a0a0f] mb-1">
                  {selectedEvent.title}
                </h2>
                {selectedEvent.subtitle && (
                  <p className="text-[#844cfc] font-medium mb-4">{selectedEvent.subtitle}</p>
                )}

                {/* Date & Heure */}
                <div className="mt-4 p-4 bg-[#844cfc]/10 rounded-lg">
                  <div className="flex items-center gap-3 text-lg font-semibold text-[#0a0a0f]">
                    <Calendar className="w-5 h-5 text-[#844cfc]" />
                    {formatDate(selectedEvent.date).full}
                  </div>
                  {selectedEvent.endDate && (
                    <div className="flex items-center gap-3 mt-1 text-gray-600">
                      <span className="ml-8">au {formatDate(selectedEvent.endDate).full}</span>
                    </div>
                  )}
                  {selectedEvent.time && (
                    <div className="flex items-center gap-3 mt-2 text-gray-600">
                      <Clock className="w-5 h-5 text-[#844cfc]" />
                      {selectedEvent.time}
                    </div>
                  )}
                </div>

                {/* Lieu */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#844cfc] flex-shrink-0 mt-0.5" />
                    <p className="font-semibold text-[#0a0a0f]">{selectedEvent.location}</p>
                  </div>
                </div>

                {/* Description */}
                {selectedEvent.description && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-[#0a0a0f] mb-2">Description</h3>
                    <p className="text-gray-600 whitespace-pre-line">{selectedEvent.description}</p>
                  </div>
                )}

                {/* Tarif */}
                {selectedEvent.price && (
                  <div className="mt-4">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#dbcbff]/30 rounded-lg font-semibold text-[#0a0a0f]">
                      <Ticket className="w-4 h-4 text-[#844cfc]" />
                      {selectedEvent.price}
                    </span>
                  </div>
                )}

                {/* Documents PDF */}
                {selectedEvent.documents && selectedEvent.documents.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-[#0a0a0f] mb-2">Documents</h3>
                    <ul className="space-y-2">
                      {selectedEvent.documents.map((doc, idx) => (
                        <li key={idx}>
                          <a
                            href={doc.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-[#0a0a0f] transition-colors"
                          >
                            <FileText className="w-4 h-4 text-[#844cfc]" />
                            <span>{doc.title || 'Document'}</span>
                            <Download className="w-3.5 h-3.5 text-gray-400" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Liens billetterie et externe */}
                {(selectedEvent.ticketUrl || selectedEvent.externalUrl) && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex flex-wrap gap-3">
                      {selectedEvent.ticketUrl && (
                        <a
                          href={selectedEvent.ticketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#f02822] text-white rounded-lg hover:bg-[#d02020] transition-colors"
                        >
                          <Ticket className="w-4 h-4" />
                          Billetterie
                        </a>
                      )}
                      {selectedEvent.externalUrl && (
                        <a
                          href={selectedEvent.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#6a3acc] text-white rounded-lg hover:bg-[#5a2abc] transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          En savoir plus
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* CTA Contact */}
                <div className="mt-6 pt-6 border-t">
                  <p className="text-gray-500 text-sm mb-3">Pour réserver ou en savoir plus :</p>
                  <div className="flex flex-wrap gap-3">
                    {contactInfo?.phone && (
                      <a
                        href={`tel:${contactInfo.phone}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#844cfc] text-white rounded-lg hover:bg-[#6a3acc] transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        Appeler
                      </a>
                    )}
                    {contactInfo?.email && (
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        Envoyer un email
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
