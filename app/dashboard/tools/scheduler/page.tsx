"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Save, Trash2, CalendarClock, GripVertical, Download } from "lucide-react";
import { getTasks, saveTask, deleteTask } from "@/app/lib/actions/schedulerActions";

type Task = {
  id: string;
  project_id: string;
  name: string;
  start_date: string;
  end_date: string;
  progress: number;
  assigned_to: string;
  sort_order: number;
};

// Helper: Get weeks for Gantt Chart between two dates
const generateWeeksBetween = (startDateStr: string, endDateStr: string) => {
  if (!startDateStr || !endDateStr) return [];
  const s = new Date(startDateStr);
  const e = new Date(endDateStr);
  if (s > e) return [];

  const weeks = [];
  const current = new Date(s); // Start exactly on the project start date

  let i = 0;
  while (current <= e || weeks.length === 0) {
    const weekStart = new Date(current);
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    weeks.push({
      id: `w-${i+1}`,
      label: `Week ${i + 1}`,
      start: weekStart,
      end: weekEnd,
      displayDate: `${weekStart.getDate()}/${weekStart.getMonth()+1} - ${weekEnd.getDate()}/${weekEnd.getMonth()+1}`
    });
    current.setDate(current.getDate() + 7);
    i++;
    if (i > 52) break; // max 1 year for safety
  }
  return weeks;
};

const calculateDuration = (start: string, end: string) => {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  const diffTime = e.getTime() - s.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
};

