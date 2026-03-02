import { Badge } from "@/components/ui/badge";
import type { MachineResult } from "@/context/LisDataContext";

interface StatusBadgeProps {
  status: MachineResult["status"];
  size?: "sm" | "default";
}

const STATUS_CONFIG = {
  matched: { label: "Matched", cls: "badge-matched" },
  unmatched: { label: "Unmatched", cls: "badge-unmatched" },
  transferred: { label: "Transferred", cls: "badge-transferred" },
  failed: { label: "Failed", cls: "badge-failed" },
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.failed;
  return (
    <Badge
      className={`${config.cls} font-medium border ${
        size === "sm" ? "text-xs px-1.5 py-0" : "text-xs px-2 py-0.5"
      }`}
    >
      {config.label}
    </Badge>
  );
}

export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      className={`font-medium border text-xs px-1.5 py-0 ${
        isActive ? "badge-active" : "badge-inactive"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

export function ProtocolBadge({
  protocol,
}: { protocol: "HL7" | "ASTM" | "Custom" }) {
  const cls =
    protocol === "HL7"
      ? "bg-[oklch(0.65_0.16_220)]/15 text-[oklch(0.72_0.16_215)] border-[oklch(0.65_0.16_220)]/30"
      : protocol === "ASTM"
        ? "bg-[oklch(0.65_0.16_280)]/15 text-[oklch(0.72_0.16_280)] border-[oklch(0.65_0.16_280)]/30"
        : "bg-[oklch(0.7_0.2_45)]/15 text-[oklch(0.76_0.2_50)] border-[oklch(0.7_0.2_45)]/30";
  return (
    <Badge className={`font-medium border text-xs px-1.5 py-0 ${cls}`}>
      {protocol}
    </Badge>
  );
}

export function TransferStatusBadge({
  status,
}: { status: "success" | "failed" }) {
  return (
    <Badge
      className={`font-medium border text-xs px-1.5 py-0 ${
        status === "success" ? "badge-matched" : "badge-failed"
      }`}
    >
      {status === "success" ? "Success" : "Failed"}
    </Badge>
  );
}
