import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const createFallbackError = () => new Error('Supabase is not configured.');

const createFallbackQueryBuilder = () => {
    const builder = {
        select: () => builder,
        insert: () => builder,
        upsert: () => builder,
        update: () => builder,
        delete: () => builder,
        eq: () => builder,
        gte: () => builder,
        lte: () => builder,
        order: () => builder,
        single: () => builder,
        maybeSingle: () => builder,
        on: () => builder,
        filter: () => builder,
        subscribe: () => ({ unsubscribe: () => {} }),
        then: (resolve) => resolve({ data: [], error: createFallbackError() }),
        catch: () => builder,
        finally: () => builder,
    };

    return builder;
};

const createFallbackSupabaseClient = () => ({
    __isFallback: true,
    auth: {
        signUp: async () => ({ data: null, error: createFallbackError() }),
        signInWithPassword: async () => ({ data: null, error: createFallbackError() }),
        signOut: async () => ({ error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
    },
    from: () => createFallbackQueryBuilder(),
    storage: {
        from: () => ({
            upload: async () => ({ data: null, error: createFallbackError() }),
            list: async () => ({ data: [], error: createFallbackError() }),
            download: async () => ({ data: null, error: createFallbackError() }),
            remove: async () => ({ data: null, error: createFallbackError() }),
            getPublicUrl: () => ({ data: { publicUrl: '' }, error: createFallbackError() }),
        }),
    },
    removeSubscription: () => ({ error: null }),
});

if (!isSupabaseConfigured) {
    // Keep app routes functional even when env vars are not present in a given runtime.
    console.warn('Supabase environment variables are missing. Falling back to local/mock data where available.');
}

export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createFallbackSupabaseClient();

if (isSupabaseConfigured) {
    supabase.__isFallback = false;
}

export const supabaseStatus = {
    configured: isSupabaseConfigured,
    fallback: !isSupabaseConfigured,
};

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const formatDateTimeLabel = (value) => {
    const date = value ? new Date(value) : new Date();
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
};

const safeNumber = (value) => Number(value || 0);

const getActivityType = (entry) => {
    const action = String(entry?.action || '').toLowerCase();
    if (action.includes('approve')) return 'approval';
    if (action.includes('upload') || action.includes('asset') || action.includes('document')) return 'upload';
    return 'sync';
};

const extractReachValue = (value) => {
    const matches = String(value || '').match(/\d[\d,]*/g);
    if (!matches) return 0;
    return matches.reduce((sum, item) => sum + Number(item.replace(/,/g, '')), 0);
};

const extractNumericMetric = (payload, key) => {
    if (!payload || typeof payload !== 'object') {
        return 0;
    }

    const raw = payload[key];
    if (raw === null || raw === undefined) {
        return 0;
    }

    if (typeof raw === 'number' && Number.isFinite(raw)) {
        return raw;
    }

    const parsed = Number(String(raw).replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
};

const parseReachMetrics = (value) => {
    if (!value) {
        return { reach: 0, impressions: 0, engagement: 0, signups: 0 };
    }

    let payload = null;

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            try {
                payload = JSON.parse(trimmed);
            } catch {
                payload = null;
            }
        }
    } else if (typeof value === 'object') {
        payload = value;
    }

    if (!payload) {
        return {
            reach: extractReachValue(value),
            impressions: 0,
            engagement: 0,
            signups: 0,
        };
    }

    return {
        reach: extractNumericMetric(payload, 'reach'),
        impressions: extractNumericMetric(payload, 'impressions'),
        engagement: extractNumericMetric(payload, 'engagement'),
        signups: extractNumericMetric(payload, 'signups'),
    };
};

const parseMissingColumnFromSchemaCacheError = (error, tableName) => {
    const message = String(error?.message || '');
    const pattern = new RegExp(`Could not find the '([^']+)' column of '${tableName}' in the schema cache`, 'i');
    const match = message.match(pattern);
    return match?.[1] || null;
};

const parseNullConstraintColumn = (error) => {
    const message = String(error?.message || '');
    const match = message.match(/null value in column "([^"]+)"/i);
    return match?.[1] || null;
};

const normalizeStatus = (value) => (String(value || '').toLowerCase() === 'disabled' ? 'disabled' : 'active');

const isUuidLike = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));

const normalizeUuidOrUndefined = (value) => (isUuidLike(value) ? String(value) : undefined);

const generateUuid = () => {
    if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
    }

    // Fallback UUID v4 generator for runtimes without crypto.randomUUID.
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        const rand = Math.floor(Math.random() * 16);
        const value = char === 'x' ? rand : ((rand & 0x3) | 0x8);
        return value.toString(16);
    });
};

const logAccountActivity = async (action, tableName, recordId, changes = {}) => {
    try {
        await activityHelpers.log(null, action, tableName, recordId, changes);
    } catch {
        // Audit logging should never block account management.
    }
};

const mapTeamMemberRow = (row) => ({
    id: row.id,
    email: normalizeEmail(row.email),
    password: row.password_hash || '',
    name: row.name || '',
    role: row.role || 'Editor',
    department: row.department || '',
    title: row.title || '',
    status: normalizeStatus(row.status),
    userKind: row.user_kind || 'admin',
    kind: 'admin',
});

const mapSponsorRow = (row) => ({
    id: row.id,
    email: normalizeEmail(row.contact_email),
    password: row.password_hash || '',
    company: row.company_name || '',
    tier: row.tier || 'Gold',
    committed: Number(row.committed_amount || 0),
    contactName: row.contact_name || '',
    status: normalizeStatus(row.status),
    userKind: row.user_kind || 'sponsor',
    kind: 'sponsor',
});

const buildTeamMemberRecord = (payload = {}) => {
    const record = {
        id: normalizeUuidOrUndefined(payload.id),
        email: normalizeEmail(payload.email),
        name: payload.name || '',
        role: payload.role || 'Editor',
        department: payload.department || '',
        title: payload.title || '',
        status: normalizeStatus(payload.status),
        user_kind: 'admin',
        updated_at: new Date().toISOString(),
    };

    if (payload.password) {
        record.password_hash = payload.password;
    }

    return record;
};

const buildSponsorRecord = (payload = {}) => {
    const record = {
        id: normalizeUuidOrUndefined(payload.id),
        company_name: payload.company || '',
        contact_email: normalizeEmail(payload.email),
        tier: payload.tier || 'Gold',
        committed_amount: Number(payload.committed || 0),
        contact_name: payload.contactName || '',
        status: normalizeStatus(payload.status),
        user_kind: 'sponsor',
        updated_at: new Date().toISOString(),
    };

    return record;
};

const selectTeamMemberFields = 'id,email,password_hash,name,role,department,title,status,user_kind,created_at,updated_at';
const selectSponsorFields = 'id,company_name,contact_email,contact_name,tier,committed_amount,status,user_kind,created_at,updated_at';
const currentYear = new Date().getFullYear();

const mapPortalSettingsRow = (row = {}) => ({
    id: row.id || 'global',
    orgName: row.org_name || 'Jinnah League',
    eventYear: Number(row.event_year || currentYear),
    totalBudget: safeNumber(row.total_budget),
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
});

const buildPortalSettingsRecord = (payload = {}) => ({
    id: 'global',
    org_name: String(payload.orgName || 'Jinnah League').trim() || 'Jinnah League',
    event_year: Number(payload.eventYear || currentYear),
    total_budget: safeNumber(payload.totalBudget),
    updated_at: new Date().toISOString(),
});

// Auth helpers
export const authHelpers = {
    signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        return { data, error };
    },

    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    getCurrentUser: async () => {
        const { data } = await supabase.auth.getSession();
        return data?.session?.user;
    },
};

