'use client';

import NewsletterEditor from '@/components/admin/NewsletterEditor';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Mail,
  Users,
  UserX,
  AlertTriangle,
  Search,
  Plus,
  Download,
  Trash2,
  Edit2,
  X,
  Check,
  Loader2,
  RefreshCw,
  Send,
  FileText,
  Bold,
  Italic,
  Underline,
  List,
  Link2,
  Smile,
  Eye,
  EyeOff
} from 'lucide-react';

interface Subscriber {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  source: 'website' | 'import' | 'admin';
  subscribedAt: string;
  unsubscribedAt?: string;
  tags: string[];
}

interface Stats {
  total: number;
  active: number;
  unsubscribed: number;
  bounced: number;
}

export default function NewsletterAdmin() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, unsubscribed: 0, bounced: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
  const [activeTab, setActiveTab] = useState<'subscribers' | 'compose'>('subscribers');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{success: boolean; message: string} | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, [page, statusFilter, search]);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(search && { search })
      });

      const res = await fetch(`/api/admin/newsletter?${params}`);
      const data = await res.json();

      setSubscribers(data.subscribers || []);
      setStats(data.stats || { total: 0, active: 0, unsubscribed: 0, bounced: 0 });
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/newsletter/export?${params}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Export error:', error);
      alert('Erreur lors de l export');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Supprimer ${selectedIds.length} abonne(s) ?`)) return;

    try {
      await fetch('/api/admin/newsletter', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      setSelectedIds([]);
      fetchSubscribers();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleDeleteOne = async (id: string) => {
    if (!confirm('Supprimer cet abonne ?')) return;

    try {
      await fetch(`/api/admin/newsletter/${id}`, { method: 'DELETE' });
      fetchSubscribers();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === subscribers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(subscribers.map(s => s._id));
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Actif</span>;
      case 'unsubscribed':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">Desabonne</span>;
      case 'bounced':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">Erreur</span>;
      default:
        return null;
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'website':
        return <span className="text-xs text-gray-500">Site web</span>;
      case 'admin':
        return <span className="text-xs text-purple-600">Admin</span>;
      case 'import':
        return <span className="text-xs text-blue-600">Import</span>;
      default:
        return null;
    }
  };

  const insertFormatting = (tag: string) => {
    const textarea = document.getElementById('email-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = emailContent.substring(start, end);

    let newText = '';
    if (tag === 'bold') {
      newText = `**${selectedText}**`;
    } else if (tag === 'italic') {
      newText = `*${selectedText}*`;
    } else if (tag === 'underline') {
      newText = `<u>${selectedText}</u>`;
    } else if (tag === 'list') {
      newText = `\n- ${selectedText}`;
    } else if (tag === 'link') {
      const url = prompt('URL du lien:');
      if (url) newText = `[${selectedText || 'Lien'}](${url})`;
      else return;
    }

    setEmailContent(
      emailContent.substring(0, start) + newText + emailContent.substring(end)
    );
  };

  const insertEmoji = (emoji: string) => {
    const textarea = document.getElementById('email-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    setEmailContent(
      emailContent.substring(0, start) + emoji + emailContent.substring(start)
    );
  };

  const handleSendTest = async () => {
    if (!testEmail || !emailSubject || !emailContent) {
      alert('Remplissez tous les champs et entrez un email de test');
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailSubject,
          htmlContent: emailContent,
          testEmail: testEmail
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSendResult({ success: true, message: `Email de test envoye a ${testEmail}` });
      } else {
        setSendResult({ success: false, message: data.error || 'Erreur lors de l envoi' });
      }
    } catch {
      setSendResult({ success: false, message: 'Erreur de connexion' });
    } finally {
      setSending(false);
    }
  };

  const handleSendAll = async () => {
    if (!emailSubject || !emailContent) {
      alert('Remplissez le sujet et le contenu');
      return;
    }

    if (!confirm(`Envoyer la newsletter a ${stats.active} abonnes actifs ?`)) {
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailSubject,
          htmlContent: emailContent,
          sendToAll: true
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSendResult({ success: true, message: `Newsletter envoyee a ${data.sent} abonnes` });
        setEmailSubject('');
        setEmailContent('');
      } else {
        setSendResult({ success: false, message: data.error || 'Erreur lors de l envoi' });
      }
    } catch {
      setSendResult({ success: false, message: 'Erreur de connexion' });
    } finally {
      setSending(false);
    }
  };

  const commonEmojis = ['😊', '🎭', '🎪', '🎬', '✨', '🎉', '👏', '❤️', '🌟', '📅', '📍', '🎵', '🎨', '👋', '🙏'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Newsletter</h1>
          <p className="text-gray-600">Gerez vos abonnes et envoyez des newsletters</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Importer</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'subscribers'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Abonnes
          </div>
        </button>
        <button
          onClick={() => setActiveTab('compose')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'compose'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Composer
          </div>
        </button>
      </div>

      {activeTab === 'subscribers' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                  <p className="text-sm text-gray-500">Actifs</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <UserX className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.unsubscribed}</p>
                  <p className="text-sm text-gray-500">Desabonnes</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.bounced}</p>
                  <p className="text-sm text-gray-500">Erreurs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par email ou nom..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="unsubscribed">Desabonnes</option>
                <option value="bounced">Erreurs</option>
              </select>
              <button
                onClick={() => fetchSubscribers()}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {selectedIds.length > 0 && (
              <div className="mt-4 flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700">{selectedIds.length} selectionne(s)</span>
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="mt-2 text-gray-500">Chargement...</p>
              </div>
            ) : subscribers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucun abonne trouve</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedIds.length === subscribers.length && subscribers.length > 0}
                            onChange={toggleSelectAll}
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Nom</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Source</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Date</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {subscribers.map((sub) => (
                        <tr key={sub._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(sub._id)}
                              onChange={() => toggleSelect(sub._id)}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-900">{sub.email}</span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-gray-600">
                              {sub.firstName || sub.lastName
                                ? `${sub.firstName || ''} ${sub.lastName || ''}`.trim()
                                : '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(sub.status)}</td>
                          <td className="px-4 py-3 hidden lg:table-cell">{getSourceBadge(sub.source)}</td>
                          <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-sm">
                            {formatDate(sub.subscribedAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => setEditingSubscriber(sub)}
                                className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteOne(sub._id)}
                                className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                      Precedent
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {page} sur {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        /* Compose Tab */
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Composer une newsletter</h2>

            {/* Subject */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sujet de l email
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Ex: Les prochains spectacles de Tota Compania"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Rich Text Editor */}
            <NewsletterEditor content={emailContent} onChange={setEmailContent} />


            {/* Send Result */}
            {sendResult && (
              <div className={`mt-4 p-3 rounded-lg ${sendResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {sendResult.message}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Email de test..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={handleSendTest}
                  disabled={sending || !testEmail || !emailSubject || !emailContent}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Test
                </button>
              </div>
              <button
                onClick={handleSendAll}
                disabled={sending || !emailSubject || !emailContent}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Envoyer a {stats.active} abonnes
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-medium text-blue-900 mb-2">Conseils</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Utilisez les variables pour personnaliser vos messages</li>
              <li>• Testez toujours votre email avant l envoi massif</li>
              <li>• Les liens en markdown [texte](url) seront cliquables</li>
              <li>• Un lien de desabonnement est ajoute automatiquement</li>
            </ul>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <AddSubscriberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => { setShowAddModal(false); fetchSubscribers(); }}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => { setShowImportModal(false); fetchSubscribers(); }}
      />

      {/* Edit Modal */}
      <EditSubscriberModal
        subscriber={editingSubscriber}
        onClose={() => setEditingSubscriber(null)}
        onSuccess={() => { setEditingSubscriber(null); fetchSubscribers(); }}
      />
    </div>
  );
}

