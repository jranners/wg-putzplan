import {
    MoreVertical,
    CheckCircle2,
    Banknote,
    AlertTriangle,
    UserPlus,
    Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Activity } from "@/types";

interface ActivityFeedProps {
    activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    const getIcon = (type: Activity["type"]) => {
        switch (type) {
            case "maintenance":
                return CheckCircle2;
            case "finance":
                return Banknote;
            case "alert":
                return AlertTriangle;
            case "info":
                return UserPlus;
            default:
                return Info;
        }
    };

    const getStyles = (type: Activity["type"]) => {
        switch (type) {
            case "maintenance":
                return { color: "text-emerald-500", bg: "bg-emerald-500/10" };
            case "finance":
                return { color: "text-[#13b6ec]", bg: "bg-[#13b6ec]/10" };
            case "alert":
                return { color: "text-red-500", bg: "bg-red-500/10" };
            default:
                return { color: "text-white/40", bg: "bg-white/5" };
        }
    };

    return (
        <section className="flex flex-1 flex-col rounded-lg border border-white/5 bg-[#1A1A1A] p-5 md:p-6">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold tracking-tight text-white">
                    Letzte Aktivitäten
                </h3>
                <MoreVertical className="h-5 w-5 text-white/20" />
            </div>
            <div className="space-y-6 overflow-y-auto pr-2">
                {activities.map((item) => {
                    const Icon = getIcon(item.type);
                    const styles = getStyles(item.type);

                    return (
                        <div key={item.id} className="flex gap-4">
                            <div
                                className={cn(
                                    "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded",
                                    styles.bg
                                )}
                            >
                                <Icon className={cn("h-5 w-5", styles.color)} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">{item.title}</p>
                                <p className="mt-0.5 text-[11px] uppercase text-white/30">
                                    {item.meta}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