const updateBudgetRequestWithSchemaFallback = async (id, updates, optionalColumns = []) => {
    let nextUpdates = { ...updates };
    let lastResult = null;

    for (let attempt = 0; attempt <= optionalColumns.length; attempt += 1) {
        const result = await budgetHelpers.updateRequest(id, nextUpdates);
        lastResult = result;

        if (!result?.error) {
            return result;
        }

        const missingColumn = parseMissingColumnFromSchemaCacheError(result.error, 'budget_requests');
        if (!missingColumn) {
            return result;
        }

        const isOptional = optionalColumns.includes(missingColumn);
        const hasColumnInPayload = Object.prototype.hasOwnProperty.call(nextUpdates, missingColumn);
        if (!isOptional || !hasColumnInPayload) {
            return result;
        }

        const { [missingColumn]: _ignored, ...remaining } = nextUpdates;
        nextUpdates = remaining;
    }

    return lastResult;
};

const resolveUserUuidForBudgetDecision = async (actor) => {
    const raw = String(actor || '').trim();
    if (!raw) {
        return null;
    }

    if (isUuidLike(raw)) {
        return raw;
    }

    if (!raw.includes('@')) {
        return null;
    }

    const normalized = normalizeEmail(raw);
    const { data, error } = await supabase
        .from('users')
        .select('id')
        .ilike('email', normalized)
        .maybeSingle();

    if (error || !isUuidLike(data?.id)) {
        return null;
    }

    return data.id;
};

// Budget Request helpers
export const budgetHelpers = {
    getRequests: async (filters = {}) => {
        let query = supabase.from('budget_requests').select('*');
        
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.priority) query = query.eq('priority', filters.priority);
        
        const { data, error } = await query.order('created_at', { ascending: false });
        return { data, error };
    },

    createRequest: async (formData) => {
        const { data, error } = await supabase
            .from('budget_requests')
            .insert([formData])
            .select();
        return { data, error };
    },

    updateRequest: async (id, updates) => {
        const { data, error } = await supabase
            .from('budget_requests')
            .update(updates)
            .eq('id', id)
            .select();
        return { data, error };
    },

    approveRequest: async (id, approvedById) => {
        const decisionTime = new Date().toISOString();
        const actorUuid = await resolveUserUuidForBudgetDecision(approvedById);
        const updates = {
            status: 'Approved',
            approved_at: decisionTime,
            decision_at: decisionTime,
            updated_at: decisionTime,
        };

        if (actorUuid) {
            updates.approved_by = actorUuid;
        }

        return updateBudgetRequestWithSchemaFallback(id, updates, ['approved_by', 'approved_at', 'decision_at', 'updated_at']);
    },

    rejectRequest: async (id, rejectedById, reason = '') => {
        const decisionTime = new Date().toISOString();
        const actorUuid = await resolveUserUuidForBudgetDecision(rejectedById);
        const updates = {
            status: 'Rejected',
            rejection_reason: reason,
            rejected_at: decisionTime,
            decision_at: decisionTime,
            updated_at: decisionTime,
        };

        if (actorUuid) {
            updates.rejected_by = actorUuid;
        }

        return updateBudgetRequestWithSchemaFallback(id, updates, ['rejected_by', 'rejection_reason', 'rejected_at', 'decision_at', 'updated_at']);
    },

    deleteRequest: async (id) => {
        const { error } = await supabase
            .from('budget_requests')
            .delete()
            .eq('id', id);
        return { error };
    },
};

export const portalSettingsHelpers = {
    getSettings: async () => {
        const { data, error } = await supabase
            .from('portal_settings')
            .select('*')
            .eq('id', 'global')
            .maybeSingle();

        if (error) {
            return { data: null, error };
        }

        if (data) {
            return { data: mapPortalSettingsRow(data), error: null };
        }

        const bootstrapRecord = buildPortalSettingsRecord({ totalBudget: 0 });
        const bootstrapResult = await supabase
            .from('portal_settings')
            .upsert([bootstrapRecord], { onConflict: 'id' })
            .select('*')
            .maybeSingle();

        if (bootstrapResult.error) {
            return { data: null, error: bootstrapResult.error };
        }

        return {
            data: mapPortalSettingsRow(bootstrapResult.data || bootstrapRecord),
            error: null,
        };
    },

    saveSettings: async (payload = {}) => {
        const record = buildPortalSettingsRecord(payload);
        const { data, error } = await supabase
            .from('portal_settings')
            .upsert([record], { onConflict: 'id' })
            .select('*')
            .maybeSingle();

        if (error) {
            return { data: null, error };
        }

        return { data: mapPortalSettingsRow(data || record), error: null };
    },

    getTotalBudget: async () => {
        const { data, error } = await portalSettingsHelpers.getSettings();
        if (error) {
            return { data: 0, error };
        }

        return { data: safeNumber(data?.totalBudget), error: null };
    },
};

// Task helpers
export const taskHelpers = {
    getTasks: async (filters = {}) => {
        let query = supabase.from('tasks').select('*');
        
        if (filters.status) query = query.eq('status', filters.status);
        
        let result = await query
            .order('sort_order', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false });

        if (result.error) {
            let fallbackQuery = supabase.from('tasks').select('*');
            if (filters.status) fallbackQuery = fallbackQuery.eq('status', filters.status);
            result = await fallbackQuery.order('created_at', { ascending: false });
        }

        return { data: result.data, error: result.error };
    },

    createTask: async (taskData) => {
        const { data, error } = await supabase
            .from('tasks')
            .insert([taskData])
            .select();
        return { data, error };
    },

    updateTaskStatus: async (id, status) => {
        const { data, error } = await supabase
            .from('tasks')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();
        return { data, error };
    },

    updateTaskOrder: async (id, sortOrder) => {
        const { data, error } = await supabase
            .from('tasks')
            .update({ sort_order: sortOrder, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();
        return { data, error };
    },

    updateTask: async (id, updates) => {
        const { data, error } = await supabase
            .from('tasks')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();
        return { data, error };
    },

    deleteTask: async (id) => {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);
        return { error };
    },
};

// Expenditure helpers
export const expenditureHelpers = {
    getExpenditures: async (filters = {}) => {
        let query = supabase.from('expenditures').select('*');
        
        if (filters.category) query = query.eq('category', filters.category);
        if (filters.startDate) query = query.gte('date', filters.startDate);
        if (filters.endDate) query = query.lte('date', filters.endDate);
        
        const { data, error } = await query.order('date', { ascending: false });
        return { data, error };
    },

    logExpense: async (expenseData) => {
        const { data, error } = await supabase
            .from('expenditures')
            .insert([expenseData])
            .select();
        return { data, error };
    },

    updateExpense: async (id, updates) => {
        const withTimestamp = await supabase
            .from('expenditures')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();

        if (!withTimestamp.error) {
            return { data: withTimestamp.data, error: null };
        }

        // Some deployments do not have updated_at on expenditures.
        if ((withTimestamp.error?.message || '').includes('updated_at')) {
            const fallback = await supabase
                .from('expenditures')
                .update(updates)
                .eq('id', id)
                .select();
            return { data: fallback.data, error: fallback.error };
        }

        return { data: withTimestamp.data, error: withTimestamp.error };
    },

    getTotalSpent: async (startDate, endDate) => {
        const { data, error } = await supabase
            .from('expenditures')
            .select('amount')
            .gte('date', startDate)
            .lte('date', endDate);
        
        const total = data?.reduce((sum, item) => sum + item.amount, 0) || 0;
        return { total, error };
    },

    deleteExpense: async (id) => {
        const { error } = await supabase
            .from('expenditures')
            .delete()
            .eq('id', id);
        return { error };
    },
};

// Inventory helpers
export const inventoryHelpers = {
    getItems: async (filters = {}) => {
        let query = supabase.from('inventory').select('*');
        
        if (filters.category) query = query.eq('category', filters.category);
        if (filters.status) query = query.eq('status', filters.status);
        
        const { data, error } = await query.order('created_at', { ascending: false });
        return { data, error };
    },

    addItem: async (itemData) => {
        const { data, error } = await supabase
            .from('inventory')
            .insert([itemData])
            .select();
        return { data, error };
    },

    updateItem: async (id, updates) => {
        const { data, error } = await supabase
            .from('inventory')
            .update(updates)
            .eq('id', id)
            .select();
        return { data, error };
    },

    updateStatus: async (id, status) => {
        return inventoryHelpers.updateItem(id, { status, updated_at: new Date().toISOString() });
    },

    deleteItem: async (id) => {
        const { error } = await supabase
            .from('inventory')
            .delete()
            .eq('id', id);
        return { error };
    },
};

