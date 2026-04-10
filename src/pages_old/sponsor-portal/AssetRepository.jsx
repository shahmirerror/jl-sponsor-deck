import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { Download } from 'lucide-react';
import { fileHelpers, sponsorPortalHelpers } from '../../lib/supabaseHelpers';

const AssetRepository = ({ sponsor }) => {
    const [documents, setDocuments] = useState([]);
    const [assets, setAssets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [syncError, setSyncError] = useState('');
    const [showAssetForm, setShowAssetForm] = useState(false);
    const [editingAssetId, setEditingAssetId] = useState(null);
    const [isSavingAsset, setIsSavingAsset] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [uploadedFrom, setUploadedFrom] = useState('');
    const [uploadedTo, setUploadedTo] = useState('');
    const [docSort, setDocSort] = useState({ key: 'uploadedOn', direction: 'desc' });
    const [assetSort, setAssetSort] = useState({ key: 'uploadedOn', direction: 'desc' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [assetFormData, setAssetFormData] = useState({
        name: '',
        type: 'PNG',
        details: '',
        fileUrl: '',
        assetCategory: 'media',
    });

    useEffect(() => {
        let active = true;

        const loadRepository = async () => {
            if (!sponsor?.email) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const liveResult = await sponsorPortalHelpers.getDocumentsAndAssetsByEmail(sponsor.email);
                if (liveResult?.error) {
                    throw liveResult.error;
                }

                if (active) {
                    setDocuments(liveResult.data?.documents || []);
                    setAssets(liveResult.data?.assets || []);
                    setSyncError('');
                }
            } catch (error) {
                if (active) {
                    setDocuments([]);
                    setAssets([]);
                    setSyncError(error?.message || 'Unable to load repository data from database.');
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        loadRepository();

        return () => {
            active = false;
        };
    }, [sponsor?.email]);

    const clearAssetForm = () => {
        setAssetFormData({
            name: '',
            type: 'PNG',
            details: '',
            fileUrl: '',
            assetCategory: 'media',
        });
        setSelectedFile(null);
        setEditingAssetId(null);
    };

    const closeAssetForm = () => {
        setShowAssetForm(false);
        clearAssetForm();
    };

    const openCreateAssetForm = () => {
        clearAssetForm();
        setShowAssetForm(true);
    };

    const openEditAssetForm = (item) => {
        setEditingAssetId(item.id);
        setAssetFormData({
            name: item.name || '',
            type: item.type || 'PNG',
            details: item.details || '',
            fileUrl: item.fileUrl || '',
            assetCategory: item.assetCategory || 'media',
        });
        setShowAssetForm(true);
    };

    const upsertAssetInLists = (item) => {
        const isDocument = String(item.assetCategory || '').toLowerCase() === 'document';

        if (isDocument) {
            setDocuments((prev) => {
                const exists = prev.some((entry) => entry.id === item.id);
                return exists ? prev.map((entry) => (entry.id === item.id ? item : entry)) : [item, ...prev];
            });
            setAssets((prev) => prev.filter((entry) => entry.id !== item.id));
            return;
        }

        setAssets((prev) => {
            const exists = prev.some((entry) => entry.id === item.id);
            return exists ? prev.map((entry) => (entry.id === item.id ? item : entry)) : [item, ...prev];
        });
        setDocuments((prev) => prev.filter((entry) => entry.id !== item.id));
    };

    const handleAssetFormSubmit = async (event) => {
        event.preventDefault();

        const trimmedName = String(assetFormData.name || '').trim();
        if (!trimmedName) {
            setSyncError('Asset name is required.');
            return;
        }

        if (!editingAssetId && !selectedFile) {
            setSyncError('Please choose a file to upload.');
            return;
        }

        setIsSavingAsset(true);
        try {
            let resolvedFileUrl = String(assetFormData.fileUrl || '').trim();
            let resolvedType = String(assetFormData.type || 'PNG').trim().toUpperCase();
            let resolvedDetails = String(assetFormData.details || '').trim();

            if (selectedFile) {
                const ownerId = sponsor?.id || sponsor?.email || 'sponsor';
                const uploadResult = await fileHelpers.uploadSponsorAsset(ownerId, selectedFile);
                if (uploadResult?.error || !uploadResult?.data?.path) {
                    throw uploadResult?.error || new Error('File upload failed.');
                }

                const publicUrl = fileHelpers.getPublicUrl('sponsor-assets', uploadResult.data.path);
                resolvedFileUrl = publicUrl || resolvedFileUrl;

                const extension = selectedFile.name.split('.').pop();
                if (extension) {
                    resolvedType = extension.toUpperCase();
                }

                if (!resolvedDetails) {
                    resolvedDetails = `${Math.max(1, Math.round(selectedFile.size / 1024)).toLocaleString('en-US')} KB`;
                }
            }

            if (editingAssetId) {
                const liveResult = await sponsorPortalHelpers.updateAssetByEmail(sponsor.email, editingAssetId, {
                    name: trimmedName,
                    type: resolvedType,
                    details: resolvedDetails,
                    fileUrl: resolvedFileUrl,
                    assetCategory: assetFormData.assetCategory,
                });

                if (liveResult?.error) {
                    throw liveResult.error;
                }

                upsertAssetInLists(liveResult.data);
            } else {
                const liveResult = await sponsorPortalHelpers.createAssetByEmail(sponsor.email, {
                    name: trimmedName,
                    type: resolvedType,
                    details: resolvedDetails,
                    fileUrl: resolvedFileUrl,
                    assetCategory: assetFormData.assetCategory,
                });

                if (liveResult?.error) {
                    throw liveResult.error;
                }

                upsertAssetInLists(liveResult.data);
            }

            setSyncError('');
            closeAssetForm();
        } catch (error) {
            setSyncError(error?.message || 'Unable to save asset metadata.');
        } finally {
            setIsSavingAsset(false);
        }
    };

    const handleDeleteAsset = async (item) => {
        setDeleteTarget(item);
    };

    const confirmDeleteAsset = async () => {
        if (!deleteTarget) {
            return;
        }

        try {
            const liveResult = await sponsorPortalHelpers.deleteAssetByEmail(sponsor.email, deleteTarget.id);
            if (liveResult?.error) {
                throw liveResult.error;
            }

            setDocuments((prev) => prev.filter((entry) => entry.id !== deleteTarget.id));
            setAssets((prev) => prev.filter((entry) => entry.id !== deleteTarget.id));
            setSyncError('');
        } catch (error) {
            setSyncError(error?.message || 'Unable to delete asset.');
        } finally {
            setDeleteTarget(null);
        }
    };

    const handleDownloadFile = async (item) => {
        const url = String(item.fileUrl || '').trim();
        if (!url) {
            setSyncError('No file URL is saved for this item.');
            return;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Download failed.');
            }

            const blob = await response.blob();
            const objectUrl = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');

            const normalizedType = String(item.type || '').toLowerCase();
            const fallbackExt = normalizedType && !normalizedType.includes('/') ? normalizedType : 'bin';
            const safeName = String(item.name || 'asset').trim().replace(/[\\/:*?"<>|]/g, '_');
            const hasExtension = /\.[a-z0-9]+$/i.test(safeName);
            const fileName = hasExtension ? safeName : `${safeName}.${fallbackExt}`;

            anchor.href = objectUrl;
            anchor.download = fileName;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.URL.revokeObjectURL(objectUrl);
            setSyncError('');
        } catch (error) {
            setSyncError(error?.message || 'Unable to download this file.');
        }
    };

    const normalizeDate = (value) => String(value || '').slice(0, 10);
    const query = searchQuery.trim().toLowerCase();
    const typeFilterNormalized = String(typeFilter || 'All').toUpperCase();

    const baseFilter = (item) => {
        const matchesSearch = !query
            || String(item.name || '').toLowerCase().includes(query)
            || String(item.type || '').toLowerCase().includes(query)
            || String(item.details || '').toLowerCase().includes(query);

        const matchesType = typeFilter === 'All' || String(item.type || '').toUpperCase() === typeFilterNormalized;
        const uploadedDate = normalizeDate(item.uploadedOn);
        const matchesFrom = !uploadedFrom || (uploadedDate && uploadedDate >= uploadedFrom);
        const matchesTo = !uploadedTo || (uploadedDate && uploadedDate <= uploadedTo);

        return matchesSearch && matchesType && matchesFrom && matchesTo;
    };

    const sortItems = (items, sortConfig) => {
        const getValue = (item, key) => {
            if (key === 'uploadedOn') {
                return String(item.uploadedOn || '0000-01-01');
            }
            return String(item[key] || '').toLowerCase();
        };

        return [...items].sort((left, right) => {
            const leftValue = getValue(left, sortConfig.key);
            const rightValue = getValue(right, sortConfig.key);

            if (leftValue < rightValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (leftValue > rightValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    const filteredDocuments = sortItems(documents.filter(baseFilter), docSort);
    const filteredAssets = sortItems(assets.filter(baseFilter), assetSort);

    const toggleDocSort = (key) => {
        setDocSort((prev) => (prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' }));
    };

    const toggleAssetSort = (key) => {
        setAssetSort((prev) => (prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' }));
    };

    const sortArrow = (sortConfig, key) => {
        if (sortConfig.key !== key) return '↕';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    const uniqueTypes = Array.from(new Set([...documents, ...assets].map((item) => String(item.type || '').toUpperCase()).filter(Boolean))).sort();

    const clearFilters = () => {
        setSearchQuery('');
        setTypeFilter('All');
        setUploadedFrom('');
        setUploadedTo('');
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
                <div>
                    <SectionLabel text="Documents & Assets" />
                    <h2 className="mt-2">Asset Repository & Vault</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '720px' }}>
                        Centralized access to sponsorship agreements, invoices, payment proofs, and your brand assets for our marketing team.
                    </p>
                </div>
                <Button onClick={openCreateAssetForm}>Add Asset</Button>
            </div>

            {isLoading && <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Loading repository...</p>}
            {syncError && <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{syncError}</p>}

            {showAssetForm && (
                <Card style={{ marginBottom: '18px' }}>
                    <h4 style={{ marginBottom: '14px' }}>{editingAssetId ? 'Edit Asset' : 'Add New Asset'}</h4>
                    <form onSubmit={handleAssetFormSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                            <div>
                                <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Name</label>
                                <input type="text" value={assetFormData.name} onChange={(event) => setAssetFormData((prev) => ({ ...prev, name: event.target.value }))} required style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Type</label>
                                <input type="text" value={assetFormData.type} onChange={(event) => setAssetFormData((prev) => ({ ...prev, type: event.target.value }))} style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Category</label>
                                <select value={assetFormData.assetCategory} onChange={(event) => setAssetFormData((prev) => ({ ...prev, assetCategory: event.target.value }))} style={{ width: '100%' }}>
                                    <option value="media">Media / Asset</option>
                                    <option value="document">Document</option>
                                </select>
                            </div>
                            <div>
                                <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Details</label>
                                <input type="text" value={assetFormData.details} onChange={(event) => setAssetFormData((prev) => ({ ...prev, details: event.target.value }))} style={{ width: '100%' }} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="label" style={{ marginBottom: '6px', display: 'block' }}>
                                    File {editingAssetId ? '(optional: upload new file to replace existing)' : '*'}
                                </label>
                                <input
                                    type="file"
                                    onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                                    required={!editingAssetId}
                                    style={{ width: '100%' }}
                                />
                                {selectedFile ? (
                                    <p style={{ marginTop: '6px', marginBottom: 0, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                                        Selected: {selectedFile.name}
                                    </p>
                                ) : null}
                                {editingAssetId && assetFormData.fileUrl ? (
                                    <p style={{ marginTop: '6px', marginBottom: 0, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                                        Current file URL saved.
                                    </p>
                                ) : null}
                            </div>
                        </div>
                        <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
                            <Button type="submit" disabled={isSavingAsset}>{isSavingAsset ? 'Saving...' : (editingAssetId ? 'Save Changes' : 'Create Asset')}</Button>
                            <button type="button" onClick={closeAssetForm} style={{ padding: '9px 13px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </form>
                </Card>
            )}

            <Card style={{ marginBottom: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', alignItems: 'end' }}>
                    <div>
                        <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Search</label>
                        <input type="text" placeholder="Name, type, details" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Type</label>
                        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} style={{ width: '100%' }}>
                            <option value="All">All</option>
                            {uniqueTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Uploaded From</label>
                        <input type="date" value={uploadedFrom} onChange={(event) => setUploadedFrom(event.target.value)} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Uploaded To</label>
                        <input type="date" value={uploadedTo} onChange={(event) => setUploadedTo(event.target.value)} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <button type="button" onClick={clearFilters} style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            Clear Filters
                        </button>
                    </div>
                </div>
            </Card>

            {/* Documents Section */}
            <div className="mb-8">
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Official Documents</h3>
                <Card>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                        <button type="button" onClick={() => toggleDocSort('name')} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>Document Name {sortArrow(docSort, 'name')}</button>
                                    </th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                        <button type="button" onClick={() => toggleDocSort('type')} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>Type {sortArrow(docSort, 'type')}</button>
                                    </th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                        <button type="button" onClick={() => toggleDocSort('uploadedOn')} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>Uploaded On {sortArrow(docSort, 'uploadedOn')}</button>
                                    </th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                        <button type="button" onClick={() => toggleDocSort('details')} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>Size {sortArrow(docSort, 'details')}</button>
                                    </th>
                                    <th style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDocuments.length === 0 && !isLoading ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '16px 12px', textAlign: 'center', color: 'var(--text-secondary)' }}>No documents found.</td>
                                    </tr>
                                ) : null}
                                {filteredDocuments.map((doc, idx) => (
                                    <tr key={doc.id} style={{ borderBottom: idx < filteredDocuments.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                        <td style={{ padding: '16px 12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '1.2rem' }}>📄</span>
                                                <span style={{ fontWeight: '500' }}>{doc.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{doc.type}</td>
                                        <td style={{ padding: '16px 12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{doc.uploadedOnLabel || doc.uploadedOn}</td>
                                        <td style={{ padding: '16px 12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{doc.size}</td>
                                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                                                <button title="Download" aria-label="Download" onClick={() => handleDownloadFile(doc)} style={{ width: '30px', height: '30px', background: 'var(--accent-gold)', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Download size={14} />
                                                </button>
                                                <button type="button" onClick={() => openEditAssetForm(doc)} style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                                    Edit
                                                </button>
                                                <button type="button" onClick={() => handleDeleteAsset(doc)} style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', cursor: 'pointer' }}>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Brand Assets Section */}
            <div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Your Brand Assets (for our team)</h3>
                <Card>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                        <button type="button" onClick={() => toggleAssetSort('name')} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>Asset Name {sortArrow(assetSort, 'name')}</button>
                                    </th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                        <button type="button" onClick={() => toggleAssetSort('type')} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>Type {sortArrow(assetSort, 'type')}</button>
                                    </th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                        <button type="button" onClick={() => toggleAssetSort('details')} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>Details {sortArrow(assetSort, 'details')}</button>
                                    </th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                        <button type="button" onClick={() => toggleAssetSort('uploadedOn')} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>Uploaded On {sortArrow(assetSort, 'uploadedOn')}</button>
                                    </th>
                                    <th style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAssets.length === 0 && !isLoading ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '16px 12px', textAlign: 'center', color: 'var(--text-secondary)' }}>No assets found.</td>
                                    </tr>
                                ) : null}
                                {filteredAssets.map((asset, idx) => (
                                    <tr key={asset.id} style={{ borderBottom: idx < filteredAssets.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                        <td style={{ padding: '16px 12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '1.2rem' }}>📦</span>
                                                <span style={{ fontWeight: '500' }}>{asset.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{asset.type}</td>
                                        <td style={{ padding: '16px 12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            {asset.details || asset.dimensions || asset.size}
                                        </td>
                                        <td style={{ padding: '16px 12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{asset.uploadedOnLabel || asset.uploadedOn}</td>
                                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                                                <button title="Download" aria-label="Download" onClick={() => handleDownloadFile(asset)} style={{ width: '30px', height: '30px', background: 'var(--accent-gold)', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Download size={14} />
                                                </button>
                                                <button type="button" onClick={() => openEditAssetForm(asset)} style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                                    Edit
                                                </button>
                                                <button type="button" onClick={() => handleDeleteAsset(asset)} style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', cursor: 'pointer' }}>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <Modal
                open={Boolean(deleteTarget)}
                title="Delete Asset"
                onClose={() => setDeleteTarget(null)}
                footer={[
                    <Button key="cancel" variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>,
                    <Button key="delete" onClick={confirmDeleteAsset}>Delete</Button>,
                ]}
            >
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    Delete "{deleteTarget?.name}"? This action cannot be undone.
                </p>
            </Modal>
        </div>
    );
};

export default AssetRepository;
