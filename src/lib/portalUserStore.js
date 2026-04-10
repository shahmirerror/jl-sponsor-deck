import { supabase } from './supabaseHelpers';

const STORAGE_KEY = 'portalUsersDb:v1';

const hasBrowser = () => typeof window !== 'undefined';

const nowIso = () => new Date().toISOString();

const seedData = () => ({
    updatedAt: nowIso(),
    admins: [
        {
            id: 'admin-super-1',
            email: 'acm@jinnah.edu',
            password: '2025@cmm@ju!@#',
            name: 'ACM Super Admin',
            role: 'Super Admin',
            department: 'Leadership',
            title: 'System Owner',
            status: 'active',
            userKind: 'admin',
        },
        {
            id: 'admin-1',
            email: 'fa24bscs0113@maju.edu.pk',
            password: 'acmjl26!PR',
            name: 'Abdul Rafay',
            role: 'Admin',
            department: 'PR',
            title: 'Director of PR',
            status: 'active',
            userKind: 'admin',
        },
        {
            id: 'admin-2',
            email: 'fa22bscs0159@maju.edu.pk',
            password: 'acmjl26!SG',
            name: 'Shahmir Sindhu',
            role: 'Admin',
            department: 'Leadership',
            title: 'President',
            status: 'active',
            userKind: 'admin',
        },
        {
            id: 'admin-3',
            email: 'fa22bscs0174@maju.edu.pk',
            password: 'acmjl26!TR',
            name: 'Atta Ur Rehman',
            role: 'Admin',
            department: 'Finance',
            title: 'Treasurer',
            status: 'active',
            userKind: 'admin',
        },
        {
            id: 'admin-4',
            email: 'fa23bece0042@maju.edu.pk',
            password: 'acmjl26!EM',
            name: 'Love Maheshwari',
            role: 'Editor',
            department: 'Event Management',
            title: 'Director of Event Management',
            status: 'active',
            userKind: 'admin',
        },
        {
            id: 'admin-5',
            email: 'fa24bsbt0018@maju.edu.pk',
            password: 'acmjl26!MK',
            name: 'Muzna Moin',
            role: 'Editor',
            department: 'Marketing',
            title: 'Director of Marketing',
            status: 'active',
            userKind: 'admin',
        },
        {
            id: 'admin-6',
            email: 'fa24bscs0044@maju.edu.pk',
            password: 'acmjl26!SM',
            name: 'Mahnoor Sohail',
            role: 'Editor',
            department: 'Social Media',
            title: 'Director of Social Media',
            status: 'active',
            userKind: 'admin',
        },
        {
            id: 'admin-7',
            email: 'sp24bscs0099@maju.edu.pk',
            password: 'acmjl26!CC',
            name: 'Areeba Kalwar',
            role: 'Editor',
            department: 'Code Club',
            title: 'Director of Code Club',
            status: 'active',
            userKind: 'admin',
        },
        {
            id: 'admin-8',
            email: 'fa22bscs0173@maju.edu.pk',
            password: 'acmjl26!GD',
            name: 'Syed Abdul Sami',
            role: 'Editor',
            department: 'Gaming',
            title: 'Director of Gamerz Den',
            status: 'active',
            userKind: 'admin',
        },
    ],
    sponsors: [
        {
            id: 'sponsor-1',
            email: 'sponsor@aksiq.com',
            password: 'aksiq2026!',
            company: 'AKSIQ',
            tier: 'Platinum',
            committed: 5000000,
            contactName: 'AKSIQ Sponsor Admin',
            status: 'active',
            userKind: 'sponsor',
        },
        {
            id: 'sponsor-2',
            email: 'sponsor@gtv.com',
            password: 'gtv2026!',
            company: 'GTV News',
            tier: 'Gold',
            committed: 2500000,
            contactName: 'GTV Sponsor Admin',
            status: 'active',
            userKind: 'sponsor',
        },
        {
            id: 'sponsor-3',
            email: 'sponsor@inspedium.com',
            password: 'inspedium2026!',
            company: 'Inspedium Corp',
            tier: 'Silver',
            committed: 1500000,
            contactName: 'Inspedium Sponsor Admin',
            status: 'active',
            userKind: 'sponsor',
        },
        {
            id: 'sponsor-4',
            email: 'sponsor@matz.com',
            password: 'matz2026!',
            company: 'Matz Solution',
            tier: 'Bronze',
            committed: 750000,
            contactName: 'Matz Sponsor Admin',
            status: 'active',
            userKind: 'sponsor',
        },
    ],
});