// Sponsor helpers
export const sponsorHelpers = {
    getSponsors: async (filters = {}) => {
        let baseQuery = supabase.from('sponsors').select('*');

        if (filters.tier) baseQuery = baseQuery.eq('tier', filters.tier);
        if (filters.paymentStatus) baseQuery = baseQuery.eq('payment_status', filters.paymentStatus);

        let result = await baseQuery.order('created_at', { ascending: false });

        if (result.error) {
            let fallbackUpdatedAt = supabase.from('sponsors').select('*');
            if (filters.tier) fallbackUpdatedAt = fallbackUpdatedAt.eq('tier', filters.tier);
            if (filters.paymentStatus) fallbackUpdatedAt = fallbackUpdatedAt.eq('payment_status', filters.paymentStatus);
            result = await fallbackUpdatedAt.order('updated_at', { ascending: false });
        }

        if (result.error) {
            let noSortFallback = supabase.from('sponsors').select('*');
            if (filters.tier) noSortFallback = noSortFallback.eq('tier', filters.tier);
            if (filters.paymentStatus) noSortFallback = noSortFallback.eq('payment_status', filters.paymentStatus);
            result = await noSortFallback;
        }

        return { data: result.data || [], error: result.error };
    },

    getSponsor: async (id) => {
        const { data, error } = await supabase
            .from('sponsors')
            .select('*')
            .eq('id', id)
            .single();
        return { data, error };
    },

    createSponsor: async (sponsorData) => {
        const { data, error } = await supabase
            .from('sponsors')
            .insert([sponsorData])
            .select();
        return { data, error };
    },

    updateSponsor: async (id, updates) => {
        const { data, error } = await supabase
            .from('sponsors')
            .update(updates)
            .eq('id', id)
            .select();
        return { data, error };
    },

    getSponsorByEmail: async (email) => {
        const normalizedEmail = normalizeEmail(email);

        let result = await supabase
            .from('sponsors')
            .select('*')
            .eq('contact_email', normalizedEmail)
            .maybeSingle();

        if (result.error) {
            result = await supabase
                .from('sponsors')
                .select('*')
                .eq('email', normalizedEmail)
                .maybeSingle();
        }

        return { data: result.data, error: result.error };
    },
};

