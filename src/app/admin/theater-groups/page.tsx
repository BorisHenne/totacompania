'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  GraduationCap,
  Search,
  Loader2,
  Clock,
  MapPin,
  Euro,
  X,
  Save,
  GripVertical
} from 'lucide-react';

interface TheaterGroup {
  _id: string;
  name: string;
  ageRange: string;
  description?: string;
  schedule?: string;
  location?: string;
  price?: number;
  color?: string;
  order: number;
  active: boolean;
}

export default function TheaterGroupsAdmin() {
  const [groups, setGroups] = useState<TheaterGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingGroup, setEditingGroup] = useState<TheaterGroup | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const res = await fetch(`/api/admin/theater-groups?${params}`);
      if (res.ok) {
        const data = await res.json();
        setGroups(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [search]);

  const toggleActive = async (group: TheaterGroup) => {
    try {
      await fetch(`/api/admin/theater-groups/${group._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...group, active: !group.active })
      });
      setGroups(groups.map(g => g._id === group._id ? { ...g, active: !group.active } : g));
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  const deleteGroup = async (group: TheaterGroup) => {
    if (!confirm(`Supprimer le groupe "${group.name}" ?`)) return;
    try {
      await fetch(`/api/admin/theater-groups/${group._id}`, { method: 'DELETE' });
      setGroups(groups.filter(g => g._id !== group._id));
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const saveGroup = async () => {
    if (!editingGroup) return;
    setSaving(true);
    try {
      const isNew = !editingGroup._id;
      const url = isNew ? '/api/admin/theater-groups' : `/api/admin/theater-groups/${editingGroup._id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingGroup)
      });

      if (res.ok) {
        const saved = await res.json();
        if (isNew) {
          setGroups([...groups, saved]);
        } else {
          setGroups(groups.map(g => g._id === saved._id ? saved : g));
        }
        setEditingGroup(null);
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const createNewGroup = () => {
    setEditingGroup({
      _id: '',
      name: '',
      ageRange: '',
      description: '',
      schedule: '',
      location: 'Centre Culturel Vauban',
      price: 220,
      color: '#844cfc',
      order: groups.length,
      active: true
    });
  };

  const handleReorder = async (newGroups: TheaterGroup[]) => {
    // Update local state immediately
    const reorderedGroups = newGroups.map((group, index) => ({
      ...group,
      order: index
    }));
    setGroups(reorderedGroups);

    // Save new order to backend
    try {
      await Promise.all(
        reorderedGroups.map(group =>
          fetch(`/api/admin/theater-groups/${group._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(group)
          })
        )
      );
    } catch (error) {
      console.error('Error saving order:', error);
      fetchGroups(); // Revert on error
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-title font-bold" style={{ color: '#f02822' }}>
            Groupes Theatre
          </h1>
          <p className="text-gray-600">
            {groups.length} groupe{groups.length > 1 ? 's' : ''} configure{groups.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={createNewGroup}
          className="inline-flex items-center gap-2 px-4 py-2 text-white transition-colors"
          style={{ backgroundColor: '#844cfc' }}
        >
          <Plus className="w-4 h-4" />
          Nouveau groupe
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un groupe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-[#844cfc]/20 focus:border-[#844cfc] focus:ring-1 focus:ring-[#844cfc] outline-none transition-colors"
        />
      </div>

      {/* Groups list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#844cfc]" />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12 bg-white border border-[#844cfc]/10">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Aucun groupe trouve</p>
          <button
            onClick={createNewGroup}
            className="mt-4 text-[#844cfc] hover:underline"
          >
            Creer un premier groupe
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-[#844cfc]/10 overflow-hidden">
          <Reorder.Group axis="y" values={groups} onReorder={handleReorder} className="divide-y divide-[#844cfc]/10">
            {groups.map((group) => (
              <Reorder.Item
                key={group._id}
                value={group}
                className={`p-4 hover:bg-[#dbcbff]/10 transition-colors cursor-pointer ${!group.active ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  <div
                    className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-white"
                    style={{ backgroundColor: group.color || '#844cfc' }}
                  >
                    <GraduationCap className="w-6 h-6" />
                  </div>

                  <div
                    className="flex-grow min-w-0"
                    onClick={() => setEditingGroup(group)}
                  >
                    <h3 className="font-medium text-gray-900">{group.name}</h3>
                    <p className="text-sm text-[#844cfc] font-medium">{group.ageRange}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      {group.schedule && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {group.schedule}
                        </span>
                      )}
                      {group.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {group.location}
                        </span>
                      )}
                      {group.price && (
                        <span className="flex items-center gap-1">
                          <Euro className="w-3 h-3" />
                          {group.price}e
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleActive(group); }}
                      className={`p-2 transition-colors ${
                        group.active
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={group.active ? 'Desactiver' : 'Activer'}
                    >
                      {group.active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteGroup(group); }}
                      className="p-2 text-[#f02822] hover:bg-red-50 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setEditingGroup(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#844cfc]/10 flex items-center justify-between">
                <h2 className="text-xl font-title font-bold" style={{ color: '#f02822' }}>
                  {editingGroup._id ? 'Modifier le groupe' : 'Nouveau groupe'}
                </h2>
                <button
                  onClick={() => setEditingGroup(null)}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du groupe *
                    </label>
                    <input
                      type="text"
                      value={editingGroup.name}
                      onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                      className="w-full px-3 py-2 border border-[#844cfc]/20 focus:border-[#844cfc] focus:ring-1 focus:ring-[#844cfc] outline-none"
                      placeholder="Ex: Mini Troupes"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tranche d&apos;age *
                    </label>
                    <input
                      type="text"
                      value={editingGroup.ageRange}
                      onChange={(e) => setEditingGroup({ ...editingGroup, ageRange: e.target.value })}
                      className="w-full px-3 py-2 border border-[#844cfc]/20 focus:border-[#844cfc] focus:ring-1 focus:ring-[#844cfc] outline-none"
                      placeholder="Ex: 6-8 ans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingGroup.description || ''}
                    onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-[#844cfc]/20 focus:border-[#844cfc] focus:ring-1 focus:ring-[#844cfc] outline-none resize-none"
                    placeholder="Description du groupe..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horaires
                    </label>
                    <input
                      type="text"
                      value={editingGroup.schedule || ''}
                      onChange={(e) => setEditingGroup({ ...editingGroup, schedule: e.target.value })}
                      className="w-full px-3 py-2 border border-[#844cfc]/20 focus:border-[#844cfc] focus:ring-1 focus:ring-[#844cfc] outline-none"
                      placeholder="Ex: Mercredi 14h-15h30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lieu
                    </label>
                    <input
                      type="text"
                      value={editingGroup.location || ''}
                      onChange={(e) => setEditingGroup({ ...editingGroup, location: e.target.value })}
                      className="w-full px-3 py-2 border border-[#844cfc]/20 focus:border-[#844cfc] focus:ring-1 focus:ring-[#844cfc] outline-none"
                      placeholder="Ex: Centre Culturel Vauban"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tarif annuel (e)
                    </label>
                    <input
                      type="number"
                      value={editingGroup.price || ''}
                      onChange={(e) => setEditingGroup({ ...editingGroup, price: parseFloat(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border border-[#844cfc]/20 focus:border-[#844cfc] focus:ring-1 focus:ring-[#844cfc] outline-none"
                      placeholder="220"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Couleur du groupe
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={editingGroup.color || '#844cfc'}
                        onChange={(e) => setEditingGroup({ ...editingGroup, color: e.target.value })}
                        className="w-16 h-10 border border-[#844cfc]/20 cursor-pointer rounded"
                      />
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={editingGroup.color || '#844cfc'}
                          onChange={(e) => setEditingGroup({ ...editingGroup, color: e.target.value })}
                          className="w-full px-3 py-2 border border-[#844cfc]/20 focus:border-[#844cfc] focus:ring-1 focus:ring-[#844cfc] outline-none"
                          placeholder="#844cfc"
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-medium shadow-sm"
                        style={{ backgroundColor: editingGroup.color || '#844cfc' }}
                      >
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <span className="text-xs text-gray-500">Aperçu de la couleur</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={editingGroup.active}
                    onChange={(e) => setEditingGroup({ ...editingGroup, active: e.target.checked })}
                    className="w-4 h-4 text-[#844cfc] border-[#844cfc]/20 focus:ring-[#844cfc]"
                  />
                  <label htmlFor="active" className="text-sm text-gray-700">
                    Groupe actif (visible sur le site)
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-[#844cfc]/10 flex justify-end gap-3">
                <button
                  onClick={() => setEditingGroup(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={saveGroup}
                  disabled={saving || !editingGroup.name || !editingGroup.ageRange}
                  className="inline-flex items-center gap-2 px-4 py-2 text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#844cfc' }}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
