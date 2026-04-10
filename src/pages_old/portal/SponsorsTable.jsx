import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Button from '../../components/Button';
import { DisabledPermissionButton, PermissionReadOnlyNote } from '../../components/PermissionFeedback';
import { realtimeHelpers, supabaseStatus, taskHelpers } from '../../lib/supabaseHelpers';
import { hasPermission } from '../../lib/permissions';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Pencil, Trash2 } from 'lucide-react';

const COLUMN_ORDER = ['To Do', 'In Progress', 'Completed'];

const STATUS_TO_DB = {
    'To Do': 'todo',
    'In Progress': 'inprogress',
    Completed: 'completed',
};

const STATUS_FROM_DB = {
    todo: 'To Do',
    inprogress: 'In Progress',
    completed: 'Completed',
};

const hasPersistedId = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id || ''));

const getSortOrder = (row) => {
    const value = row.sort_order ?? row.sortOrder;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const mapTaskRow = (row, fallbackId) => {
    const mappedStatus = STATUS_FROM_DB[row.status] || row.status || 'To Do';
    return {
        id: row.id || fallbackId,
        title: row.title || 'Untitled task',
        owner: row.owner || 'Unassigned',
        due: row.due_date || (mappedStatus === 'Completed' ? 'Done' : 'This week'),
        status: mappedStatus,
        sortOrder: getSortOrder(row),
    };
};

const SponsorsTable = ({ user }) => {
    const [tasks, setTasks] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [formData, setFormData] = useState({ title: '', owner: '', due: 'Tomorrow', status: 'To Do' });
    const [draggedTaskId, setDraggedTaskId] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [supportsTaskOrdering, setSupportsTaskOrdering] = useState(null);
    const [syncError, setSyncError] = useState('');
    const canCreateTask = hasPermission(user, 'Task Board', 'Create');
    const canUpdateTask = hasPermission(user, 'Task Board', 'Update');
    const canDeleteTask = hasPermission(user, 'Task Board', 'Delete');

    const loadTasks = useCallback(async (withLoader = true) => {
        if (withLoader) {
            setIsLoading(true);
        }

        const { data, error } = await taskHelpers.getTasks();

        if (!error) {
            const rows = data || [];
            setTasks(rows.map((row, index) => mapTaskRow(row, `loaded-${index}`)));
            if (rows.some((row) => Object.prototype.hasOwnProperty.call(row, 'sort_order'))) {
                setSupportsTaskOrdering(true);
            }
            setSyncError('');
        } else {
            setTasks([]);
            setSyncError(supabaseStatus.configured
                ? `Database sync failed: ${error.message || 'check table policies/columns and refresh.'}`
                : 'Supabase is not configured. Task board requires a live database.');
        }

        if (withLoader) {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        let active = true;

        const initialLoad = async () => {
            if (!active) return;
            await loadTasks(true);
        };

        initialLoad();

        return () => {
            active = false;
        };
    }, [loadTasks]);

    useEffect(() => {
        if (!supabaseStatus.configured) {
            return undefined;
        }

        const subscription = realtimeHelpers.subscribeToTasks(null, () => {
            void loadTasks(false);
        });

        return () => {
            if (subscription?.unsubscribe) {
                subscription.unsubscribe();
                return;
            }
            realtimeHelpers.unsubscribe(subscription);
        };
    }, [loadTasks]);

    const boardColumns = useMemo(
        () => COLUMN_ORDER.map((column) => ({
            title: column,
            items: (tasks || []).filter((task) => task.status === column),
        })),
        [tasks]
    );

    const persistTaskOrdering = async (nextTasks, statuses) => {
        if (supportsTaskOrdering === false) {
            return;
        }

        const affectedStatuses = (Array.isArray(statuses) ? statuses : [statuses]).filter(Boolean);
        const updates = [];

        affectedStatuses.forEach((status) => {
            const orderedTasks = nextTasks.filter((task) => task.status === status);
            orderedTasks.forEach((task, index) => {
                if (hasPersistedId(task.id)) {
                    updates.push({ id: task.id, sortOrder: orderedTasks.length - index });
                }
            });
        });

        if (!updates.length) {
            return;
        }

        const results = await Promise.all(updates.map(({ id, sortOrder }) => taskHelpers.updateTaskOrder(id, sortOrder)));
        if (results.some((result) => result?.error)) {
            const failed = results.find((result) => result?.error)?.error;
            setSyncError(`Task order save failed: ${failed?.message || 'unknown database error'}`);
            setSupportsTaskOrdering(false);
            return;
        }

        if (supportsTaskOrdering !== true) {
            setSupportsTaskOrdering(true);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (editingTaskId && !canUpdateTask) {
            return;
        }
        if (!editingTaskId && !canCreateTask) {
            return;
        }
        if (!formData.title.trim() || !formData.owner.trim()) {
            return;
        }

        const payload = {
            title: formData.title.trim(),
            owner: formData.owner.trim(),
            due_date: formData.due,
            status: STATUS_TO_DB[formData.status] || 'todo',
            priority: 'medium',
        };

        if (editingTaskId && hasPersistedId(editingTaskId)) {
            const previousTask = tasks.find((task) => task.id === editingTaskId);
            const { data, error } = await taskHelpers.updateTask(editingTaskId, payload);
            if (error) {
                setSyncError(`Task update failed: ${error.message || 'database rejected the update'}`);
                return;
            }
            if (!error && data?.[0]) {
                const updatedTask = mapTaskRow(data[0], editingTaskId);
                const nextTasks = tasks.map((task) => (task.id === editingTaskId ? updatedTask : task));
                setTasks(nextTasks);
                void persistTaskOrdering(nextTasks, previousTask?.status === updatedTask.status ? updatedTask.status : [previousTask?.status, updatedTask.status]);
            }
        } else if (editingTaskId) {
            const nextTasks = tasks.map((task) => (
                task.id === editingTaskId
                    ? { ...task, title: payload.title, owner: payload.owner, due: formData.due, status: formData.status }
                    : task
            ));
            setTasks(nextTasks);
        } else {
            const { data, error } = await taskHelpers.createTask(payload);
            if (error) {
                setSyncError(`Task create failed: ${error.message || 'database rejected the insert'}`);
                return;
            }
            if (!data?.[0]) {
                setSyncError('Task create returned no row from database.');
                return;
            }

            const nextTask = mapTaskRow(data[0], `created-${Date.now()}`);

            const nextTasks = [nextTask, ...tasks];
            setTasks(nextTasks);
            void persistTaskOrdering(nextTasks, nextTask.status);
        }

        setFormData({ title: '', owner: '', due: 'Tomorrow', status: 'To Do' });
        setEditingTaskId(null);
        setShowForm(false);
    };

    const startEditTask = (task) => {
        setEditingTaskId(task.id);
        setFormData({
            title: task.title,
            owner: task.owner,
            due: task.due,
            status: task.status,
        });
        setShowForm(true);
    };

    const cancelEditTask = () => {
        setEditingTaskId(null);
        setFormData({ title: '', owner: '', due: 'Tomorrow', status: 'To Do' });
        setShowForm(false);
    };

    const moveTask = async (taskId, direction) => {
        if (!canUpdateTask) {
            return;
        }
        let nextStatus = null;
        let sourceStatus = null;
        const nextTasks = tasks.map((task) => {
            if (task.id !== taskId) {
                return task;
            }

            sourceStatus = task.status;
            const currentIndex = COLUMN_ORDER.indexOf(task.status);
            const nextIndex = currentIndex + direction;
            if (nextIndex < 0 || nextIndex >= COLUMN_ORDER.length) {
                return task;
            }

            nextStatus = COLUMN_ORDER[nextIndex];
            return { ...task, status: nextStatus, due: nextIndex === 2 ? 'Done' : task.due };
        });

        setTasks(nextTasks);

        if (nextStatus && hasPersistedId(taskId)) {
            const { error } = await taskHelpers.updateTaskStatus(taskId, STATUS_TO_DB[nextStatus] || 'todo');
            if (error) {
                setSyncError(`Task status update failed: ${error.message || 'database rejected the update'}`);
                return;
            }
            void persistTaskOrdering(nextTasks, [sourceStatus, nextStatus]);
        }
    };

    const deleteTask = async (taskId) => {
        if (!canDeleteTask) {
            return;
        }
        const deletedTask = tasks.find((task) => task.id === taskId);
        if (hasPersistedId(taskId)) {
            const { error } = await taskHelpers.deleteTask(taskId);
            if (error) {
                setSyncError(`Task delete failed: ${error.message || 'database rejected the delete'}`);
                return;
            }
        }
        const nextTasks = tasks.filter((task) => task.id !== taskId);
        setTasks(nextTasks);
        if (deletedTask) {
            void persistTaskOrdering(nextTasks, deletedTask.status);
        }
    };

    const handleDragStart = (e, taskId) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('taskId', String(taskId));
    };

    const handleDragOver = (e, column) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumn(column);
    };

    const handleDragLeave = (e) => {
        if (e.currentTarget === e.target) {
            setDragOverColumn(null);
        }
    };

    const handleDrop = async (e, targetStatus) => {
        e.preventDefault();
        if (!canUpdateTask) {
            setDragOverColumn(null);
            setDraggedTaskId(null);
            return;
        }
        const taskIdRaw = e.dataTransfer.getData('taskId');
        const taskId = /^\d+$/.test(taskIdRaw) ? Number(taskIdRaw) : taskIdRaw;
        setDragOverColumn(null);
        setDraggedTaskId(null);

        let sourceStatus = null;
        const nextTasks = tasks.map((task) => {
                if (task.id === taskId) {
                    sourceStatus = task.status;
                    const newDue = targetStatus === 'Completed' ? 'Done' : task.due;
                    return { ...task, status: targetStatus, due: newDue };
                }
                return task;
            });

        setTasks(nextTasks);

        if (hasPersistedId(taskId)) {
            const { error } = await taskHelpers.updateTaskStatus(taskId, STATUS_TO_DB[targetStatus] || 'todo');
            if (error) {
                setSyncError(`Task status update failed: ${error.message || 'database rejected the update'}`);
                return;
            }
            void persistTaskOrdering(nextTasks, [sourceStatus, targetStatus]);
        }
    };

    const handleDragEnd = () => {
        setDraggedTaskId(null);
        setDragOverColumn(null);
    };

    const moveTaskWithinColumn = (taskId, direction) => {
        if (!canUpdateTask) {
            return;
        }
        const task = tasks.find((currentTask) => currentTask.id === taskId);
        if (!task) return;

        const columnTasks = tasks.filter((currentTask) => currentTask.status === task.status);
        const currentIndex = columnTasks.findIndex((currentTask) => currentTask.id === taskId);

        if (direction === 'up' && currentIndex === 0) return;
        if (direction === 'down' && currentIndex === columnTasks.length - 1) return;

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        const [movedTask] = columnTasks.splice(currentIndex, 1);
        columnTasks.splice(newIndex, 0, movedTask);

        const nextTasks = [
            ...tasks.filter((currentTask) => currentTask.status !== task.status),
            ...columnTasks,
        ];

        setTasks(nextTasks);
        void persistTaskOrdering(nextTasks, task.status);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <SectionLabel text="Coordination" />
                    <h2 className="mt-2">Inter-Departmental Task Board</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '720px' }}>
                        Track event milestones across marketing, logistics, finance, and production using a simple Kanban workflow.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button variant="outline" onClick={() => loadTasks(true)}>Refresh</Button>
                    {canCreateTask && <Button onClick={() => setShowForm((prev) => !prev)}>{showForm ? 'Close Form' : '+ Add Task'}</Button>}
                    {!canCreateTask && (
                        <DisabledPermissionButton
                            title="Missing permission: Task Board → Create"
                            style={{ fontWeight: '400' }}
                        >
                            + Add Task
                        </DisabledPermissionButton>
                    )}
                </div>
            </div>

            {!canCreateTask && (
                <PermissionReadOnlyNote style={{ marginTop: '-18px' }}>
                    Task creation is disabled for your role. Request Task Board Create permission to add tasks.
                </PermissionReadOnlyNote>
            )}

            {syncError ? (
                <Card style={{ padding: '12px 14px', marginBottom: '16px', border: '1px solid rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.12)', color: 'var(--warning)' }}>
                    {syncError}
                </Card>
            ) : null}

            {showForm && (canCreateTask || canUpdateTask) && (
                <Card style={{ padding: '20px', marginBottom: '24px' }}>
                    <h4 style={{ marginBottom: '14px' }}>{editingTaskId ? 'Edit Task' : 'Create Task'}</h4>
                    <form onSubmit={handleCreateTask}>
                        <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                            <input
                                type="text"
                                placeholder="Task title"
                                value={formData.title}
                                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Owner / Team"
                                value={formData.owner}
                                onChange={(e) => setFormData((prev) => ({ ...prev, owner: e.target.value }))}
                                required
                            />
                            <select value={formData.due} onChange={(e) => setFormData((prev) => ({ ...prev, due: e.target.value }))}>
                                <option>Today</option>
                                <option>Tomorrow</option>
                                <option>This week</option>
                                <option>Next week</option>
                            </select>
                            <select value={formData.status} onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}>
                                {COLUMN_ORDER.map((column) => (
                                    <option key={column} value={column}>{column}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
                            <Button type="submit">{editingTaskId ? 'Save Changes' : 'Create Task'}</Button>
                            <button
                                type="button"
                                onClick={cancelEditTask}
                                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '10px 14px', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </Card>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                {boardColumns.map((column) => (
                    <Card
                        key={column.title}
                        style={{
                            padding: '20px',
                            minHeight: '320px',
                            backgroundColor: dragOverColumn === column.title ? 'rgba(201, 168, 76, 0.08)' : 'var(--bg-card)',
                            border: dragOverColumn === column.title ? '2px dashed var(--accent-gold)' : '1px solid var(--border)',
                            transition: 'all 0.2s ease',
                        }}
                        onDragOver={(e) => handleDragOver(e, column.title)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => { handleDrop(e, column.title); }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h4 style={{ marginBottom: 0 }}>{column.title}</h4>
                            <span className="label" style={{ color: 'var(--text-muted)' }}>{column.items.length}</span>
                        </div>
                        <div
                            style={{
                                display: 'grid',
                                gap: '12px',
                                minHeight: '260px',
                                padding: '8px',
                                borderRadius: '6px',
                                background: dragOverColumn === column.title ? 'rgba(201, 168, 76, 0.04)' : 'transparent',
                            }}
                        >
                            {column.items.map((item) => (
                                <div
                                    key={item.id}
                                    draggable={canUpdateTask}
                                    onDragStart={(e) => handleDragStart(e, item.id)}
                                    onDragEnd={handleDragEnd}
                                    style={{
                                        padding: '14px',
                                        border: draggedTaskId === item.id ? '2px solid var(--accent-gold)' : '1px solid var(--border)',
                                        background: draggedTaskId === item.id ? 'rgba(201, 168, 76, 0.15)' : 'rgba(255,255,255,0.02)',
                                        cursor: canUpdateTask ? 'grab' : 'default',
                                        opacity: draggedTaskId === item.id ? 0.7 : 1,
                                        transform: draggedTaskId === item.id ? 'scale(0.98)' : 'scale(1)',
                                        transition: 'all 0.2s ease',
                                        userSelect: 'none',
                                    }}
                                >
                                    <div style={{ fontWeight: 600, marginBottom: '6px', cursor: draggedTaskId === item.id ? 'grabbing' : 'grab' }}>≣ {item.title}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.owner}</div>
                                    <div className="label" style={{ marginTop: '8px', color: 'var(--accent-gold)' }}>{item.due}</div>
                                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                                            {canUpdateTask && (
                                                <button
                                                    type="button"
                                                    onClick={() => { startEditTask(item); }}
                                                    title="Edit task"
                                                    aria-label="Edit task"
                                                    style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: 'var(--warning)', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '3px' }}
                                                >
                                                    <Pencil size={13} />
                                                </button>
                                            )}
                                            {canUpdateTask && item.status !== 'To Do' && (
                                            <button
                                                type="button"
                                                onClick={() => { moveTask(item.id, -1); }}
                                                title="Move to previous column"
                                                aria-label="Move to previous column"
                                                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: 'var(--success)', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '3px' }}
                                            >
                                                <ArrowLeft size={13} />
                                            </button>
                                        )}
                                            {canUpdateTask && item.status !== 'Completed' && (
                                            <button
                                                type="button"
                                                onClick={() => { moveTask(item.id, 1); }}
                                                title="Move to next column"
                                                aria-label="Move to next column"
                                                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: 'var(--accent-blue)', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '3px' }}
                                            >
                                                <ArrowRight size={13} />
                                            </button>
                                        )}
                                            {canUpdateTask && (() => {
                                            const columnTasks = tasks.filter((t) => t.status === item.status);
                                            const itemIndex = columnTasks.findIndex((t) => t.id === item.id);
                                            const isFirst = itemIndex === 0;
                                            const isLast = itemIndex === columnTasks.length - 1;
                                            return (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => moveTaskWithinColumn(item.id, 'up')}
                                                        disabled={isFirst}
                                                        title={isFirst ? 'Already at top' : 'Move up in column'}
                                                        aria-label={isFirst ? 'Already at top' : 'Move up in column'}
                                                        style={{
                                                            background: isFirst ? 'rgba(107,114,128,0.08)' : 'rgba(168,85,247,0.1)',
                                                            border: isFirst ? '1px solid rgba(107,114,128,0.2)' : '1px solid rgba(168,85,247,0.3)',
                                                            color: isFirst ? 'var(--text-secondary)' : '#a855f7',
                                                            width: '28px',
                                                            height: '28px',
                                                            cursor: isFirst ? 'not-allowed' : 'pointer',
                                                            borderRadius: '3px',
                                                            opacity: isFirst ? 0.5 : 1,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <ArrowUp size={13} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => moveTaskWithinColumn(item.id, 'down')}
                                                        disabled={isLast}
                                                        title={isLast ? 'Already at bottom' : 'Move down in column'}
                                                        aria-label={isLast ? 'Already at bottom' : 'Move down in column'}
                                                        style={{
                                                            background: isLast ? 'rgba(107,114,128,0.08)' : 'rgba(168,85,247,0.1)',
                                                            border: isLast ? '1px solid rgba(107,114,128,0.2)' : '1px solid rgba(168,85,247,0.3)',
                                                            color: isLast ? 'var(--text-secondary)' : '#a855f7',
                                                            width: '28px',
                                                            height: '28px',
                                                            cursor: isLast ? 'not-allowed' : 'pointer',
                                                            borderRadius: '3px',
                                                            opacity: isLast ? 0.5 : 1,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <ArrowDown size={13} />
                                                    </button>
                                                </>
                                            );
                                        })()}
                                            {canDeleteTask && (
                                                <button
                                                    type="button"
                                                    onClick={() => { deleteTask(item.id); }}
                                                    title="Delete task"
                                                    aria-label="Delete task"
                                                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '3px', marginLeft: 'auto' }}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                    </div>
                                </div>
                            ))}
                            {column.items.length === 0 && (
                                <div
                                    style={{
                                        padding: '24px 14px',
                                        border: '2px dashed var(--border)',
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.85rem',
                                        textAlign: 'center',
                                        borderRadius: '6px',
                                        background: 'rgba(255,255,255,0.01)',
                                    }}
                                >
                                    📭 Drop tasks here
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
            {isLoading && <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>Loading tasks...</p>}
        </div>
    );
};

export default SponsorsTable;
