const MODULES = ['Budget Management', 'Task Board', 'Vendor Management', 'Reports/Analytics', 'Settings', 'User Management'];
const OPERATIONS = ['Create', 'Read', 'Update', 'Delete', 'Approve', 'Reject', 'Export'];

const fullPermissions = () => MODULES.reduce((moduleAcc, module) => {
    moduleAcc[module] = OPERATIONS.reduce((opAcc, operation) => {
        opAcc[operation] = true;
        return opAcc;
    }, {});
    return moduleAcc;
}, {});

const readOnlyPermissions = () => MODULES.reduce((moduleAcc, module) => {
    moduleAcc[module] = OPERATIONS.reduce((opAcc, operation) => {
        opAcc[operation] = operation === 'Read';
        return opAcc;
    }, {});
    return moduleAcc;
}, {});

const ROLE_PERMISSION_TEMPLATES = {
    'Super Admin': fullPermissions(),
    Admin: fullPermissions(),
    Manager: {
        'Budget Management': { Create: true, Read: true, Update: true, Delete: false, Approve: true, Reject: true, Export: true },
        'Task Board': { Create: true, Read: true, Update: true, Delete: false, Approve: false, Reject: false, Export: true },
        'Vendor Management': { Create: true, Read: true, Update: true, Delete: false, Approve: false, Reject: false, Export: true },
        'Reports/Analytics': { Create: false, Read: true, Update: false, Delete: false, Approve: false, Reject: false, Export: true },
        Settings: { Create: false, Read: true, Update: false, Delete: false, Approve: false, Reject: false, Export: false },
        'User Management': { Create: false, Read: true, Update: false, Delete: false, Approve: false, Reject: false, Export: false },
    },
    Accountant: {
        'Budget Management': { Create: true, Read: true, Update: true, Delete: false, Approve: false, Reject: false, Export: true },
        'Task Board': { Create: false, Read: true, Update: false, Delete: false, Approve: false, Reject: false, Export: false },
        'Vendor Management': { Create: true, Read: true, Update: true, Delete: false, Approve: false, Reject: false, Export: true },
        'Reports/Analytics': { Create: false, Read: true, Update: false, Delete: false, Approve: false, Reject: false, Export: true },
        Settings: { Create: false, Read: false, Update: false, Delete: false, Approve: false, Reject: false, Export: false },
        'User Management': { Create: false, Read: false, Update: false, Delete: false, Approve: false, Reject: false, Export: false },
    },
    Lead: {
        'Budget Management': { Create: false, Read: true, Update: false, Delete: false, Approve: false, Reject: false, Export: false },
        'Task Board': { Create: true, Read: true, Update: true, Delete: false, Approve: false, Reject: false, Export: true },
        'Vendor Management': { Create: false, Read: true, Update: false, Delete: false, Approve: false, Reject: false, Export: false },
        'Reports/Analytics': { Create: false, Read: true, Update: false, Delete: false, Approve: false, Reject: false, Export: false },
        Settings: { Create: false, Read: false, Update: false, Delete: false, Approve: false, Reject: false, Export: false },
        'User Management': { Create: false, Read: false, Update: false, Delete: false, Approve: false, Reject: false, Export: false },
    },
    Editor: {
        'Budget Management': { Create: true, Read: true, Update: true, Delete: false, Approve: false, Reject: false, Export: false },
        'Task Board': { Create: true, Read: true, Update: true, Delete: false, Approve: false, Reject: false, Export: false },
        'Vendor Management': { Create: true, Read: true, Update: true, Delete: false, Approve: false, Reject: false, Export: false },
        'Reports/Analytics': { Create: false, Read: true, Update: false, Delete: false, Approve: false, Reject: false, Export: false },
        Settings: { Create: false, Read: true, Update: false, Delete: false, Approve: false, Reject: false, Export: false },
        'User Management': { Create: false, Read: false, Update: false, Delete: false, Approve: false, Reject: false, Export: false },
    },
    Viewer: readOnlyPermissions(),
};

const getRolePermissions = (role) => {
    const resolvedRole = role || 'Viewer';
    return ROLE_PERMISSION_TEMPLATES[resolvedRole] || ROLE_PERMISSION_TEMPLATES.Viewer;
};

export const getEffectivePermissions = (user) => {
    if (!user) {
        return ROLE_PERMISSION_TEMPLATES.Viewer;
    }

    if (user.customPermissions) {
        return user.customPermissions;
    }

    return getRolePermissions(user.role);
};

export const hasPermission = (user, moduleName, operation) => {
    const effective = getEffectivePermissions(user);
    return Boolean(effective?.[moduleName]?.[operation]);
};

export const permissionModules = MODULES;
export const permissionOperations = OPERATIONS;
