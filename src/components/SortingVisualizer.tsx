import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, RotateCcw, Shuffle } from "lucide-react";
import { toast } from "sonner";

type Algorithm = "bubble" | "merge" | "quick" | "insertion";

export const SortingVisualizer = () => {
  const [array, setArray] = useState<number[]>([]);
  const [algorithm, setAlgorithm] = useState<Algorithm>("bubble");
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState([50]);
  const [comparing, setComparing] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLog((prev) => [...prev, message]);
  };

  const generateArray = () => {
    const newArray = Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 10);
    setArray(newArray);
    setComparing([]);
    setSorted([]);
    setLog([]);
    addLog("🎲 Generated new random array");
  };

  useEffect(() => {
    generateArray();
  }, []);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const bubbleSort = async () => {
    const arr = [...array];
    const n = arr.length;
    addLog("🫧 Starting Bubble Sort...");

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (!isRunning) return;
        
        setComparing([j, j + 1]);
        addLog(`Comparing ${arr[j]} and ${arr[j + 1]}`);
        await sleep(101 - speed[0]);

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
          addLog(`✓ Swapped ${arr[j + 1]} and ${arr[j]}`);
        }
      }
      setSorted((prev) => [...prev, n - 1 - i]);
    }
    
    setSorted(arr.map((_, i) => i));
    setComparing([]);
    addLog("✅ Sorting complete!");
    setIsRunning(false);
  };

  const insertionSort = async () => {
    const arr = [...array];
    addLog("📌 Starting Insertion Sort...");

    for (let i = 1; i < arr.length; i++) {
      const key = arr[i];
      let j = i - 1;

      setComparing([i]);
      addLog(`Inserting ${key} into sorted portion`);
      await sleep(101 - speed[0]);

      while (j >= 0 && arr[j] > key) {
        if (!isRunning) return;
        
        setComparing([j, j + 1]);
        arr[j + 1] = arr[j];
        setArray([...arr]);
        await sleep(101 - speed[0]);
        j--;
      }

      arr[j + 1] = key;
      setArray([...arr]);
      setSorted((prev) => [...prev, i]);
    }

    setSorted(arr.map((_, i) => i));
    setComparing([]);
    addLog("✅ Sorting complete!");
    setIsRunning(false);
  };

  const quickSort = async (arr: number[], low: number, high: number, depth = 0): Promise<number[]> => {
    if (low < high) {
      const pi = await partition(arr, low, high, depth);
      await quickSort(arr, low, pi - 1, depth + 1);
      await quickSort(arr, pi + 1, high, depth + 1);
    }
    return arr;
  };

  const partition = async (arr: number[], low: number, high: number, depth: number): Promise<number> => {
    const pivot = arr[high];
    addLog(`Pivot: ${pivot} (depth ${depth})`);
    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (!isRunning) return i + 1;
      
      setComparing([j, high]);
      await sleep(101 - speed[0]);

      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        setArray([...arr]);
        addLog(`Swapped ${arr[j]} and ${arr[i]}`);
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    setArray([...arr]);
    setSorted((prev) => [...prev, i + 1]);
    return i + 1;
  };

  const startQuickSort = async () => {
    const arr = [...array];
    addLog("⚡ Starting Quick Sort...");
    await quickSort(arr, 0, arr.length - 1);
    setSorted(arr.map((_, i) => i));
    setComparing([]);
    addLog("✅ Sorting complete!");
    setIsRunning(false);
  };

  const handleStart = async () => {
    if (isRunning) {
      setIsRunning(false);
      toast.info("Sorting paused");
      return;
    }

    setIsRunning(true);
    setSorted([]);
    setComparing([]);

    switch (algorithm) {
      case "bubble":
        await bubbleSort();
        break;
      case "insertion":
        await insertionSort();
        break;
      case "quick":
        await startQuickSort();
        break;
      default:
        toast.error("Algorithm not implemented yet");
        setIsRunning(false);
    }
  };

  const maxValue = Math.max(...array, 100);

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sorting Visualization</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={generateArray} disabled={isRunning}>
                <Shuffle className="h-4 w-4" />
                Shuffle
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setIsRunning(false); generateArray(); }}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-end justify-center gap-1 bg-muted/20 rounded-lg p-4">
            {array.map((value, idx) => (
              <div
                key={idx}
                className="flex-1 transition-all duration-200 rounded-t flex items-end justify-center"
                style={{
                  height: `${(value / maxValue) * 100}%`,
                  backgroundColor: sorted.includes(idx)
                    ? "hsl(var(--success))"
                    : comparing.includes(idx)
                    ? "hsl(var(--accent))"
                    : "hsl(var(--primary))",
                  minWidth: "8px",
                }}
              >
                <span className="text-xs text-primary-foreground font-semibold mb-1">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Algorithm</label>
              <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as Algorithm)} disabled={isRunning}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bubble">Bubble Sort</SelectItem>
                  <SelectItem value="insertion">Insertion Sort</SelectItem>
                  <SelectItem value="quick">Quick Sort</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Speed</label>
              <Slider
                value={speed}
                onValueChange={setSpeed}
                min={10}
                max={100}
                step={10}
                className="w-full"
              />
            </div>
          </div>

          <Button variant="hero" className="w-full" onClick={handleStart}>
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunning ? "Pause" : "Start Sorting"}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Operation Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 max-h-[200px] overflow-y-auto font-mono text-xs space-y-1">
            {log.length === 0 ? (
              <p className="text-muted-foreground">Start sorting to see operations...</p>
            ) : (
              log.slice(-10).map((entry, index) => (
                <div key={index} className="text-foreground/80">
                  {entry}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
