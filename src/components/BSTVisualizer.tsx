import { useState, useRef, useEffect, forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Play, Plus, Trash2, Search, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;
  y?: number;
}

export const BSTVisualizer = forwardRef<SVGSVGElement>((props,ref) => {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [animationSpeed, setAnimationSpeed] = useState([50]);
  const [searchValue, setSearchValue] = useState("");
  const [deleteValue, setDeleteValue] = useState("");
  const [highlightedNodes, setHighlightedNodes] = useState<Set<number>>(new Set());
  const [log, setLog] = useState<string[]>([]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const addLog = (message: string) => {
    setLog((prev) => [...prev, message]);
  };

  const insertNode = (node: TreeNode | null, value: number): TreeNode => {
    if (node === null) {
      addLog(`✅ Inserted node ${value}`);
      return { value, left: null, right: null };
    }

    if (value < node.value) {
      addLog(`Comparing ${value} < ${node.value}, going left`);
      node.left = insertNode(node.left, value);
    } else if (value > node.value) {
      addLog(`Comparing ${value} > ${node.value}, going right`);
      node.right = insertNode(node.right, value);
    } else {
      addLog(`⚠️ Node ${value} already exists`);
    }

    return node;
  };

  const handleInsert = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      toast.error("Please enter a valid number");
      return;
    }

    setTree((prevTree) => insertNode(prevTree, value));
    setInputValue("");
    toast.success(`Inserted ${value}`);
  };

  const searchNode = (node: TreeNode | null, value: number, path: number[] = []): boolean => {
    if (node === null) {
      addLog(`❌ Node ${value} not found`);
      return false;
    }

    path.push(node.value);
    setHighlightedNodes(new Set(path));

    if (value === node.value) {
      addLog(`✅ Found node ${value}`);
      return true;
    }

    if (value < node.value) {
      addLog(`Searching ${value} < ${node.value}, going left`);
      return searchNode(node.left, value, path);
    } else {
      addLog(`Searching ${value} > ${node.value}, going right`);
      return searchNode(node.right, value, path);
    }
  };

  const handleSearch = () => {
    const value = parseInt(searchValue);
    if (isNaN(value)) {
      toast.error("Please enter a valid number");
      return;
    }

    setHighlightedNodes(new Set());
    const found = searchNode(tree, value);
    
    setTimeout(() => {
      setHighlightedNodes(new Set());
    }, 2000);
  };

  const findMin = (node: TreeNode): TreeNode => {
    let current = node;
    while (current.left !== null) {
      current = current.left;
    }
    return current;
  };

  const deleteNode = (node: TreeNode | null, value: number): TreeNode | null => {
    if (node === null) {
      addLog(`❌ Node ${value} not found for deletion`);
      return null;
    }

    if (value < node.value) {
      addLog(`Comparing ${value} < ${node.value}, going left`);
      node.left = deleteNode(node.left, value);
    } else if (value > node.value) {
      addLog(`Comparing ${value} > ${node.value}, going right`);
      node.right = deleteNode(node.right, value);
    } else {
      // Node to delete found
      addLog(`Found node ${value} to delete`);
      
      // Case 1: Leaf node
      if (node.left === null && node.right === null) {
        addLog(`Deleting leaf node ${value}`);
        return null;
      }
      
      // Case 2: Node with one child
      if (node.left === null) {
        addLog(`Replacing node ${value} with right child`);
        return node.right;
      }
      if (node.right === null) {
        addLog(`Replacing node ${value} with left child`);
        return node.left;
      }
      
      // Case 3: Node with two children
      const successor = findMin(node.right);
      addLog(`Found successor ${successor.value} for node ${value}`);
      node.value = successor.value;
      node.right = deleteNode(node.right, successor.value);
    }

    return node;
  };

  const handleDelete = () => {
    const value = parseInt(deleteValue);
    if (isNaN(value)) {
      toast.error("Please enter a valid number");
      return;
    }

    setTree((prevTree) => {
      const newTree = deleteNode(prevTree, value);
      if (newTree !== prevTree) {
        toast.success(`Deleted ${value}`);
      } else {
        toast.error(`Could not find node ${value}`);
      }
      return newTree;
    });
    setDeleteValue("");
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Prevent browser zoom if Ctrl key is pressed
    if (e.ctrlKey) {
      e.preventDefault();
    }
    
    // Always prevent default to stop page scrolling
    e.preventDefault();
    e.stopPropagation();

    // Only handle zoom when Ctrl is not pressed (to avoid conflicts with browser zoom)
    if (!e.ctrlKey) {
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prevZoom => Math.min(Math.max(prevZoom * scaleFactor, 0.1), 2));
    }
  };

  const calculateNodePositions = (
    node: TreeNode | null,
    x: number,
    y: number,
    horizontalSpacing: number
  ): TreeNode | null => {
    if (node === null) return null;

    const newNode = { ...node, x, y };
    newNode.left = calculateNodePositions(node.left, x - horizontalSpacing, y + 80, horizontalSpacing / 2);
    newNode.right = calculateNodePositions(node.right, x + horizontalSpacing, y + 80, horizontalSpacing / 2);

    return newNode;
  };

  const renderTree = () => {
    if (!tree) return null;

    const getTreeDepth = (node: TreeNode | null): number => {
      if (!node) return 0;
      return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right));
    };

    const depth = getTreeDepth(tree);
    const baseSpacing = Math.max(150, 800 / depth); // Adjust spacing based on depth
    const positionedTree = calculateNodePositions(tree, 0, 50, baseSpacing);

    const nodes: JSX.Element[] = [];
    const edges: JSX.Element[] = [];

    const traverse = (node: TreeNode | null) => {
      if (!node || node.x === undefined || node.y === undefined) return;

      // Draw edges first (so they appear behind nodes)
      if (node.left && node.left.x !== undefined && node.left.y !== undefined) {
        edges.push(
          <line
            key={`edge-${node.value}-${node.left.value}`}
            x1={node.x}
            y1={node.y}
            x2={node.left.x}
            y2={node.left.y}
            stroke="hsl(var(--border))"
            strokeWidth="2"
            className="transition-all duration-300"
          />
        );
      }

      if (node.right && node.right.x !== undefined && node.right.y !== undefined) {
        edges.push(
          <line
            key={`edge-${node.value}-${node.right.value}`}
            x1={node.x}
            y1={node.y}
            x2={node.right.x}
            y2={node.right.y}
            stroke="hsl(var(--border))"
            strokeWidth="2"
            className="transition-all duration-300"
          />
        );
      }

      // Draw nodes
      const isHighlighted = highlightedNodes.has(node.value);
      nodes.push(
        <g key={`node-${node.value}`} className="transition-all duration-300">
          <circle
            cx={node.x}
            cy={node.y}
            r="25"
            fill={isHighlighted ? "hsl(var(--accent))" : "hsl(var(--primary))"}
            stroke={isHighlighted ? "hsl(var(--accent))" : "hsl(var(--primary))"}
            strokeWidth="3"
            className="transition-all duration-300"
            style={{
              filter: isHighlighted ? "drop-shadow(0 0 10px hsl(var(--accent)))" : "none",
            }}
          />
          <text
            x={node.x}
            y={node.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="hsl(var(--primary-foreground))"
            fontSize="16"
            fontWeight="600"
          >
            {node.value}
          </text>
        </g>
      );

      traverse(node.left);
      traverse(node.right);
    };

    traverse(positionedTree);

    return (
      <svg
        ref={ref}
        width="100%"
        height="500"
        className="bg-card rounded-lg border shadow-sm cursor-move touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ 
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
      >
        <g transform={`translate(${pan.x + 400}, ${pan.y + 50}) scale(${zoom})`}>
          {edges}
          {nodes}
        </g>
      </svg>
    );
  };

  const handleReset = () => {
    setTree(null);
    setLog([]);
    setHighlightedNodes(new Set());
    toast.success("Tree cleared");
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Interactive Canvas</span>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tree ? renderTree() : (
            <div className="h-[500px] flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground">Insert nodes to start building your tree</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Insert Node</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Enter value"
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
              <label className="text-sm font-medium">Delete Node</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Delete value"
                  value={deleteValue}
                  onChange={(e) => setDeleteValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleDelete()}
                />
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search Node</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Search value"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button variant="accent" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Animation Speed</label>
            <Slider
              value={animationSpeed}
              onValueChange={setAnimationSpeed}
              min={10}
              max={100}
              step={10}
              className="w-full"
            />
          </div>
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
