import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimeLog } from "@/types/TimeLog";
import { Edit, LucideIcon, Trash2 } from "lucide-react";

const TimeLogCard = ({
  timeLog,
  onEdit,
  setDeleteTimeLogId,
  setDeleteOpen,
  TypeIcon,
}: {
  timeLog: TimeLog;
  onEdit: (timeLog: TimeLog) => void;
  setDeleteTimeLogId: (timeLogId: string) => void;
  setDeleteOpen: (open: boolean) => void;
  TypeIcon: LucideIcon;
}) => {
  const startTime = timeLog.start_date ? parseISO(timeLog.start_date) : null;
  const endTime = timeLog.end_date ? parseISO(timeLog.end_date) : null;

  let durationString = "N/A";
  if (startTime && endTime) {
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    durationString = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}`;
  }

  const startTimeString = startTime ? format(startTime, "hh:mmaaa") : "N/A";
  const endTimeString = endTime ? format(endTime, "hh:mmaaa") : "N/A";

  return (
    <Card className="mb-4">
      <CardContent>
        <div className="flex flex-col">
          <div className="flex justify-between items-center">
            <p className="text-lg font-semibold flex items-center">
              <TypeIcon className="mr-2 w-4 h-4" />
              {timeLog.type}
            </p>
            <p className="text-lg">{durationString}</p>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">
                {startTimeString} - {endTimeString}
              </p>
              {timeLog.comment && <p className="text-xs">{timeLog.comment}</p>}
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(timeLog)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setDeleteTimeLogId(timeLog.id);
                  setDeleteOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { TimeLogCard };