export const accountDirectoryHelpers = {
    getTeamMembers: async () => {
        const { data, error } = await supabase
            .from('users')
            .select(selectTeamMemberFields)
            .order('updated_at', { ascending: false });
        return { data: (data || []).map(mapTeamMemberRow), error };
    },

    getSponsors: async () => {
        const { data, error } = await supabase
            .from('sponsors')
            .select(selectSponsorFields)
            .order('updated_at', { ascending: false });
        return { data: (data || []).map(mapSponsorRow), error };
    },

    getAllAccounts: async () => {
        const [teamResult, sponsorResult] = await Promise.all([
            accountDirectoryHelpers.getTeamMembers(),
            accountDirectoryHelpers.getSponsors(),
        ]);

        const errors = [teamResult.error, sponsorResult.error].filter(Boolean);

        return {
            data: [...(teamResult.data || []), ...(sponsorResult.data || [])],
            error: errors[0] || null,
            errors,
        };
    },

    getSummary: async () => {
        const { data, error, errors } = await accountDirectoryHelpers.getAllAccounts();
        const accounts = data || [];
        const admins = accounts.filter((account) => account.kind === 'admin').length;
        const sponsors = accounts.filter((account) => account.kind === 'sponsor').length;
        const active = accounts.filter((account) => account.status === 'active').length;
        const disabled = accounts.filter((account) => account.status !== 'active').length;
        const total = accounts.length;

        return {
            data: {
                total,
                admins,
                sponsors,
                active,
                disabled,
                adminShare: total ? Math.round((admins / total) * 100) : 0,
                sponsorShare: total ? Math.round((sponsors / total) * 100) : 0,
                activeRate: total ? Math.round((active / total) * 100) : 0,
            },
            error,
            errors,
        };
    },

    saveTeamMember: async (payload, options = {}) => {
        const mode = options.mode === 'edit' ? 'edit' : 'create';
        const record = buildTeamMemberRecord(payload);
        let data = null;
        let error = null;

        if (mode === 'edit') {
            const updateResult = record.id
                ? await supabase
                    .from('users')
                    .update(record)
                    .eq('id', record.id)
                    .select(selectTeamMemberFields)
                : await supabase
                    .from('users')
                    .update(record)
                    .eq('email', record.email)
                    .select(selectTeamMemberFields);

            data = updateResult.data;
            error = updateResult.error;

            if (!error && (data || []).length === 0) {
                error = new Error('Unable to update team member: account not found.');
            }
        } else {
            const insertRecord = { ...record, id: record.id || generateUuid() };

            const insertResult = await supabase
                .from('users')
                .insert([insertRecord])
                .select(selectTeamMemberFields);

            data = insertResult.data;
            error = insertResult.error;
        }

        const saved = data?.[0] ? mapTeamMemberRow(data[0]) : null;
        if (!error && saved) {
            await logAccountActivity(mode === 'edit' ? 'update' : 'create', 'users', saved.id || saved.email, {
                email: saved.email,
                name: saved.name,
                role: saved.role,
                department: saved.department,
                title: saved.title,
                status: saved.status,
            });
        }

        return { data: saved ? [saved] : data, error };
    },

    saveSponsor: async (payload, options = {}) => {
        const mode = options.mode === 'edit' ? 'edit' : 'create';
        const record = buildSponsorRecord(payload);
        const originalId = normalizeUuidOrUndefined(options.originalId || payload.id);
        const originalEmail = normalizeEmail(options.originalEmail || payload.email);
        const nextEmail = normalizeEmail(payload.email);

        let result = null;

        const buildEditMatchers = () => {
            const seen = new Set();
            const matchers = [];

            const pushMatcher = (field, value) => {
                const key = `${field}:${value}`;
                if (!value || seen.has(key)) {
                    return;
                }

                seen.add(key);
                matchers.push({ field, value });
            };

            pushMatcher('id', originalId);
            pushMatcher('contact_email', originalEmail);
            pushMatcher('email', originalEmail);
            pushMatcher('contact_email', nextEmail);
            pushMatcher('email', nextEmail);

            return matchers;
        };

        const runSponsorUpdate = async (candidateRecord) => {
            const matchers = buildEditMatchers();
            let lastError = null;

            for (const matcher of matchers) {
                const updateResult = await supabase
                    .from('sponsors')
                    .update(candidateRecord)
                    .eq(matcher.field, matcher.value)
                    .select(selectSponsorFields);

                const missingMatchColumn = parseMissingColumnFromSchemaCacheError(updateResult.error, 'sponsors');
                if (missingMatchColumn === matcher.field) {
                    continue;
                }

                if (updateResult.error) {
                    lastError = updateResult.error;
                    continue;
                }

                if ((updateResult.data || []).length > 0) {
                    return updateResult;
                }
            }

            if (lastError) {
                return { data: [], error: lastError };
            }

            return { data: [], error: new Error('Unable to update sponsor: account not found.') };
        };

        let candidateRecord = {
            ...record,
            id: record.id || generateUuid(),
        };

        for (let attempt = 0; attempt < 10; attempt += 1) {
            if (mode === 'edit') {
                result = await runSponsorUpdate(candidateRecord);
            } else {
                result = await supabase
                    .from('sponsors')
                    .insert([candidateRecord])
                    .select(selectSponsorFields);
            }

            if (!result.error) {
                break;
            }

            const missingColumn = parseMissingColumnFromSchemaCacheError(result.error, 'sponsors');
            if (missingColumn && missingColumn in candidateRecord) {
                delete candidateRecord[missingColumn];
                continue;
            }

            break;
        }

        const { data, error } = result;

        const saved = data?.[0] ? mapSponsorRow(data[0]) : null;
        if (!error && saved) {
            await logAccountActivity(mode === 'edit' ? 'update' : 'create', 'sponsors', saved.id || saved.email, {
                email: saved.email,
                company: saved.company,
                tier: saved.tier,
                committed: saved.committed,
                contactName: saved.contactName,
                status: saved.status,
            });
        }

        return { data: saved ? [saved] : data, error };
    },

    setTeamMemberStatus: async (identifier, status) => {
        const normalizedEmail = normalizeEmail(identifier);
        const { data, error } = await supabase
            .from('users')
            .update({ status: normalizeStatus(status), updated_at: new Date().toISOString() })
            .eq('email', normalizedEmail)
            .select(selectTeamMemberFields);

        const saved = data?.[0] ? mapTeamMemberRow(data[0]) : null;
        if (!error && saved) {
            await logAccountActivity('status_change', 'users', saved.id || saved.email, { status: saved.status });
        }

        return { data: saved ? [saved] : data, error };
    },

    setSponsorStatus: async (identifier, status) => {
        const normalizedEmail = normalizeEmail(identifier);
        const { data, error } = await supabase
            .from('sponsors')
            .update({ status: normalizeStatus(status), updated_at: new Date().toISOString() })
            .eq('contact_email', normalizedEmail)
            .select(selectSponsorFields);

        const saved = data?.[0] ? mapSponsorRow(data[0]) : null;
        if (!error && saved) {
            await logAccountActivity('status_change', 'sponsors', saved.id || saved.email, { status: saved.status });
        }

        return { data: saved ? [saved] : data, error };
    },

    resetTeamMemberPassword: async (identifier, password) => {
        const normalizedEmail = normalizeEmail(identifier);
        const { data, error } = await supabase
            .from('users')
            .update({ password_hash: password, updated_at: new Date().toISOString() })
            .eq('email', normalizedEmail)
            .select(selectTeamMemberFields);

        const saved = data?.[0] ? mapTeamMemberRow(data[0]) : null;
        if (!error && saved) {
            await logAccountActivity('password_reset', 'users', saved.id || saved.email, {});
        }

        return { data: saved ? [saved] : data, error };
    },

    resetSponsorPassword: async (identifier, password) => {
        const normalizedEmail = normalizeEmail(identifier);
        let result = await supabase
            .from('sponsors')
            .update({ password_hash: password, updated_at: new Date().toISOString() })
            .eq('contact_email', normalizedEmail)
            .select(selectSponsorFields);

        if (parseMissingColumnFromSchemaCacheError(result.error, 'sponsors') === 'password_hash') {
            return { data: [], error: new Error('Password updates are unavailable because sponsors.password_hash is missing in the database schema.') };
        }

        const { data, error } = result;

        const saved = data?.[0] ? mapSponsorRow(data[0]) : null;
        if (!error && saved) {
            await logAccountActivity('password_reset', 'sponsors', saved.id || saved.email, {});
        }

        return { data: saved ? [saved] : data, error };
    },

    deleteTeamMember: async (identifier) => {
        const normalizedEmail = normalizeEmail(identifier);
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('email', normalizedEmail);

        if (!error) {
            await logAccountActivity('delete', 'users', normalizedEmail, {});
        }

        return { error };
    },

    deleteSponsor: async (identifier, sponsorId = null) => {
        const normalizedEmail = normalizeEmail(identifier);
        const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const resolvedSponsorId = sponsorId || (uuidLike.test(String(identifier || '')) ? identifier : null);

        const sponsorDeleteAttempts = [
            () => supabase.from('sponsors').delete().eq('contact_email', normalizedEmail).select('id'),
            () => supabase.from('sponsors').delete().eq('email', normalizedEmail).select('id'),
        ];

        if (resolvedSponsorId) {
            sponsorDeleteAttempts.push(() => supabase.from('sponsors').delete().eq('id', resolvedSponsorId).select('id'));
        }

        let lastError = null;
        let deletedSponsorRows = 0;

        for (const runAttempt of sponsorDeleteAttempts) {
            const { data, error } = await runAttempt();

            if (error) {
                const missingColumn = parseMissingColumnFromSchemaCacheError(error, 'sponsors');
                if (missingColumn) {
                    continue;
                }

                lastError = error;
                continue;
            }

            const affected = Array.isArray(data) ? data.length : 0;
            deletedSponsorRows += affected;
            if (affected > 0) {
                break;
            }
        }

        // Some legacy setups keep sponsor-like rows in users only; clean them as fallback.
        let deletedUserRows = 0;
        const userDeleteAttempts = [
            () => supabase.from('users').delete().eq('email', normalizedEmail).eq('user_kind', 'sponsor').select('id'),
            () => supabase.from('users').delete().eq('email', normalizedEmail).select('id'),
        ];

        for (const runAttempt of userDeleteAttempts) {
            const { data, error } = await runAttempt();

            if (error) {
                const missingColumn = parseMissingColumnFromSchemaCacheError(error, 'users');
                if (missingColumn) {
                    continue;
                }

                lastError = lastError || error;
                continue;
            }

            const affected = Array.isArray(data) ? data.length : 0;
            deletedUserRows += affected;
            if (affected > 0) {
                break;
            }
        }

        const deletedTotal = deletedSponsorRows + deletedUserRows;
        if (deletedTotal > 0) {
            await logAccountActivity('delete', 'sponsors', normalizedEmail, { deletedSponsorRows, deletedUserRows });
            return { error: null };
        }

        return { error: lastError || new Error(`No sponsor record found for ${normalizedEmail}.`) };
    },
};

