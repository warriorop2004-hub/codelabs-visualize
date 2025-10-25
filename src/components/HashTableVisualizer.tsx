import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Search, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface HashEntry {
  key: string;
  value: string;
  index: number;
}

export interface HashTableState {
  table: (HashEntry | null)[];
  loadFactor: number;
  operationsCount: {
    insertions: number;
    deletions: number;
    searches: number;
    collisions: number;
  };
  hashFunction: (key: string) => number;
}

export const HashTableVisualizer = forwardRef<HashTableState>((props, ref) => {
  const [tableSize] = useState(10);
  const [hashTable, setHashTable] = useState<(HashEntry | null)[]>(Array(10).fill(null));
  const [inputKey, setInputKey] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [operationsCount, setOperationsCount] = useState({
    insertions: 0,
    deletions: 0,
    searches: 0,
    collisions: 0,
  });

  const addLog = (message: string) => {
    setLog((prev) => [...prev, message]);
  };

  const hashFunction = (key: string): number => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash + key.charCodeAt(i) * (i + 1)) % tableSize;
    }
    addLog(`Hash("${key}") = ${hash}`);
    return hash;
  };

  useImperativeHandle(ref, () => ({
    table: hashTable,
    loadFactor,
    operationsCount,
    hashFunction,
  }));

  const handleInsert = () => {
    if (!inputKey.trim() || !inputValue.trim()) {
      toast.error("Please enter both key and value");
      return;
    }

    const hash = hashFunction(inputKey);
    let index = hash;
    let probeCount = 0;

    // Linear probing
    while (hashTable[index] !== null && hashTable[index]?.key !== inputKey) {
      probeCount++;
      addLog(`⚠️ Collision at index ${index}, probing...`);
      index = (index + 1) % tableSize;
      
      if (probeCount >= tableSize) {
        toast.error("Hash table is full!");
        addLog("❌ Table is full, cannot insert");
        return;
      }
    }

    const newTable = [...hashTable];
    newTable[index] = { key: inputKey, value: inputValue, index };
    setHashTable(newTable);
    
    setHighlightedIndex(index);
    setTimeout(() => setHighlightedIndex(null), 2000);

    if (probeCount > 0) {
      setOperationsCount(prev => ({
        ...prev,
        collisions: prev.collisions + 1,
      }));
    }
    setOperationsCount(prev => ({
      ...prev,
      insertions: prev.insertions + 1,
    }));

    addLog(`✅ Inserted "${inputKey}": "${inputValue}" at index ${index}`);
    toast.success(`Inserted at index ${index}`);
    
    setInputKey("");
    setInputValue("");
  };

  const handleSearch = () => {
    if (!searchKey.trim()) {
      toast.error("Please enter a key to search");
      return;
    }

    const hash = hashFunction(searchKey);
    let index = hash;
    let probeCount = 0;

    while (hashTable[index] !== null) {
      if (hashTable[index]?.key === searchKey) {
        setHighlightedIndex(index);
        setTimeout(() => setHighlightedIndex(null), 3000);
        addLog(`✅ Found "${searchKey}" at index ${index}`);
        toast.success(`Found at index ${index}!`);
        setOperationsCount(prev => ({
          ...prev,
          searches: prev.searches + 1,
        }));
        return;
      }

      probeCount++;
      addLog(`Checking index ${index}...`);
      index = (index + 1) % tableSize;

      if (probeCount >= tableSize) {
        break;
      }
    }

    addLog(`❌ Key "${searchKey}" not found`);
    toast.error("Key not found");
  };

  const handleDelete = (index: number) => {
    if (hashTable[index]) {
      const key = hashTable[index]!.key;
      const newTable = [...hashTable];
      newTable[index] = null;
      setHashTable(newTable);
      addLog(`🗑️ Deleted key "${key}" from index ${index}`);
      toast.success("Entry deleted");
      setOperationsCount(prev => ({
        ...prev,
        deletions: prev.deletions + 1,
      }));
    }
  };

  const reset = () => {
    setHashTable(Array(tableSize).fill(null));
    setLog([]);
    setInputKey("");
    setInputValue("");
    setSearchKey("");
    setHighlightedIndex(null);
    setOperationsCount({
      insertions: 0,
      deletions: 0,
      searches: 0,
      collisions: 0,
    });
    toast.success("Hash table cleared");
  };

  const loadFactor = hashTable.filter((entry) => entry !== null).length / tableSize;

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Hash Table Visualization</span>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Load Factor: <span className="font-bold text-foreground">{(loadFactor * 100).toFixed(1)}%</span>
              </div>
              <Button variant="outline" size="sm" onClick={reset}>
                <RotateCcw className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {hashTable.map((entry, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  highlightedIndex === index
                    ? "bg-accent/20 border-accent shadow-md"
                    : entry !== null
                    ? "bg-primary/5 border-primary/20"
                    : "bg-muted/30 border-muted"
                }`}
              >
                <div className="w-12 text-center font-bold text-sm text-muted-foreground">
                  [{index}]
                </div>
                
                {entry ? (
                  <>
                    <div className="flex-1 flex items-center gap-4">
                      <div className="flex-1">
                        <span className="font-semibold text-primary">{entry.key}</span>
                        <span className="mx-2 text-muted-foreground">→</span>
                        <span className="text-foreground">{entry.value}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 text-muted-foreground text-sm italic">Empty slot</div>
                )}
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Insert Key-Value Pair</label>
            <div className="flex gap-2">
              <Input
                placeholder="Key"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleInsert()}
              />
              <Input
                placeholder="Value"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleInsert()}
              />
              <Button variant="hero" onClick={handleInsert}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Search by Key</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter key to search"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button variant="accent" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Hash Function Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Method:</span> Custom hash with linear probing
          </p>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Collision Resolution:</span> Linear probing (checks next slot)
          </p>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Table Size:</span> {tableSize} slots
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Operation Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 max-h-[200px] overflow-y-auto font-mono text-xs space-y-1">
            {log.length === 0 ? (
              <p className="text-muted-foreground">Operations will appear here...</p>
            ) : (
              log.slice(-15).map((entry, index) => (
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
});