export default function SchedulerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Interactions State
  const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);
  const [activeCell, setActiveCell] = useState<{ row: number, field: keyof Task } | null>(null);
  const [draggingFill, setDraggingFill] = useState(false);
  const [fillSourceValue, setFillSourceValue] = useState<any>(null);
  const [draggingBar, setDraggingBar] = useState<{ idx: number, startX: number, originalStart: string, originalEnd: string } | null>(null);
  const [draggingEdge, setDraggingEdge] = useState<{ idx: number, edge: 'left' | 'right', startX: number, originalStart: string, originalEnd: string } | null>(null);

  const ganttContainerRef = useRef<HTMLDivElement>(null);

  // Project Dates State
  const defaultStart = new Date();
  defaultStart.setDate(1);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setMonth(defaultEnd.getMonth() + 2);
  
  const [projectStart, setProjectStart] = useState(defaultStart.toISOString().split('T')[0]);
  const [projectEnd, setProjectEnd] = useState(defaultEnd.toISOString().split('T')[0]);

  const weeks = generateWeeksBetween(projectStart, projectEnd);
  const ganttTotalDays = Math.max(1, weeks.length * 7);
  const ganttStartMs = weeks.length > 0 ? weeks[0].start.getTime() : new Date().getTime();
  
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const res = await getTasks("default-project");
    if (res.success && res.data) {
      const formatted = res.data.map((t: any) => ({
        ...t,
        start_date: t.start_date ? new Date(t.start_date).toISOString().split('T')[0] : "",
        end_date: t.end_date ? new Date(t.end_date).toISOString().split('T')[0] : "",
      }));
      setTasks(formatted.length > 0 ? formatted : generateDummyTasks());
    } else {
      setTasks(generateDummyTasks());
    }
    setLoading(false);
  };

  const generateDummyTasks = (): Task[] => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return [
      {
        id: `task-${Date.now()}`,
        project_id: "default-project",
        name: "Requirement Gathering",
        start_date: today.toISOString().split('T')[0],
        end_date: nextWeek.toISOString().split('T')[0],
        progress: 80,
        assigned_to: "John Doe",
        sort_order: 1
      }
    ];
  };


  // --- Helper Functions for Working Days ---
  const getWorkingDaysDiff = (startMs: number, endMs: number) => {
    let count = 0;
    let cur = new Date(startMs);
    const end = new Date(endMs);
    cur.setUTCHours(0,0,0,0);
    end.setUTCHours(0,0,0,0);
    
    if (cur <= end) {
      while (cur < end) {
        const day = cur.getUTCDay();
        if (day !== 0 && day !== 6) count++;
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
    } else {
      while (cur > end) {
        cur.setUTCDate(cur.getUTCDate() - 1);
        const day = cur.getUTCDay();
        if (day !== 0 && day !== 6) count--;
      }
    }
    return count;
  };

  const countWorkingDaysInclusive = (startMs: number, endMs: number) => {
    let count = 0;
    let cur = new Date(startMs);
    const end = new Date(endMs);
    cur.setUTCHours(0,0,0,0);
    end.setUTCHours(0,0,0,0);
    
    if (cur > end) return 0;
    
    while (cur <= end) {
      const day = cur.getUTCDay();
      if (day !== 0 && day !== 6) count++;
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return count;
  };

  const addWorkingDays = (dateStr: string, days: number) => {
    const d = new Date(dateStr);
    let remaining = Math.abs(days);
    const step = days >= 0 ? 1 : -1;
    
    while (remaining > 0) {
      d.setUTCDate(d.getUTCDate() + step);
      const day = d.getUTCDay();
      if (day !== 0 && day !== 6) remaining--;
    }
    return d.toISOString().split('T')[0];
  };

  // Window events for drag stop and dragging Gantt bars
  useEffect(() => {
    const handleMouseUp = () => {
      setDraggingFill(false);
      setDraggingBar(null);
      setDraggingEdge(null);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if ((draggingBar || draggingEdge) && ganttContainerRef.current) {
        const pixelsPerDay = 40; // 200px per week / 5 days = 40px per day

        setTasks(prev => {
          const updated = [...prev];
          
          if (draggingBar) {
            const deltaWorkingDays = Math.round((e.clientX - draggingBar.startX) / pixelsPerDay);
            const task = { ...updated[draggingBar.idx] };
            
            task.start_date = addWorkingDays(draggingBar.originalStart, deltaWorkingDays);
            task.end_date = addWorkingDays(draggingBar.originalEnd, deltaWorkingDays);
            updated[draggingBar.idx] = task;
          } else if (draggingEdge) {
            const deltaWorkingDays = Math.round((e.clientX - draggingEdge.startX) / pixelsPerDay);
            const task = { ...updated[draggingEdge.idx] };
            
            if (draggingEdge.edge === 'left') {
              const newStart = addWorkingDays(draggingEdge.originalStart, deltaWorkingDays);
              if (new Date(newStart) <= new Date(task.end_date)) {
                task.start_date = newStart;
              }
            } else {
              const newEnd = addWorkingDays(draggingEdge.originalEnd, deltaWorkingDays);
              if (new Date(newEnd) >= new Date(task.start_date)) {
                task.end_date = newEnd;
              }
            }
            updated[draggingEdge.idx] = task;
          }
          
          return updated;
        });
      }
    };

    window.addEventListener("mouseup", handleMouseUp);
    if (draggingBar || draggingEdge) window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [draggingBar, draggingEdge, ganttTotalDays]);

  const handleTaskChange = (index: number, field: keyof Task, value: any) => {
    setTasks(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      project_id: "default-project",
      name: "New Task",
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      progress: 0,
      assigned_to: "",
      sort_order: tasks.length + 1
    };
    setTasks([...tasks, newTask]);
  };

  const removeTask = async (id: string) => {
    if (id.startsWith("task-")) {
       setTasks(tasks.filter(t => t.id !== id));
    } else {
       await deleteTask(id);
       setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // Update sort orders
    const finalTasks = tasks.map((t, i) => ({ ...t, sort_order: i + 1 }));
    setTasks(finalTasks);
    
    for (const task of finalTasks) {
      await saveTask(task);
    }
    setSaving(false);
    alert("Jadwal berhasil disimpan!");
  };

  // --- HTML5 Drag & Drop for Rows ---
  const onDragStartRow = (e: React.DragEvent, index: number) => {
    setDraggedRowIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOverRow = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedRowIndex === null || draggedRowIndex === index) return;
    
    // Swap on hover for smooth interaction
    setTasks(prev => {
      const updated = [...prev];
      const draggedItem = updated[draggedRowIndex];
      updated.splice(draggedRowIndex, 1);
      updated.splice(index, 0, draggedItem);
      return updated;
    });
    setDraggedRowIndex(index);
  };

  const onDropRow = () => {
    setDraggedRowIndex(null);
  };

  // --- Fill Handle Events ---
  const handleCellClick = (row: number, field: keyof Task) => {
    setActiveCell({ row, field });
  };

  const handleFillStart = (e: React.MouseEvent, value: any) => {
    e.stopPropagation();
    setDraggingFill(true);
    setFillSourceValue(value);
  };

  const handleCellEnter = (row: number, field: keyof Task) => {
    if (draggingFill && activeCell && activeCell.field === field) {
      // Copy to this cell
      handleTaskChange(row, field, fillSourceValue);
    }
  };

  const getBarStyle = (start: string, end: string) => {
    if (!start || !end) return { display: 'none' };
    const sDate = new Date(start);
    const eDate = new Date(end);
    
    const startOffsetDays = getWorkingDaysDiff(ganttStartMs, sDate.getTime());
    const durationDays = countWorkingDaysInclusive(sDate.getTime(), eDate.getTime());
    
    const dayWidth = 40; // 40px per working day (200px / 5)
    
    return {
      left: `${Math.max(0, startOffsetDays) * dayWidth}px`,
      width: `${Math.max(0, durationDays) * dayWidth}px`,
    };
  };

  const handlePrint = () => {
    window.print();
  };

  // Render a cell with Fill Handle logic
  const renderCell = (idx: number, field: keyof Task, children: React.ReactNode, value: any) => {
    const isActive = activeCell?.row === idx && activeCell?.field === field;
    return (
      <div 
        className={`relative h-full flex items-center border border-transparent transition-all ${isActive ? 'ring-1 ring-indigo-500 bg-indigo-50/50' : 'hover:border-slate-300'} rounded`}
        onClick={() => handleCellClick(idx, field)}
        onMouseEnter={() => handleCellEnter(idx, field)}
      >
        {children}
        
        {/* Fill Handle Square */}
        {isActive && (
          <div 
            className="absolute -bottom-1 -right-1 w-2 h-2 bg-indigo-600 border border-white cursor-crosshair z-20"
            onMouseDown={(e) => handleFillStart(e, value)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen  bg-slate-100 print:bg-white font-sans p-6 print:p-0 overflow-hidden print:overflow-visible select-none [print-color-adjust:exact]">
      <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 shrink-0 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Project Scheduler & Gantt</h1>
            <p className="text-xs text-slate-500">Advanced Interactive Spreadsheet & Timeline</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} disabled className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white border border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-900 shadow-sm transition print:hidden">
            <Download className="w-4 h-4" /> Save to PDF
          </button>
          <button onClick={addTask} className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 print:hidden">
            <Plus className="w-4 h-4" /> Add Task
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 shadow-sm print:hidden">
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>
      
      {/* Project Configuration Bar */}
      <div className="flex items-center gap-4 mb-4 bg-white p-3 rounded-xl shadow-sm border border-slate-200 shrink-0 print:hidden">
        <span className="text-sm font-semibold text-slate-700">Project Timeline:</span>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Start Date</label>
          <input 
            type="date" 
            value={projectStart} 
            onChange={(e) => setProjectStart(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500"
          />
        </div>
        <span className="text-slate-400">-</span>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">End Date</label>
          <input 
            type="date" 
            value={projectEnd} 
            onChange={(e) => setProjectEnd(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div id="printable-gantt" className="flex flex-1 overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200">
        
        {/* LEFT PANEL */}
        <div className="w-[30%] flex flex-col border-r border-slate-200 bg-white z-10 shrink-0 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
  
          <div className="grid grid-cols-[40px_1fr_40px] gap-1 p-[16px] bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider sticky top-0 shrink-0">
            <div className="text-center">#</div>
            <div>Task Name</div>
            <div></div>
          </div>
          
          <div className="flex-1 overflow-y-auto pb-20">
            {loading ? (
              <div className="flex justify-center p-8 text-slate-400">Loading tasks...</div>
            ) : tasks.map((task, idx) => (
              <div 
                key={task.id} 
                draggable
                onDragStart={(e) => onDragStartRow(e, idx)}
                onDragOver={(e) => onDragOverRow(e, idx)}
                onDrop={onDropRow}
                className={`grid grid-cols-[40px_1fr_40px] gap-1 px-1 h-[42px] border-b border-slate-100 items-center text-sm group ${draggedRowIndex === idx ? 'bg-indigo-50 opacity-50' : 'hover:bg-slate-50/50'}`}
              >
                <div className="flex items-center justify-center gap-1 text-slate-400 text-xs cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                  {idx + 1}
                </div>
                
                {renderCell(idx, 'name', 
                  <input 
                    type="text" value={task.name} onChange={(e) => handleTaskChange(idx, 'name', e.target.value)}
                    className="bg-transparent w-full outline-none px-1 py-1" placeholder="Task name..."
                  />, 
                  task.name
                )}
                
                <button onClick={() => removeTask(task.id)} className="p-1.5 justify-self-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {!loading && (
              <div onClick={addTask} className="p-3 text-sm text-indigo-600 hover:bg-indigo-50 cursor-pointer flex items-center gap-2 transition print:hidden">
                <Plus className="w-4 h-4" /> <span>Add new task</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Gantt */}
        <div className="w-[70%] flex flex-col bg-slate-50 relative overflow-x-auto overflow-y-hidden custom-scrollbar">
          {/* Header Minggu */}
          <div className="flex border-b border-slate-300 bg-white sticky top-0 z-20 shrink-0 w-max min-w-full">
            {weeks.map(week => (
              <div key={week.id} className="w-[200px] shrink-0 border-r border-slate-300 flex flex-col items-center justify-center p-2">
                <span className="text-xs font-bold text-slate-700">{week.label}</span>
                <span className="text-[10px] text-slate-500">{week.displayDate}</span>
              </div>
            ))}
          </div>

          <div ref={ganttContainerRef} className="flex-1 overflow-y-auto relative w-max min-w-full pb-20">
            {/* Background Grid - Garis Border Per Cell (Hari) */}
            <div className="absolute top-0 left-0 flex w-full h-full pointer-events-none z-0">
              {weeks.map((week, i) => (
                <div key={i} className="w-[200px] shrink-0 h-full border-r-2 border-slate-300 flex">
                  {Array.from({ length: 5 }).map((_, d) => (
                    <div 
                      key={d} 
                      className="flex-1 border-r border-slate-300/80 h-full bg-white/40"
                    ></div>
                  ))}
                </div>
              ))}
            </div>

            {/* Gantt Bars Layer */}
            <div className="relative z-10 w-max min-w-full">
              {/* Dummy row to force container width to exactly match header width */}
              <div className="h-0 flex pointer-events-none">
                {weeks.map(w => <div key={w.id} className="w-[200px] shrink-0"></div>)}
              </div>
              
              {tasks.map((task, idx) => {
                const style = getBarStyle(task.start_date, task.end_date);
                
                return (
                  <div key={task.id} className="h-[42px] flex items-center px-2 relative group w-full min-w-full pointer-events-none border-b border-slate-100">
                    {task.start_date && task.end_date && style.width !== '0%' && (
                      <div 
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setDraggingBar({ idx, startX: e.clientX, originalStart: task.start_date, originalEnd: task.end_date });
                        }}
                        className={`absolute h-7 rounded-md shadow flex items-center overflow-visible transition-all hover:ring-2 hover:ring-offset-1 hover:z-20 cursor-move pointer-events-auto bg-indigo-500 hover:ring-indigo-400 ${
                          draggingBar?.idx === idx ? 'ring-2 ring-indigo-400 z-30 scale-[1.02]' : ''
                        }`}
                        style={{ left: style.left, width: style.width }}
                      >
                        {/* Left Resize Handle */}
                        <div 
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setDraggingEdge({ idx, edge: 'left', startX: e.clientX, originalStart: task.start_date, originalEnd: task.end_date });
                          }}
                          className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-black/20 z-30 rounded-l-md" 
                        />
                        
                        {/* Right Resize Handle */}
                        <div 
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setDraggingEdge({ idx, edge: 'right', startX: e.clientX, originalStart: task.start_date, originalEnd: task.end_date });
                          }}
                          className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-black/20 z-30 rounded-r-md" 
                        />

                        <span className="relative z-10 text-[10px] text-white font-medium px-2 truncate pointer-events-none">
                          {calculateDuration(task.start_date, task.end_date)} Hari
                        </span>

                        <div className="hidden group-hover:flex absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-2 rounded shadow-xl whitespace-nowrap z-50 flex-col gap-1 pointer-events-none">
                          <span className="font-bold">{task.name}</span>
                          <span className="text-slate-300">{task.start_date} to {task.end_date}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="h-[45px]"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
