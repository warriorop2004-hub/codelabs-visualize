import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw, Server, Smartphone } from "lucide-react";
import { toast } from "sonner";

type Step = 0 | 1 | 2 | 3 | 4;

interface Packet {
  id: number;
  type: "SYN" | "SYN-ACK" | "ACK" | "DATA";
  from: "client" | "server";
  x: number;
  y: number;
  active: boolean;
}

export type TCPVisualizerHandle = {
  start: () => Promise<void>;
  pause: () => void;
  reset: () => void;
  getState: () => {
    currentStep: Step;
    packets: Packet[];
    isAnimating: boolean;
    log: string[];
  };
};

// Replace the original component export with a forwardRef wrapper
export const TCPVisualizer = forwardRef<TCPVisualizerHandle>((props, ref) => {
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  // stable ref to allow cancelling animation loops
  const isAnimatingRef = useRef<boolean>(false);

  // keep ref in sync with state
  useEffect(() => {
    isAnimatingRef.current = isAnimating;
  }, [isAnimating]);

  const addLog = (message: string) => {
    setLog((prev) => [...prev, message]);
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const animatePacket = async (
    type: Packet["type"],
    from: "client" | "server",
    allowWhileIdle = false // new param: permit animation even when not in handshake
  ) => {
    const newPacket: Packet = {
      id: Date.now(),
      type,
      from,
      x: from === "client" ? 20 : 80,
      y: 50,
      active: true,
    };

    setPackets((prev) => [...prev, newPacket]);

    // Animate movement
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      // allow early cancel only when not explicitly allowed while idle
      if (!allowWhileIdle && !isAnimatingRef.current) {
        setPackets((prev) => prev.filter((p) => p.id !== newPacket.id));
        return;
      }

      await sleep(30);

      // check again after sleep
      if (!allowWhileIdle && !isAnimatingRef.current) {
        setPackets((prev) => prev.filter((p) => p.id !== newPacket.id));
        return;
      }

      setPackets((prev) =>
        prev.map((p) =>
          p.id === newPacket.id
            ? {
                ...p,
                x: from === "client" ? 20 + (60 * i) / steps : 80 - (60 * i) / steps,
              }
            : p
        )
      );
    }

    await sleep(500);
    if (!allowWhileIdle && !isAnimatingRef.current) {
      setPackets((prev) => prev.filter((p) => p.id !== newPacket.id));
      return;
    }
    setPackets((prev) => prev.filter((p) => p.id !== newPacket.id));
  };

  const startHandshake = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    isAnimatingRef.current = true;
    setCurrentStep(0);
    setPackets([]);
    setLog([]);

    addLog("🚀 Starting TCP Three-Way Handshake...");
    await sleep(500);

    // Step 1: SYN
    setCurrentStep(1);
    addLog("📤 Client → Server: SYN (Sequence Number: 1000)");
    addLog("Client: 'I want to establish a connection'");
    await animatePacket("SYN", "client");
    await sleep(500);

    // Step 2: SYN-ACK
    setCurrentStep(2);
    addLog("📥 Server → Client: SYN-ACK (Seq: 2000, Ack: 1001)");
    addLog("Server: 'I acknowledge your SYN and here's my SYN'");
    await animatePacket("SYN-ACK", "server");
    await sleep(500);

    // Step 3: ACK
    setCurrentStep(3);
    addLog("📤 Client → Server: ACK (Ack: 2001)");
    addLog("Client: 'I acknowledge your SYN-ACK'");
    await animatePacket("ACK", "client");
    await sleep(500);

    // Step 4: Connected
    setCurrentStep(4);
    addLog("✅ Connection Established! Ready to transfer data.");
    toast.success("TCP handshake completed!");

    setIsAnimating(false);
    isAnimatingRef.current = false;
  };

  const reset = () => {
    setCurrentStep(0);
    setPackets([]);
    setLog([]);
    setIsAnimating(false);
    isAnimatingRef.current = false;
  };

  // new: send a data packet from client and get an ACK from server
  const sendData = async (payload = "hello") => {
    if (currentStep !== 4) {
      toast.error("Connection not established — cannot send data");
      return;
    }

    addLog(`📤 Client → Server: DATA (payload: "${payload}")`);
    // allow animation while idle so we don't need to flip isAnimating for this
    await animatePacket("DATA", "client", true);

    // small delay to simulate processing
    await sleep(300);

    addLog(`📥 Server → Client: ACK (for payload)`);
    await animatePacket("ACK", "server", true);
  };

  // expose imperative methods
  useImperativeHandle(
    ref,
    () => ({
      start: async () => {
        return startHandshake();
      },
      pause: () => {
        setIsAnimating(false);
        isAnimatingRef.current = false;
        toast.info("Handshake paused");
      },
      reset: () => {
        reset();
      },
      getState: () => ({
        currentStep,
        packets,
        isAnimating,
        log,
      }),
      sendData, // exposed so parent can trigger packets programmatically
    }),
    // keep the handle up-to-date
    [startHandshake, reset, currentStep, packets, isAnimating, log, sendData]
  );

  const getStepDescription = () => {
    switch (currentStep) {
      case 0:
        return "Ready to start. Click 'Start Handshake' to begin.";
      case 1:
        return "Step 1: Client sends SYN packet to initiate connection";
      case 2:
        return "Step 2: Server responds with SYN-ACK to acknowledge";
      case 3:
        return "Step 3: Client sends ACK to complete handshake";
      case 4:
        return "Connection established! Data transfer can begin.";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>TCP Three-Way Handshake</span>
            <div className="flex gap-2">
              <Badge variant={currentStep === 4 ? "default" : "secondary"}>
                {currentStep === 4 ? "Connected" : currentStep === 0 ? "Idle" : "Connecting..."}
              </Badge>
              <Button variant="outline" size="sm" onClick={reset} disabled={isAnimating}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-[400px] bg-muted/20 rounded-lg p-8">
            {/* Client */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 text-center">
              <div className="p-6 bg-primary rounded-lg shadow-lg mb-3">
                <Smartphone className="h-12 w-12 text-primary-foreground mx-auto" />
              </div>
              <p className="font-semibold">Client</p>
              <p className="text-xs text-muted-foreground">192.168.1.100</p>
            </div>

            {/* Server */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-center">
              <div className="p-6 bg-secondary rounded-lg shadow-lg mb-3">
                <Server className="h-12 w-12 text-secondary-foreground mx-auto" />
              </div>
              <p className="font-semibold">Server</p>
              <p className="text-xs text-muted-foreground">192.168.1.1:80</p>
            </div>

            {/* Connection Line */}
            <div className="absolute left-[20%] right-[20%] top-1/2 border-t-2 border-dashed border-border -translate-y-1/2" />

            {/* Animated Packets */}
            {packets.map((packet) => (
              <div
                key={packet.id}
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-100"
                style={{ left: `${packet.x}%` }}
              >
                <div className="p-3 bg-accent rounded-lg shadow-lg animate-pulse">
                  <p className="text-xs font-bold text-accent-foreground whitespace-nowrap">
                    {packet.type}
                  </p>
                </div>
              </div>
            ))}

            {/* Step Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center max-w-md">
              <p className="text-sm text-muted-foreground bg-background/80 backdrop-blur px-4 py-2 rounded-lg">
                {getStepDescription()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Controls</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Start Handshake button (existing) */}
          <Button
            variant="hero"
            className="w-full mb-2"
            onClick={startHandshake}
            disabled={isAnimating}
          >
            <Play className="h-4 w-4" />
            {isAnimating ? "Handshake in Progress..." : "Start Handshake"}
          </Button>

          {/* New: Send Packet button (enabled only when connected) */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => sendData()}
            disabled={currentStep !== 4}
          >
            Send Packet
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Handshake Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className={`p-3 rounded-lg border ${currentStep >= 1 ? "bg-primary/10 border-primary" : "bg-muted/50"}`}>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={currentStep >= 1 ? "default" : "outline"}>Step 1</Badge>
              <span className="font-semibold text-sm">SYN</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Client sends SYN packet with initial sequence number
            </p>
          </div>

          <div className={`p-3 rounded-lg border ${currentStep >= 2 ? "bg-secondary/10 border-secondary" : "bg-muted/50"}`}>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={currentStep >= 2 ? "default" : "outline"}>Step 2</Badge>
              <span className="font-semibold text-sm">SYN-ACK</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Server acknowledges SYN and sends its own SYN
            </p>
          </div>

          <div className={`p-3 rounded-lg border ${currentStep >= 3 ? "bg-accent/10 border-accent" : "bg-muted/50"}`}>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={currentStep >= 3 ? "default" : "outline"}>Step 3</Badge>
              <span className="font-semibold text-sm">ACK</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Client acknowledges server's SYN, connection established
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Connection Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 max-h-[200px] overflow-y-auto font-mono text-xs space-y-1">
            {log.length === 0 ? (
              <p className="text-muted-foreground">Start handshake to see the process...</p>
            ) : (
              log.map((entry, index) => (
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