export const portalDashboardHelpers = {
    getAdminDashboardData: async () => {
        const [requestsResult, inventoryResult, sponsorsResult, activityResult, assetsResult] = await Promise.all([
            budgetHelpers.getRequests(),
            inventoryHelpers.getItems(),
            sponsorHelpers.getSponsors(),
            activityHelpers.getLogs(),
            supabase.from('sponsor_assets').select('*').order('uploaded_at', { ascending: false }),
        ]);

        const requestRows = requestsResult.data || [];
        const isOpenRequest = (request) => {
            const status = String(request.status || '').trim().toLowerCase();
            return !['completed', 'approved', 'rejected', 'closed'].includes(status);
        };
        const isPriorityRequest = (request) => {
            const priority = String(request.priority || '').trim().toLowerCase();
            return ['high', 'urgent'].includes(priority);
        };

        const openRequestRows = requestRows.filter(isOpenRequest);
        const priorityOpenRows = openRequestRows.filter(isPriorityRequest);
        const openRequests = openRequestRows.length;
        const budgetPending = openRequestRows.reduce((sum, request) => sum + safeNumber(request.amount), 0);
        const priorityPendingAmount = priorityOpenRows.reduce((sum, request) => sum + safeNumber(request.amount), 0);
        const priorityShare = openRequests ? Math.round((priorityOpenRows.length / openRequests) * 100) : 0;

        const activityRows = activityResult.data || [];
        const recentActivity = activityRows.slice(0, 4).map((entry) => ({
            timestamp: formatDateTimeLabel(entry.timestamp || entry.created_at),
            description: entry.action || `${entry.table_name || 'System'} updated`,
            type: getActivityType(entry),
        }));

        return {
            kpis: {
                openRequests,
                budgetPending,
                priorityOpenRequests: priorityOpenRows.length,
                priorityPendingAmount,
                priorityShare,
                assetsAwaitingReview: (assetsResult.data || []).length,
                inventoryItems: (inventoryResult.data || []).length,
            },
            recentActivity,
            totals: {
                requests: requestRows.length,
                sponsors: (sponsorsResult.data || []).length,
                tasks: 0,
            },
        };
    },

    getSponsorDashboardData: async (sponsorEmail) => {
        const { data: sponsor, error: sponsorError } = await sponsorHelpers.getSponsorByEmail(sponsorEmail);
        if (sponsorError || !sponsor) {
            return { sponsor: null, data: null, error: sponsorError || new Error('Sponsor not found.') };
        }

        const [deliverablesResult, ledgerResult, proofResult, assetsResult] = await Promise.all([
            supabase.from('deliverables').select('*').eq('sponsor_id', sponsor.id).order('due_date', { ascending: true }),
            supabase.from('financial_ledger').select('*').eq('sponsor_id', sponsor.id).order('date', { ascending: true }),
            supabase.from('proof_of_execution').select('*').eq('sponsor_id', sponsor.id).order('proof_date', { ascending: false }),
            supabase.from('sponsor_assets').select('*').eq('sponsor_id', sponsor.id).order('uploaded_at', { ascending: false }),
        ]);

        const deliverables = deliverablesResult.data || [];
        const ledgerRows = ledgerResult.data || [];
        const proofRows = proofResult.data || [];
        const assetRows = assetsResult.data || [];

        const committed = safeNumber(sponsor.committed_amount || sponsor.committed);
        const receivedFromSponsor = safeNumber(sponsor.received_amount);
        const allocated = ledgerRows
            .filter((entry) => entry.entry_type === 'allocation' || entry.type === 'allocation')
            .reduce((sum, entry) => sum + safeNumber(entry.amount), 0);
        const received = receivedFromSponsor || ledgerRows
            .filter((entry) => entry.entry_type === 'commitment' || entry.entry_type === 'payment' || entry.type === 'commitment' || entry.type === 'payment')
            .reduce((sum, entry) => sum + safeNumber(entry.amount), 0);
        const remaining = Math.max((received || committed) - allocated, 0);
        const proofTotals = proofRows.reduce((acc, item) => {
            const metric = parseReachMetrics(item.reach_metrics);
            return {
                reach: acc.reach + safeNumber(metric.reach),
                impressions: acc.impressions + safeNumber(metric.impressions),
                engagement: acc.engagement + safeNumber(metric.engagement),
                signups: acc.signups + safeNumber(metric.signups),
            };
        }, { reach: 0, impressions: 0, engagement: 0, signups: 0 });

        const recentActivity = [
            ...proofRows.map((item) => ({
                date: formatDateTimeLabel(item.proof_date),
                activity: item.title || 'Proof of execution uploaded',
            })),
            ...assetRows.map((item) => ({
                date: formatDateTimeLabel(item.uploaded_at),
                activity: item.file_name || 'Sponsor asset uploaded',
            })),
            ...deliverables.map((item) => ({
                date: formatDateTimeLabel(item.completed_on || item.created_at || item.due_date),
                activity: `${item.title} is ${item.status?.toLowerCase() || 'updated'}`,
            })),
        ]
            .filter((entry) => entry.activity)
            .slice(0, 4);

        return {
            sponsor: {
                email: sponsor.contact_email,
                company: sponsor.company_name,
                tier: sponsor.tier,
                committed,
            },
            data: {
                roiMetrics: {
                    reach: proofTotals.reach,
                    impressions: proofTotals.impressions,
                    engagement: proofTotals.engagement,
                    signups: proofTotals.signups,
                },
                partnership: {
                    tier: sponsor.tier,
                    committed,
                    received,
                    spent: allocated,
                    remaining,
                    paymentStatus: sponsor.payment_status || 'Pending',
                    partnerSince: sponsor.partner_since ? formatDateTimeLabel(sponsor.partner_since) : '-',
                },
                quickStats: {
                    budgetUtilization: committed ? Math.min(Math.round((allocated / committed) * 100), 100) : 0,
                    deliverablesCompleted: deliverables.filter((item) => item.status === 'Completed').length,
                    deliverablesTotal: deliverables.length,
                    pendingRequests: deliverables.filter((item) => item.status === 'Pending').length,
                    documents: assetRows.filter((item) => String(item.asset_category || '').toLowerCase() === 'document').length || assetRows.length,
                },
                recentActivity,
            },
            error: null,
        };
    },
};

