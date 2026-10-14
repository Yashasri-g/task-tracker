'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { exportAllData, validateBackupFile, importData, getStorageStats } from '@/lib/utils/exportImport';
import type { ExportBackup, StorageStats } from '@/types';
import { Settings, Download, Upload, Trash2, Database, ShieldAlert, RefreshCw, HelpCircle, Bell, Volume2, ShieldCheck } from 'lucide-react';
import {
  getSavedNotificationSound,
  setSavedNotificationSound,
  playNotificationChime,
  type NotificationSound,
} from '@/lib/utils/notifications';

export default function SettingsPage() {
  const {
    preferences,
    updatePreferences,
    reloadDemoData,
    clearDatabase,
    showToast,
    isLoading,
    openTour,
    notificationPermission,
    requestAlertPermission,
    triggerTestNotification,
  } = useApp();

  const [stats, setStats] = useState<StorageStats | null>(null);
  const [selectedSound, setSelectedSound] = useState<NotificationSound>('bell');
  const [importFile, setImportFile] = useState<ExportBackup | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importError, setImportError] = useState<string | undefined>(undefined);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    getStorageStats().then(setStats);
    setSelectedSound(getSavedNotificationSound());
  }, []);

  const handleSelectSound = (sound: NotificationSound) => {
    setSelectedSound(sound);
    setSavedNotificationSound(sound);
    playNotificationChime(sound);
    const soundNames = {
      'bell': 'Double Resonant Bell',
      'desk-bell': 'Service Desk Bell',
      'urgent-alert': 'Triple Rising Alert',
    };
    showToast('Sound Profile Updated', `Active sound set to: ${soundNames[sound]}.`, 'success');
  };

  const handlePlaySoundPreview = (sound: NotificationSound) => {
    playNotificationChime(sound);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const handleExport = async () => {
    const backup = await exportAllData();
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `command_center_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Export Created', 'JSON backup file downloaded safely.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        const val = validateBackupFile(json);
        if (val.valid && val.backup) {
          setImportFile(val.backup);
          setImportError(undefined);
          setIsImportModalOpen(true);
        } else {
          setImportError(val.error || 'Invalid backup structure.');
          setIsImportModalOpen(true);
        }
      } catch (err) {
        setImportError('File is not a valid JSON document.');
        setIsImportModalOpen(true);
      }
    };
    reader.readAsText(file);
  };

  const handlePerformImport = async () => {
    if (!importFile) return;
    const res = await importData(importFile, importMode);
    if (res.success) {
      showToast('Import Successful', res.stats, 'success');
      setIsImportModalOpen(false);
      setImportFile(null);
      getStorageStats().then(setStats);
    } else {
      setImportError(res.stats);
    }
  };

  const handleClearData = async () => {
    await clearDatabase();
    setConfirmClear(false);
    getStorageStats().then(setStats);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          Settings & Backup Management
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage local storage statistics, workspace JSON backups, security reliability, and data resets.
        </p>
      </div>

      {/* Notifications & System Alerts Settings Card */}
      <Card className="p-5 space-y-4">
        <CardHeader className="pb-3 mb-0 border-b-0">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" /> System Alerts & Desktop Notifications
          </CardTitle>
        </CardHeader>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Desktop & Audio Alerts</span>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  notificationPermission === 'granted'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : notificationPermission === 'denied'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {notificationPermission === 'granted'
                  ? 'Active / Allowed'
                  : notificationPermission === 'denied'
                  ? 'Blocked in OS/Browser'
                  : 'Action Needed'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-lg">
              Receive timely desktop popups and resonant bell alerts when scheduled task reminders and due commitments trigger.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {notificationPermission !== 'granted' && (
              <Button
                size="sm"
                variant="primary"
                onClick={requestAlertPermission}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                icon={<ShieldCheck className="w-3.5 h-3.5" />}
              >
                Enable Notifications
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                triggerTestNotification();
              }}
              icon={<Volume2 className="w-3.5 h-3.5 text-indigo-600" />}
            >
              Ring Test Bell
            </Button>
          </div>
        </div>

        {/* Sound Selection Options */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Alert Sound & Tone</h4>
              <p className="text-[11px] text-slate-500">Choose the acoustic sound profile that best gets your attention.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                id: 'bell' as NotificationSound,
                name: 'Double Resonant Bell',
                desc: 'Crisp, high-attention double ring (Ding-Ding!)',
                badge: 'Recommended',
              },
              {
                id: 'desk-bell' as NotificationSound,
                name: 'Service Desk Bell',
                desc: 'Bright metallic counter bell strike (Ding!)',
                badge: 'Punchy',
              },
              {
                id: 'urgent-alert' as NotificationSound,
                name: 'Triple Rising Alert',
                desc: 'Fast 3-note ascending alert chime',
                badge: 'Unmissable',
              },
            ].map((s) => {
              const isSelected = selectedSound === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => handleSelectSound(s.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-2xs'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{s.name}</span>
                      <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white text-indigo-600 border border-indigo-100">
                        {s.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-indigo-600">
                      {isSelected ? '✓ Active Sound' : 'Select'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaySoundPreview(s.id);
                      }}
                      className="p-1 hover:bg-white rounded text-slate-500 hover:text-indigo-600 transition-colors"
                      title={`Preview ${s.name}`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Storage Information & Backup */}
      <Card className="p-5 space-y-4">
        <CardHeader className="pb-3 mb-0 border-b-0">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" /> Local Storage Statistics (IndexedDB)
          </CardTitle>
        </CardHeader>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block">Total Tasks</span>
              <strong className="text-sm text-slate-900">{stats.taskCount}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Follow-Ups</span>
              <strong className="text-sm text-slate-900">{stats.followUpCount}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Notes & Meetings</span>
              <strong className="text-sm text-slate-900">{stats.noteCount + stats.meetingCount}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Est. Data Size</span>
              <strong className="text-sm text-indigo-600">{stats.estimatedSizeKb} KB</strong>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-bold text-slate-800">Data Backup & Recovery</h4>
          <p className="text-xs text-slate-500">
            Export a full JSON backup of all tasks, notes, meetings, journal entries, and follow-ups for offline safekeeping.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleExport} variant="primary" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" icon={<Download className="w-4 h-4" />}>
              Export Workspace JSON
            </Button>

            <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer shadow-2xs">
              <Upload className="w-4 h-4 text-emerald-600" />
              Import Backup File
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      </Card>

      {/* Demo Data & Reset Controls */}
      <Card className="p-5 space-y-4">
        <CardHeader className="pb-3 mb-0 border-b-0">
          <CardTitle className="text-sm flex items-center gap-2 text-rose-600">
            <ShieldAlert className="w-4 h-4" /> Workspace Operations & Data Reset
          </CardTitle>
        </CardHeader>

        <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Replay Executive Product Tour</h4>
            <p className="text-[11px] text-slate-500">Take an interactive tour of the workspace features, navigation, and shortcuts.</p>
          </div>
          <Button size="sm" variant="outline" onClick={openTour} icon={<HelpCircle className="w-3.5 h-3.5 text-indigo-600" />}>
            Replay Tour
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Load Executive Demo Sample Data</h4>
            <p className="text-[11px] text-slate-500">Populate workspace with realistic executive tasks, projects, and meeting notes.</p>
          </div>
          <Button size="sm" variant="outline" onClick={reloadDemoData} icon={<RefreshCw className="w-3.5 h-3.5 text-indigo-600" />}>
            Load Demo Data
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-rose-50/60 rounded-xl border border-rose-200">
          <div>
            <h4 className="text-xs font-bold text-rose-700">Clear All Workspace Data</h4>
            <p className="text-[11px] text-rose-600/80">Wipe all tasks, projects, notes, and local items. Cannot be undone unless backed up.</p>
          </div>

          {confirmClear ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-700">Are you sure?</span>
              <Button size="sm" variant="danger" onClick={handleClearData}>Yes, Clear All</Button>
              <Button size="sm" variant="outline" onClick={() => setConfirmClear(false)}>Cancel</Button>
            </div>
          ) : (
            <Button size="sm" variant="danger" onClick={() => setConfirmClear(true)} icon={<Trash2 className="w-4 h-4" />}>
              Clear Local Data
            </Button>
          )}
        </div>
      </Card>

      {/* Import Modal */}
      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Workspace Backup">
        {importError ? (
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              <strong className="block font-bold">Import Failed Validation:</strong>
              {importError}
            </div>
            <Button onClick={() => setIsImportModalOpen(false)} variant="outline" size="sm">Close</Button>
          </div>
        ) : importFile ? (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Valid backup file found! Exported on: <strong>{importFile.exportedAt}</strong>
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div>Tasks to import: <strong>{importFile.tasks?.length || 0}</strong></div>
              <div>Projects to import: <strong>{importFile.projects?.length || 0}</strong></div>
              <div>Notes & Meetings: <strong>{(importFile.notes?.length || 0) + (importFile.meetings?.length || 0)}</strong></div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Import Mode</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="merge"
                    checked={importMode === 'merge'}
                    onChange={() => setImportMode('merge')}
                  />
                  <span>Merge with existing items</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                  />
                  <span className="text-rose-600 font-semibold">Replace entire workspace</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handlePerformImport} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Perform Import
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