// Add Subscriber Modal
function AddSubscriberModal({
  isOpen,
  onClose,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur');
        return;
      }

      setEmail('');
      setFirstName('');
      setLastName('');
      onSuccess();
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Ajouter un abonne</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prenom
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Ajouter
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Edit Subscriber Modal
function EditSubscriberModal({
  subscriber,
  onClose,
  onSuccess
}: {
  subscriber: Subscriber | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [status, setStatus] = useState<'active' | 'unsubscribed' | 'bounced'>('active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (subscriber) {
      setFirstName(subscriber.firstName || '');
      setLastName(subscriber.lastName || '');
      setStatus(subscriber.status);
    }
  }, [subscriber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriber) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/newsletter/${subscriber._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, status })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur');
        return;
      }

      onSuccess();
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  if (!subscriber) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Modifier l abonne</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={subscriber.email}
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prenom
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'unsubscribed' | 'bounced')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="active">Actif</option>
              <option value="unsubscribed">Desabonne</option>
              <option value="bounced">Erreur</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <Check className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Import Modal
function ImportModal({
  isOpen,
  onClose,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    total: number;
    imported: number;
    duplicates: number;
    invalid: number;
  } | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/newsletter/import', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur lors de l import');
        return;
      }

      setResults(data.results);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Importer des abonnes</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fichier CSV ou Excel
            </label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-1 text-xs text-gray-500">
              Colonnes attendues: email, prenom, nom (ou firstName, lastName)
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {results && (
            <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm space-y-1">
              <p><strong>{results.imported}</strong> abonnes importes</p>
              <p><strong>{results.duplicates}</strong> doublons ignores</p>
              <p><strong>{results.invalid}</strong> emails invalides</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Fermer
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Importer
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
