import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, RotateCcw, Plus } from "lucide-react";
import { toast } from "sonner";

interface Process {
  id: number;
  name: string;
  burstTime: number;
  arrivalTime: number;
  remainingTime: number;
  color: string;
  waitingTime?: number;
  turnaroundTime?: number;
}

const defaultProcesses: Process[] = [
  { id: 1, name: "P1", burstTime: 6, arrivalTime: 0, remainingTime: 6, color: "hsl(var(--primary))" },
  { id: 2, name: "P2", burstTime: 4, arrivalTime: 1, remainingTime: 4, color: "hsl(var(--secondary))" },
  { id: 3, name: "P3", burstTime: 5, arrivalTime: 2, remainingTime: 5, color: "hsl(var(--accent))" },
  { id: 4, name: "P4", burstTime: 3, arrivalTime: 3, remainingTime: 3, color: "hsl(var(--success))" },
];

type Algorithm = "fcfs" | "sjf" | "rr";

type TimelineEntry = { process: string; time: number; color: string };

export interface CPUSchedulingState {
  processes: Process[];
  timeline: TimelineEntry[];
  algorithm: Algorithm;
  currentTime: number;
  isRunning: boolean;
  // computed metrics
  avgWaitingTime: number | null;
  avgTurnaroundTime: number | null;
  throughput: number | null; // processes per unit time
  cpuUtilization: number | null; // 0..1
  totalTime: number;
  // helpers to obtain serializable DOM info on demand (do NOT include DOM nodes directly)
  getTimelineRect?: () => { x: number; y: number; width: number; height: number; top: number; left: number; right: number; bottom: number } | null;
  getTimelineHTML?: () => string | null;
  // control helpers
  startScheduling: () => Promise<void>;
  reset: () => void;
}