export const sponsorPortalHelpers = {
    getSponsorByEmail: async (sponsorEmail) => {
        const { data, error } = await sponsorHelpers.getSponsorByEmail(sponsorEmail);
        return { data, error };
    },

    getDeliverablesByEmail: async (sponsorEmail) => {
        const { data: sponsor, error: sponsorError } = await sponsorHelpers.getSponsorByEmail(sponsorEmail);
        if (sponsorError || !sponsor) {
            return { data: [], error: sponsorError || new Error('Sponsor not found.') };
        }

        const { data, error } = await supabase
            .from('deliverables')
            .select('*')
            .eq('sponsor_id', sponsor.id)
            .order('due_date', { ascending: true });

        const mapped = (data || []).map((row) => ({
            id: row.id,
            title: row.title,
            tier: row.tier || 'All',
            status: row.status || 'Pending',
            dueDate: row.due_date,
            requestedOn: row.requested_on,
            confirmedBy: row.confirmed_by || null,
            confirmedAt: row.confirmed_at || null,
            dueDateLabel: row.due_date ? formatDateTimeLabel(row.due_date) : '-',
            requestedOnLabel: row.requested_on ? formatDateTimeLabel(row.requested_on) : '-',
            confirmedAtLabel: row.confirmed_at ? formatDateTimeLabel(row.confirmed_at) : '-',
        }));

        return { data: mapped, error };
    },

    updateDeliverableByEmail: async (sponsorEmail, deliverableId, payload = {}) => {
        const { data: sponsor, error: sponsorError } = await sponsorHelpers.getSponsorByEmail(sponsorEmail);
        if (sponsorError || !sponsor) {
            return { data: null, error: sponsorError || new Error('Sponsor not found.') };
        }

        const updates = {
            updated_at: new Date().toISOString(),
        };

        if (Object.prototype.hasOwnProperty.call(payload, 'title')) {
            updates.title = String(payload.title || '').trim();
        }

        if (Object.prototype.hasOwnProperty.call(payload, 'dueDate')) {
            updates.due_date = payload.dueDate || null;
        }

        if (Object.prototype.hasOwnProperty.call(payload, 'status')) {
            updates.status = payload.status;
        }

        if (Object.prototype.hasOwnProperty.call(payload, 'tier')) {
            updates.tier = payload.tier || sponsor.tier || 'All';
        }

        if (Object.prototype.hasOwnProperty.call(payload, 'confirmedBy')) {
            updates.confirmed_by = payload.confirmedBy || null;
        }

        if (Object.prototype.hasOwnProperty.call(payload, 'confirmedAt')) {
            updates.confirmed_at = payload.confirmedAt || null;
        }

        let nextUpdates = { ...updates };
        let data = null;
        let error = null;

        // Some deployments do not have audit columns like updated_at on deliverables.
        for (let attempt = 0; attempt < 3; attempt += 1) {
            const result = await supabase
                .from('deliverables')
                .update(nextUpdates)
                .eq('id', deliverableId)
                .eq('sponsor_id', sponsor.id)
                .select('*')
                .maybeSingle();

            data = result.data;
            error = result.error;

            if (!error) {
                break;
            }

            const missingColumn = parseMissingColumnFromSchemaCacheError(error, 'deliverables');
            if (!missingColumn || !Object.prototype.hasOwnProperty.call(nextUpdates, missingColumn)) {
                break;
            }

            const { [missingColumn]: _ignored, ...remaining } = nextUpdates;
            nextUpdates = remaining;
        }

        if (error || !data) {
            return { data: null, error: error || new Error('Unable to update deliverable.') };
        }

        return {
            data: {
                id: data.id,
                title: data.title,
                tier: data.tier || 'All',
                status: data.status || 'Pending',
                dueDate: data.due_date,
                requestedOn: data.requested_on,
                confirmedBy: data.confirmed_by || null,
                confirmedAt: data.confirmed_at || null,
                dueDateLabel: data.due_date ? formatDateTimeLabel(data.due_date) : '-',
                requestedOnLabel: data.requested_on ? formatDateTimeLabel(data.requested_on) : '-',
                confirmedAtLabel: data.confirmed_at ? formatDateTimeLabel(data.confirmed_at) : '-',
            },
            error: null,
        };
    },

    deleteDeliverableByEmail: async (sponsorEmail, deliverableId) => {
        const { data: sponsor, error: sponsorError } = await sponsorHelpers.getSponsorByEmail(sponsorEmail);
        if (sponsorError || !sponsor) {
            return { error: sponsorError || new Error('Sponsor not found.') };
        }

        const { error } = await supabase
            .from('deliverables')
            .delete()
            .eq('id', deliverableId)
            .eq('sponsor_id', sponsor.id);

        return { error };
    },

    createDeliverableRequestByEmail: async (sponsorEmail, payload = {}) => {
        const { data: sponsor, error: sponsorError } = await sponsorHelpers.getSponsorByEmail(sponsorEmail);
        if (sponsorError || !sponsor) {
            return { data: null, error: sponsorError || new Error('Sponsor not found.') };
        }

        const insertPayload = {
            sponsor_id: sponsor.id,
            title: String(payload.title || '').trim(),
            tier: payload.tier || sponsor.tier || 'All',
            status: 'Pending',
            due_date: payload.dueDate || null,
            requested_on: new Date().toISOString().slice(0, 10),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        let nextInsertPayload = { ...insertPayload };
        let data = null;
        let error = null;

        // Some deployments do not have audit columns like created_at/updated_at/requested_on.
        for (let attempt = 0; attempt < 4; attempt += 1) {
            const result = await supabase
                .from('deliverables')
                .insert([nextInsertPayload])
                .select('*')
                .maybeSingle();

            data = result.data;
            error = result.error;

            if (!error) {
                break;
            }

            const missingColumn = parseMissingColumnFromSchemaCacheError(error, 'deliverables');
            if (!missingColumn || !Object.prototype.hasOwnProperty.call(nextInsertPayload, missingColumn)) {
                break;
            }

            const { [missingColumn]: _ignored, ...remaining } = nextInsertPayload;
            nextInsertPayload = remaining;
        }

        if (error || !data) {
            return { data: null, error: error || new Error('Unable to create deliverable request.') };
        }

        return {
            data: {
                id: data.id,
                title: data.title,
                tier: data.tier || 'All',
                status: data.status || 'Pending',
                dueDate: data.due_date,
                requestedOn: data.requested_on,
                confirmedBy: data.confirmed_by || null,
                confirmedAt: data.confirmed_at || null,
                dueDateLabel: data.due_date ? formatDateTimeLabel(data.due_date) : '-',
                requestedOnLabel: data.requested_on ? formatDateTimeLabel(data.requested_on) : '-',
                confirmedAtLabel: data.confirmed_at ? formatDateTimeLabel(data.confirmed_at) : '-',
            },
            error: null,
        };
    },

    getDocumentsAndAssetsByEmail: async (sponsorEmail) => {
        const { data: sponsor, error: sponsorError } = await sponsorHelpers.getSponsorByEmail(sponsorEmail);
        if (sponsorError || !sponsor) {
            return { data: { documents: [], assets: [] }, error: sponsorError || new Error('Sponsor not found.') };
        }

        const { data, error } = await supabase
            .from('sponsor_assets')
            .select('*')
            .eq('sponsor_id', sponsor.id)
            .order('uploaded_at', { ascending: false });

        const mappedRows = (data || []).map((row) => {
            const type = row.file_type || row.asset_category || 'N/A';
            const details = row.details || (row.file_size ? `${Number(row.file_size).toLocaleString('en-US')} bytes` : 'N/A');
            const uploadedAt = row.uploaded_at || row.created_at;

            return {
                id: row.id,
                name: row.file_name || 'Untitled Asset',
                type: String(type).toUpperCase(),
                details,
                size: details,
                uploadedOn: uploadedAt,
                uploadedOnLabel: uploadedAt ? formatDateTimeLabel(uploadedAt) : '-',
                fileUrl: row.file_url || '',
                assetCategory: row.asset_category || 'other',
            };
        });

        const documents = mappedRows.filter((row) => String(row.assetCategory || '').toLowerCase() === 'document');
        const assets = mappedRows.filter((row) => String(row.assetCategory || '').toLowerCase() !== 'document');

        return {
            data: {
                documents,
                assets,
            },
            error,
        };
    },

    createAssetByEmail: async (sponsorEmail, payload = {}) => {
        const { data: sponsor, error: sponsorError } = await sponsorHelpers.getSponsorByEmail(sponsorEmail);
        if (sponsorError || !sponsor) {
            return { data: null, error: sponsorError || new Error('Sponsor not found.') };
        }

        const normalizedType = String(payload.type || 'OTHER').toUpperCase();
        const assetCategory = ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX'].includes(normalizedType)
            ? 'document'
            : 'media';

        let nextInsertPayload = {
            sponsor_id: sponsor.id,
            file_name: String(payload.name || '').trim(),
            file_type: normalizedType,
            details: payload.details || null,
            file_url: payload.fileUrl || null,
            asset_category: payload.assetCategory || assetCategory,
            uploaded_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        let data = null;
        let error = null;

        // Handle schema drift by removing optional columns that are missing in sponsor_assets.
        for (let attempt = 0; attempt < 4; attempt += 1) {
            const result = await supabase
                .from('sponsor_assets')
                .insert([nextInsertPayload])
                .select('*')
                .maybeSingle();

            data = result.data;
            error = result.error;

            if (!error) {
                break;
            }

            const missingColumn = parseMissingColumnFromSchemaCacheError(error, 'sponsor_assets');
            if (!missingColumn || !Object.prototype.hasOwnProperty.call(nextInsertPayload, missingColumn)) {
                break;
            }

            const { [missingColumn]: _ignored, ...remaining } = nextInsertPayload;
            nextInsertPayload = remaining;
        }

        if (error || !data) {
            return { data: null, error: error || new Error('Unable to upload asset metadata.') };
        }

        return {
            data: {
                id: data.id,
                name: data.file_name || 'Untitled Asset',
                type: String(data.file_type || 'N/A').toUpperCase(),
                details: data.details || 'N/A',
                size: data.details || 'N/A',
                uploadedOn: data.uploaded_at,
                uploadedOnLabel: data.uploaded_at ? formatDateTimeLabel(data.uploaded_at) : '-',
                fileUrl: data.file_url || '',
                assetCategory: data.asset_category || 'other',
            },
            error: null,
        };
    },

    updateAssetByEmail: async (sponsorEmail, assetId, payload = {}) => {
        const { data: sponsor, error: sponsorError } = await sponsorHelpers.getSponsorByEmail(sponsorEmail);
        if (sponsorError || !sponsor) {
            return { data: null, error: sponsorError || new Error('Sponsor not found.') };
        }

        const updates = {
            updated_at: new Date().toISOString(),
        };

        if (Object.prototype.hasOwnProperty.call(payload, 'name')) {
            updates.file_name = String(payload.name || '').trim();
        }
        if (Object.prototype.hasOwnProperty.call(payload, 'type')) {
            updates.file_type = String(payload.type || 'OTHER').toUpperCase();
        }
        if (Object.prototype.hasOwnProperty.call(payload, 'details')) {
            updates.details = payload.details || null;
        }
        if (Object.prototype.hasOwnProperty.call(payload, 'fileUrl')) {
            updates.file_url = payload.fileUrl || null;
        }
        if (Object.prototype.hasOwnProperty.call(payload, 'assetCategory')) {
            updates.asset_category = payload.assetCategory || 'other';
        }

        let nextUpdates = { ...updates };
        let data = null;
        let error = null;

        for (let attempt = 0; attempt < 3; attempt += 1) {
            const result = await supabase
                .from('sponsor_assets')
                .update(nextUpdates)
                .eq('id', assetId)
                .eq('sponsor_id', sponsor.id)
                .select('*')
                .maybeSingle();

            data = result.data;
            error = result.error;

            if (!error) {
                break;
            }

            const missingColumn = parseMissingColumnFromSchemaCacheError(error, 'sponsor_assets');
            if (!missingColumn || !Object.prototype.hasOwnProperty.call(nextUpdates, missingColumn)) {
                break;
            }

            const { [missingColumn]: _ignored, ...remaining } = nextUpdates;
            nextUpdates = remaining;
        }

        if (error || !data) {
            return { data: null, error: error || new Error('Unable to update asset metadata.') };
        }

        const uploadedAt = data.uploaded_at || data.created_at;
        return {
            data: {
                id: data.id,
                name: data.file_name || 'Untitled Asset',
                type: String(data.file_type || 'N/A').toUpperCase(),
                details: data.details || 'N/A',
                size: data.details || 'N/A',
                uploadedOn: uploadedAt,
                uploadedOnLabel: uploadedAt ? formatDateTimeLabel(uploadedAt) : '-',
                fileUrl: data.file_url || '',
                assetCategory: data.asset_category || 'other',
            },
            error: null,
        };
    },

    deleteAssetByEmail: async (sponsorEmail, assetId) => {
        const { data: sponsor, error: sponsorError } = await sponsorHelpers.getSponsorByEmail(sponsorEmail);
        if (sponsorError || !sponsor) {
            return { error: sponsorError || new Error('Sponsor not found.') };
        }

        const { error } = await supabase
            .from('sponsor_assets')
            .delete()
            .eq('id', assetId)
            .eq('sponsor_id', sponsor.id);

        return { error };
    },

    getLedgerByEmail: async (sponsorEmail) => {
        const { data: sponsor, error: sponsorError } = await sponsorHelpers.getSponsorByEmail(sponsorEmail);
        if (sponsorError || !sponsor) {
            return {
                data: { ledger: [], summary: { committed: 0, allocated: 0, remaining: 0, utilization: 0 }, categories: [] },
                error: sponsorError || new Error('Sponsor not found.'),
            };
        }

        const { data, error } = await supabase
            .from('financial_ledger')
            .select('*')
            .eq('sponsor_id', sponsor.id)
            .order('date', { ascending: true });

        let runningBalance = 0;
        const ledger = (data || []).map((entry) => {
            const entryType = entry.entry_type || entry.type || 'allocation';
            const amount = safeNumber(entry.amount);

            if (entryType === 'commitment' || entryType === 'payment') {
                runningBalance += amount;
            } else {
                runningBalance -= amount;
            }

            return {
                id: entry.id,
                date: entry.date,
                dateLabel: entry.date ? formatDateTimeLabel(entry.date) : '-',
                description: entry.description,
                amount,
                balance: entry.balance ?? runningBalance,
                type: entryType,
                category: entry.category || 'Other',
            };
        });

        const committed = ledger
            .filter((entry) => entry.type === 'commitment' || entry.type === 'payment')
            .reduce((sum, entry) => sum + safeNumber(entry.amount), 0);

        const allocated = ledger
            .filter((entry) => entry.type === 'allocation')
            .reduce((sum, entry) => sum + safeNumber(entry.amount), 0);

        const remaining = Math.max(committed - allocated, 0);
        const utilization = committed ? Math.min(Math.round((allocated / committed) * 100), 100) : 0;

        const categoryTotals = ledger
            .filter((entry) => entry.type === 'allocation')
            .reduce((acc, entry) => {
                const category = entry.category || 'Other';
                acc[category] = (acc[category] || 0) + safeNumber(entry.amount);
                return acc;
            }, {});

        const categories = Object.entries(categoryTotals).map(([category, amount]) => ({
            category,
            amount,
            percentage: allocated ? Math.round((amount / allocated) * 100) : 0,
        }));

        return {
            data: {
                ledger,
                summary: { committed, allocated, remaining, utilization },
                categories,
            },
            error,
        };
    },

    getProofByEmail: async (sponsorEmail) => {
        const { data: sponsor, error: sponsorError } = await sponsorHelpers.getSponsorByEmail(sponsorEmail);
        if (sponsorError || !sponsor) {
            return {
                data: {
                    proofItems: [],
                    summary: { totalPlacements: 0, combinedReach: 0, mediaCoverage: '0%' },
                    contentTypes: { photo: 0, video: 0, screenshot: 0, link: 0 },
                    metrics: { averageReachPerItem: 0, peakEngagement: '0 reach', videoViews: 0, liveAttendeeImpact: '0' },
                },
                error: sponsorError || new Error('Sponsor not found.'),
            };
        }

        const { data, error } = await supabase
            .from('proof_of_execution')
            .select('*')
            .eq('sponsor_id', sponsor.id)
            .order('proof_date', { ascending: false });

        const proofItems = (data || []).map((item) => {
            const reach = safeNumber(parseReachMetrics(item.reach_metrics).reach);
            return {
                id: item.id,
                title: item.title || 'Proof item',
                type: item.type || item.media_type || 'photo',
                date: item.proof_date,
                dateLabel: item.proof_date ? formatDateTimeLabel(item.proof_date) : '-',
                reach,
                reachLabel: `${Number(reach).toLocaleString('en-US')} reach`,
                mediaUrl: item.proof_url || item.media_url || '',
            };
        });

        const combinedReach = proofItems.reduce((sum, item) => sum + safeNumber(item.reach), 0);
        const contentTypes = proofItems.reduce((acc, item) => {
            const key = item.type || 'photo';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, { photo: 0, video: 0, screenshot: 0, link: 0 });

        return {
            data: {
                proofItems,
                summary: {
                    totalPlacements: proofItems.length,
                    combinedReach,
                    mediaCoverage: proofItems.length ? '100%' : '0%',
                },
                contentTypes,
                metrics: {
                    averageReachPerItem: proofItems.length ? Math.round(combinedReach / proofItems.length) : 0,
                    peakEngagement: `${Math.max(...proofItems.map((item) => safeNumber(item.reach)), 0).toLocaleString('en-US')} reach`,
                    videoViews: proofItems
                        .filter((item) => item.type === 'video')
                        .reduce((sum, item) => sum + safeNumber(item.reach), 0),
                    liveAttendeeImpact: 'Live metrics pending',
                },
            },
            error,
        };
    },

    getSupportMessagesByEmail: async (sponsorEmail) => {
        const { data: sponsor, error: sponsorError } = await sponsorHelpers.getSponsorByEmail(sponsorEmail);
        if (sponsorError || !sponsor) {
            return { data: [], error: sponsorError || new Error('Sponsor not found.') };
        }

        let result = await supabase
            .from('support_messages')
            .select('*')
            .eq('sponsor_id', sponsor.id)
            .order('sent_at', { ascending: true });

        if (parseMissingColumnFromSchemaCacheError(result.error, 'support_messages') === 'sent_at') {
            result = await supabase
                .from('support_messages')
                .select('*')
                .eq('sponsor_id', sponsor.id)
                .order('created_at', { ascending: true });
        }

        const { data, error } = result;

        const mapped = (data || []).map((row) => ({
            id: row.id,
            from: row.from_name || (row.is_user ? 'You' : 'Support Team'),
            timestamp: row.sent_at ? formatDateTimeLabel(row.sent_at) : formatDateTimeLabel(row.created_at),
            message: row.message,
            isUser: Boolean(row.is_user),
        }));

        return { data: mapped, error };
    },

    sendSupportMessageByEmail: async (sponsorEmail, message) => {
        const { data: sponsor, error: sponsorError } = await sponsorHelpers.getSponsorByEmail(sponsorEmail);
        if (sponsorError || !sponsor) {
            return { data: null, error: sponsorError || new Error('Sponsor not found.') };
        }

        let nextInsertPayload = {
            sponsor_id: sponsor.id,
            from_name: 'You',
            message,
            is_user: true,
            sent_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        let data = null;
        let error = null;

        // Handle legacy support_messages schema by dropping missing optional columns.
        for (let attempt = 0; attempt < 6; attempt += 1) {
            const result = await supabase
                .from('support_messages')
                .insert([nextInsertPayload])
                .select('*')
                .maybeSingle();

            data = result.data;
            error = result.error;

            if (!error) {
                break;
            }

            const missingColumn = parseMissingColumnFromSchemaCacheError(error, 'support_messages');
            if (!missingColumn || !Object.prototype.hasOwnProperty.call(nextInsertPayload, missingColumn)) {
                break;
            }

            const { [missingColumn]: _ignored, ...remaining } = nextInsertPayload;
            nextInsertPayload = remaining;
        }

        if (error || !data) {
            return { data: null, error: error || new Error('Unable to send support message.') };
        }

        return {
            data: {
                id: data.id,
                from: data.from_name || 'You',
                timestamp: data.sent_at ? formatDateTimeLabel(data.sent_at) : formatDateTimeLabel(data.created_at),
                message: data.message,
                isUser: Boolean(data.is_user),
            },
            error: null,
        };
    },

    createProofMetricByEmail: async (sponsorEmail, payload = {}) => {
        const { data: sponsor, error: sponsorError } = await sponsorHelpers.getSponsorByEmail(sponsorEmail);
        if (sponsorError || !sponsor) {
            return { data: null, error: sponsorError || new Error('Sponsor not found.') };
        }

        const metricsPayload = {
            reach: safeNumber(payload.reach),
            impressions: safeNumber(payload.impressions),
            engagement: safeNumber(payload.engagement),
            signups: safeNumber(payload.signups),
        };

        const proofDate = payload.proofDate || new Date().toISOString();
        const mediaType = payload.type || payload.mediaType || 'screenshot';

        const resolvedProofUrl = String(payload.proofUrl || payload.mediaUrl || '').trim();

        const insertPayload = {
            sponsor_id: sponsor.id,
            title: String(payload.title || 'KPI Entry').trim(),
            type: mediaType,
            proof_url: resolvedProofUrl,
            media_url: resolvedProofUrl,
            reach_metrics: JSON.stringify(metricsPayload),
            proof_date: proofDate,
            notes: payload.notes || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        // Handle schema drift gracefully by dropping unknown columns reported by Supabase.
        // This avoids breakage when production has legacy variants of proof_of_execution.
        let candidatePayload = { ...insertPayload };

        for (let attempt = 0; attempt < 10; attempt += 1) {
            const { data, error } = await supabase
                .from('proof_of_execution')
                .insert([candidatePayload])
                .select('*')
                .maybeSingle();

            if (!error) {
                return { data, error: null };
            }

            const missingColumn = parseMissingColumnFromSchemaCacheError(error, 'proof_of_execution');
            if (!missingColumn || !(missingColumn in candidatePayload)) {
                const nullColumn = parseNullConstraintColumn(error);
                if (!nullColumn || !(nullColumn in candidatePayload)) {
                    return { data: null, error };
                }

                if (nullColumn === 'media_url') {
                    candidatePayload.media_url = String(candidatePayload.proof_url || '');
                    continue;
                }

                if (nullColumn === 'proof_url') {
                    candidatePayload.proof_url = String(candidatePayload.media_url || '');
                    continue;
                }

                candidatePayload[nullColumn] = '';
                continue;
            }

            delete candidatePayload[missingColumn];
        }

        return { data: null, error: new Error('Unable to save KPI entry due to incompatible proof_of_execution schema.') };
    },

    getSponsorKpiSnapshotByEmail: async (sponsorEmail) => {
        const result = await portalDashboardHelpers.getSponsorDashboardData(sponsorEmail);
        if (result?.error || !result?.data) {
            return { data: null, error: result?.error || new Error('Unable to load KPI snapshot.') };
        }

        return {
            data: {
                roiMetrics: result.data.roiMetrics,
                quickStats: result.data.quickStats,
                partnership: result.data.partnership,
            },
            error: null,
        };
    },

    getProofMetricEntriesByEmail: async (sponsorEmail, limit = 20) => {
        const { data: sponsor, error: sponsorError } = await sponsorHelpers.getSponsorByEmail(sponsorEmail);
        if (sponsorError || !sponsor) {
            return { data: [], error: sponsorError || new Error('Sponsor not found.') };
        }

        const { data, error } = await supabase
            .from('proof_of_execution')
            .select('*')
            .eq('sponsor_id', sponsor.id)
            .order('proof_date', { ascending: false })
            .limit(limit);

        return { data: data || [], error };
    },

    deleteProofMetricEntry: async (entryId) => {
        const { error } = await supabase
            .from('proof_of_execution')
            .delete()
            .eq('id', entryId);

        return { error };
    },
};

// Deliverable helpers
export const deliverableHelpers = {
    getDeliverables: async (sponsorId) => {
        const { data, error } = await supabase
            .from('deliverables')
            .select('*')
            .eq('sponsor_id', sponsorId)
            .order('due_date', { ascending: true });
        return { data, error };
    },

    updateStatus: async (id, status) => {
        const { data, error } = await supabase
            .from('deliverables')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();
        return { data, error };
    },
};

// File upload helpers
export const fileHelpers = {
    uploadSponsarAsset: async (sponsorId, file) => {
        const fileName = `${sponsorId}/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
            .from('sponsor-assets')
            .upload(fileName, file);
        return { data, error };
    },

    // Preferred spelling; kept alongside legacy method for compatibility.
    uploadSponsorAsset: async (sponsorId, file) => {
        return fileHelpers.uploadSponsarAsset(sponsorId, file);
    },

    uploadReceipt: async (userId, file) => {
        const fileName = `${userId}/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
            .from('receipts')
            .upload(fileName, file);
        return { data, error };
    },

    uploadProofOfExecution: async (sponsorId, file) => {
        const fileName = `${sponsorId}/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
            .from('proof-of-execution')
            .upload(fileName, file);
        return { data, error };
    },

    getPublicUrl: (bucket, path) => {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data?.publicUrl;
    },
};

// Activity logging helpers
export const activityHelpers = {
    log: async (userId, action, tableName, recordId, changes = {}) => {
        const { error } = await supabase
            .from('activity_log')
            .insert([{
                user_id: userId,
                action,
                table_name: tableName,
                record_id: recordId,
                changes,
                timestamp: new Date().toISOString(),
            }]);
        return { error };
    },

    getLogs: async (filters = {}) => {
        let query = supabase.from('activity_log').select('*');
        
        if (filters.userId) query = query.eq('user_id', filters.userId);
        if (filters.action) query = query.eq('action', filters.action);
        if (filters.tableName) query = query.eq('table_name', filters.tableName);
        
        const { data, error } = await query.order('timestamp', { ascending: false });
        return { data, error };
    },
};

// Real-time subscription helpers
export const realtimeHelpers = {
    subscribeToRequests: (callback) => {
        return supabase
            .channel('realtime:budget_requests')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'budget_requests' },
                (payload) => callback(payload)
            )
            .subscribe();
    },

    subscribeToTasks: (statusFilter = null, callback) => {
        return supabase
            .channel(`realtime:tasks:${statusFilter || 'all'}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tasks' },
                (payload) => {
                    if (!statusFilter) {
                        callback(payload);
                        return;
                    }

                    const nextStatus = payload.new?.status || payload.old?.status || null;
                    if (nextStatus === statusFilter) {
                        callback(payload);
                    }
                }
            )
            .subscribe();
    },

    subscribeToSponsors: (callback) => {
        return supabase
            .channel('realtime:sponsors')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'sponsors' },
                (payload) => callback(payload)
            )
            .subscribe();
    },

    subscribeToExpenditures: (callback) => {
        return supabase
            .channel('realtime:expenditures')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'expenditures' },
                (payload) => callback(payload)
            )
            .subscribe();
    },

    unsubscribe: (subscription) => {
        return supabase.removeChannel(subscription);
    },
};

export default supabase;