const loadDb = () => {
    if (!hasBrowser()) {
        return seedData();
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        const seeded = seedData();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
    }

    try {
        return JSON.parse(raw);
    } catch {
        const seeded = seedData();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
    }
};

const saveDb = (db) => {
    if (!hasBrowser()) {
        return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...db, updatedAt: nowIso() }));
};

const makeId = (prefix) => `${prefix}-${Date.now()}`;

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const syncAdminToSupabase = async (user) => {
    try {
        await supabase
            .from('users')
            .upsert([
                {
                    email: normalizeEmail(user.email),
                    password_hash: user.password,
                    name: user.name,
                    role: user.role,
                    department: user.department,
                    title: user.title,
                    status: user.status,
                    user_kind: 'admin',
                    updated_at: nowIso(),
                },
            ], { onConflict: 'email' });
    } catch {
        // Keep local portal behavior working even if Supabase schema differs.
    }
};

const syncSponsorToSupabase = async (user) => {
    try {
        await supabase
            .from('sponsors')
            .upsert([
                {
                    company_name: user.company,
                    contact_email: normalizeEmail(user.email),
                    password_hash: user.password,
                    tier: user.tier,
                    committed_amount: Number(user.committed || 0),
                    payment_status: user.status === 'disabled' ? 'Overdue' : 'Pending',
                    contact_name: user.contactName,
                    status: user.status,
                    user_kind: 'sponsor',
                    updated_at: nowIso(),
                },
            ], { onConflict: 'contact_email' });
    } catch {
        // Keep local portal behavior working even if Supabase schema differs.
    }
};

const deleteAdminFromSupabase = async (email) => {
    try {
        await supabase.from('users').delete().eq('email', normalizeEmail(email));
    } catch {
        // Ignore sync failures to preserve local-first admin workflow.
    }
};

const deleteSponsorFromSupabase = async (email) => {
    try {
        await supabase.from('sponsors').delete().eq('contact_email', normalizeEmail(email));
    } catch {
        // Ignore sync failures to preserve local-first admin workflow.
    }
};

const getCombinedUsers = (db = loadDb()) => [
    ...db.admins.map((user) => ({ ...user, kind: 'admin' })),
    ...db.sponsors.map((user) => ({ ...user, kind: 'sponsor' })),
];

const findUser = (db, kind, email) => {
    const list = kind === 'sponsor' ? db.sponsors : db.admins;
    return list.find((user) => normalizeEmail(user.email) === normalizeEmail(email));
};