export const CPUSchedulingVisualizer = forwardRef<CPUSchedulingState>((props, ref) => {
  const [processes, setProcesses] = useState<Process[]>(defaultProcesses);
  const [algorithm, setAlgorithm] = useState<Algorithm>("fcfs");
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const addLog = (message: string) => {
    setLog((prev) => [...prev, message]);
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const fcfsScheduling = async () => {
    addLog("📋 Starting FCFS (First Come First Serve) Scheduling");
    const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    let time = 0;
    const newTimeline: TimelineEntry[] = [];

    for (const process of sorted) {
      if (time < process.arrivalTime) {
        time = process.arrivalTime;
      }

      addLog(`⚙️ Executing ${process.name} (Burst: ${process.burstTime})`);
      
      for (let i = 0; i < process.burstTime; i++) {
        newTimeline.push({ process: process.name, time: time++, color: process.color });
        setTimeline([...newTimeline]);
        setCurrentTime(time);
        await sleep(500);
      }

      addLog(`✅ ${process.name} completed at time ${time}`);
    }

    calculateMetrics(sorted, newTimeline);
  };

  const sjfScheduling = async () => {
    addLog("📊 Starting SJF (Shortest Job First) Scheduling");
    let time = 0;
    const remaining = [...processes];
    const newTimeline: TimelineEntry[] = [];

    while (remaining.length > 0) {
      const available = remaining.filter((p) => p.arrivalTime <= time);
      
      if (available.length === 0) {
        time++;
        continue;
      }

      available.sort((a, b) => a.burstTime - b.burstTime);
      const process = available[0];

      addLog(`⚙️ Executing ${process.name} (Burst: ${process.burstTime})`);
      
      for (let i = 0; i < process.burstTime; i++) {
        newTimeline.push({ process: process.name, time: time++, color: process.color });
        setTimeline([...newTimeline]);
        setCurrentTime(time);
        await sleep(500);
      }

      addLog(`✅ ${process.name} completed at time ${time}`);
      remaining.splice(remaining.indexOf(process), 1);
    }

    calculateMetrics(processes, newTimeline);
  };

  const roundRobinScheduling = async () => {
    addLog("🔄 Starting Round Robin Scheduling (Quantum: 2)");
    const quantum = 2;
    let time = 0;
    const queue = [...processes].map((p) => ({ ...p, remainingTime: p.burstTime }));
    const newTimeline: TimelineEntry[] = [];

    while (queue.some((p) => p.remainingTime > 0)) {
      for (const process of queue) {
        if (process.remainingTime > 0 && process.arrivalTime <= time) {
          const executeTime = Math.min(quantum, process.remainingTime);
          
          addLog(`⚙️ Executing ${process.name} for ${executeTime} units`);
          
          for (let i = 0; i < executeTime; i++) {
            newTimeline.push({ process: process.name, time: time++, color: process.color });
            setTimeline([...newTimeline]);
            setCurrentTime(time);
            await sleep(500);
          }

          process.remainingTime -= executeTime;
          
          if (process.remainingTime === 0) {
            addLog(`✅ ${process.name} completed at time ${time}`);
          } else {
            addLog(`⏸️ ${process.name} paused (${process.remainingTime} units remaining)`);
          }
        }
      }
    }

    calculateMetrics(processes, newTimeline);
  };

  const calculateMetrics = (procs: Process[], timeline: TimelineEntry[]) => {
    addLog("\n📊 Performance Metrics:");
    
    procs.forEach((process) => {
      const completionTime = timeline.filter((t) => t.process === process.name).length + process.arrivalTime;
      const turnaroundTime = completionTime - process.arrivalTime;
      const waitingTime = turnaroundTime - process.burstTime;
      
      addLog(`${process.name}: Waiting Time = ${waitingTime}, Turnaround Time = ${turnaroundTime}`);
    });
  };

  const startScheduling = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setTimeline([]);
    setCurrentTime(0);
    setLog([]);

    try {
      switch (algorithm) {
        case "fcfs":
          await fcfsScheduling();
          break;
        case "sjf":
          await sjfScheduling();
          break;
        case "rr":
          await roundRobinScheduling();
          break;
      }
      toast.success("Scheduling completed!");
    } catch (error) {
      toast.error("Error during scheduling");
    }

    setIsRunning(false);
  };

  const reset = () => {
    setProcesses(defaultProcesses);
    setTimeline([]);
    setCurrentTime(0);
    setLog([]);
    setIsRunning(false);
  };

  // compute lightweight metrics from `processes` and `timeline`
  const computeMetricsForExport = () => {
    if (timeline.length === 0) {
      return {
        avgWaitingTime: null,
        avgTurnaroundTime: null,
        throughput: null,
        cpuUtilization: null,
        totalTime: 0,
      };
    }

    // total time equals currentTime (end time)
    const totalTime = currentTime;

    // compute waiting/turnaround for each process based on timeline counts
    const stats = processes.map((p) => {
      const executedCount = timeline.filter((t) => t.process === p.name).length;
      const completionTime = Math.max(...timeline.filter((t) => t.process === p.name).map(t => t.time), p.arrivalTime) + 1;
      const turnaround = completionTime - p.arrivalTime;
      const waiting = turnaround - p.burstTime;
      return { waiting, turnaround };
    });

    const avgWaitingTime = stats.reduce((s, x) => s + x.waiting, 0) / stats.length;
    const avgTurnaroundTime = stats.reduce((s, x) => s + x.turnaround, 0) / stats.length;
    const throughput = totalTime > 0 ? processes.length / totalTime : null;
    // CPU busy time equals timeline length (each unit represents CPU busy)
    const cpuUtilization = totalTime > 0 ? (timeline.length / totalTime) : null;

    return { avgWaitingTime, avgTurnaroundTime, throughput, cpuUtilization, totalTime };
  };

  // helper that returns a plain serializable rect object (or null)
  const getTimelineRect = () => {
    const el = timelineRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height,
      top: r.top,
      left: r.left,
      right: r.right,
      bottom: r.bottom,
    };
  };

  // helper that returns serializable HTML snapshot (string) or null
  const getTimelineHTML = () => {
    const el = timelineRef.current;
    if (!el) return null;
    return el.innerHTML;
  };

  // expose state and control methods via ref — note we return helpers (functions) instead of DOM nodes
  useImperativeHandle(ref, () => {
    const metrics = computeMetricsForExport();
    return {
      processes,
      timeline,
      algorithm,
      currentTime,
      isRunning,
      avgWaitingTime: metrics.avgWaitingTime,
      avgTurnaroundTime: metrics.avgTurnaroundTime,
      throughput: metrics.throughput,
      cpuUtilization: metrics.cpuUtilization,
      totalTime: metrics.totalTime,
      // expose only helpers that produce serializable outputs on demand
      getTimelineRect,
      getTimelineHTML,
      startScheduling,
      reset,
    } as CPUSchedulingState;
  }, [processes, timeline, algorithm, currentTime, isRunning]);

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>CPU Scheduling Gantt Chart</span>
            <Button variant="outline" size="sm" onClick={reset} disabled={isRunning}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Timeline */}
            <div className="bg-muted/20 rounded-lg p-4 min-h-[150px]">
              {/* NEW: scrollable wrapper so the timeline can grow horizontally and be panned */}
              <div className="overflow-x-auto" ref={timelineRef}>
                {/* inner flex container forced to width = timeline.length * segmentWidth */}
                <div
                  className="flex items-center gap-1 mb-2"
                  style={{ width: `${Math.max(timeline.length * 40, 0)}px` }}
                >
                  {timeline.map((item, idx) => (
                    <div
                      key={idx}
                      // make each segment fixed width and not grow/shrink
                      className="h-16 flex-none flex items-center justify-center font-semibold text-sm text-primary-foreground rounded transition-all"
                      style={{ backgroundColor: item.color, minWidth: "40px", maxWidth: "40px" }}
                    >
                      {idx === 0 || timeline[idx - 1].process !== item.process ? item.process : ""}
                    </div>
                  ))}
                </div>

                {/* Time markers - align with segments and scroll together */}
                {timeline.length > 0 && (
                  <div
                    className="flex items-center gap-1"
                    style={{ width: `${Math.max(timeline.length * 40, 0)}px` }}
                  >
                    {timeline.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex-none text-xs text-center text-muted-foreground"
                        style={{ minWidth: "40px", maxWidth: "40px" }}
                      >
                        {idx === 0 || timeline[idx - 1].process !== item.process ? item.time : ""}
                      </div>
                    ))}
                    {/* final current time marker sits after segments */}
                    <div className="text-xs text-muted-foreground" style={{ minWidth: "40px" }}>
                      {currentTime}
                    </div>
                  </div>
                )}

                {timeline.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Select an algorithm and click Start to begin scheduling
                  </p>
                )}
              </div>
            </div>

            {/* Process Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Process</th>
                    <th className="text-left p-2">Arrival Time</th>
                    <th className="text-left p-2">Burst Time</th>
                    <th className="text-left p-2">Color</th>
                  </tr>
                </thead>
                <tbody>
                  {processes.map((process) => (
                    <tr key={process.id} className="border-b">
                      <td className="p-2 font-semibold">{process.name}</td>
                      <td className="p-2">{process.arrivalTime}</td>
                      <td className="p-2">{process.burstTime}</td>
                      <td className="p-2">
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: process.color }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Scheduling Algorithm</label>
            <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as Algorithm)} disabled={isRunning}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fcfs">First Come First Serve (FCFS)</SelectItem>
                <SelectItem value="sjf">Shortest Job First (SJF)</SelectItem>
                <SelectItem value="rr">Round Robin (RR)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="hero" className="w-full" onClick={startScheduling} disabled={isRunning}>
            <Play className="h-4 w-4" />
            {isRunning ? "Scheduling..." : "Start Scheduling"}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Scheduling Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 max-h-[250px] overflow-y-auto font-mono text-xs space-y-1">
            {log.length === 0 ? (
              <p className="text-muted-foreground">Start scheduling to see execution details...</p>
            ) : (
              log.map((entry, index) => (
                <div key={index} className="text-foreground/80">
                  {entry}
                </div>
              )))
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