export const portalUserStore = {
    getAllUsers() {
        return getCombinedUsers();
    },

    getAdmins() {
        return loadDb().admins.map((user) => ({ ...user, kind: 'admin' }));
    },

    getSponsors() {
        return loadDb().sponsors.map((user) => ({ ...user, kind: 'sponsor' }));
    },

    getUser(kind, email) {
        const db = loadDb();
        const user = findUser(db, kind, email);
        return user ? { ...user, kind } : null;
    },

    authenticate(kind, email, password) {
        const db = loadDb();
        const user = findUser(db, kind, email);

        if (!user || user.status !== 'active' || user.password !== password) {
            throw new Error('Invalid credentials or account is disabled.');
        }

        return { ...user, kind };
    },

    upsertAdmin(payload) {
        const db = loadDb();
        const nextUser = {
            id: payload.id || makeId('admin'),
            email: normalizeEmail(payload.email),
            password: payload.password,
            name: payload.name,
            role: payload.role || 'Editor',
            department: payload.department || '',
            title: payload.title || '',
            status: payload.status || 'active',
            userKind: 'admin',
        };

        const nextAdmins = db.admins.filter((user) => normalizeEmail(user.email) !== nextUser.email);
        nextAdmins.unshift(nextUser);
        const nextDb = { ...db, admins: nextAdmins };
        saveDb(nextDb);
        syncAdminToSupabase(nextUser);
        return { ...nextUser, kind: 'admin' };
    },

    upsertSponsor(payload) {
        const db = loadDb();
        const nextUser = {
            id: payload.id || makeId('sponsor'),
            email: normalizeEmail(payload.email),
            password: payload.password,
            company: payload.company,
            tier: payload.tier || 'Gold',
            committed: Number(payload.committed || 0),
            contactName: payload.contactName || '',
            status: payload.status || 'active',
            userKind: 'sponsor',
        };

        const nextSponsors = db.sponsors.filter((user) => normalizeEmail(user.email) !== nextUser.email);
        nextSponsors.unshift(nextUser);
        const nextDb = { ...db, sponsors: nextSponsors };
        saveDb(nextDb);
        syncSponsorToSupabase(nextUser);
        return { ...nextUser, kind: 'sponsor' };
    },

    updateUser(kind, email, patch) {
        const db = loadDb();
        const collectionName = kind === 'sponsor' ? 'sponsors' : 'admins';
        const nextUsers = db[collectionName].map((user) => {
            if (normalizeEmail(user.email) !== normalizeEmail(email)) {
                return user;
            }

            return {
                ...user,
                ...patch,
                email: patch.email ? normalizeEmail(patch.email) : user.email,
                committed: patch.committed !== undefined ? Number(patch.committed) : user.committed,
            };
        });

        const nextDb = { ...db, [collectionName]: nextUsers };
        saveDb(nextDb);
        const updated = nextUsers.find((user) => normalizeEmail(user.email) === normalizeEmail(patch.email || email));
        if (updated) {
            if (kind === 'sponsor') {
                syncSponsorToSupabase(updated);
            } else {
                syncAdminToSupabase(updated);
            }
        }
        return updated ? { ...updated, kind } : null;
    },

    setStatus(kind, email, status) {
        const db = loadDb();
        const collectionName = kind === 'sponsor' ? 'sponsors' : 'admins';
        const nextUsers = db[collectionName].map((user) => (
            normalizeEmail(user.email) === normalizeEmail(email) ? { ...user, status } : user
        ));
        const nextDb = { ...db, [collectionName]: nextUsers };
        saveDb(nextDb);

        // Optional DB sync if the column exists in the project schema.
        const target = nextUsers.find((user) => normalizeEmail(user.email) === normalizeEmail(email));
        if (target) {
            if (kind === 'sponsor') {
                syncSponsorToSupabase(target);
            } else {
                syncAdminToSupabase(target);
            }
        }
    },

    resetPassword(kind, email, password) {
        const db = loadDb();
        const collectionName = kind === 'sponsor' ? 'sponsors' : 'admins';
        const nextUsers = db[collectionName].map((user) => (
            normalizeEmail(user.email) === normalizeEmail(email) ? { ...user, password } : user
        ));
        const nextDb = { ...db, [collectionName]: nextUsers };
        saveDb(nextDb);

        const target = nextUsers.find((user) => normalizeEmail(user.email) === normalizeEmail(email));
        if (target) {
            if (kind === 'admin') {
                syncAdminToSupabase(target);
            } else {
                syncSponsorToSupabase(target);
            }
        }
    },

    deleteUser(kind, email) {
        const db = loadDb();
        const collectionName = kind === 'sponsor' ? 'sponsors' : 'admins';
        const nextUsers = db[collectionName].filter((user) => normalizeEmail(user.email) !== normalizeEmail(email));
        const nextDb = { ...db, [collectionName]: nextUsers };
        saveDb(nextDb);

        if (kind === 'sponsor') {
            deleteSponsorFromSupabase(email);
        } else {
            deleteAdminFromSupabase(email);
        }
    },

    clearAll() {
        if (hasBrowser()) {
            window.localStorage.removeItem(STORAGE_KEY);
        }
    },
};

export const portalUserKinds = {
    admin: 'admin',
    sponsor: 'sponsor',
};
