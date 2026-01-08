import { useState } from "react";
import { format } from "date-fns";
import { History, Apple, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFitnessPlan } from "@/contexts/FitnessPlanContext";
import { useTranslation } from "@/i18n/TranslationContext";

export const LogHistoryModal = () => {
  const [open, setOpen] = useState(false);
  const { foodLogs, exerciseLogs } = useFitnessPlan();
  const { t } = useTranslation();

  const sortedFoodLogs = [...foodLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const sortedExerciseLogs = [...exerciseLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const formatLogDate = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="h-4 w-4" />
          {t("logHistory")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t("activityHistory")}
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="nutrition" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nutrition" className="gap-2">
              <Apple className="h-4 w-4" />
              {t("nutrition")}
            </TabsTrigger>
            <TabsTrigger value="exercise" className="gap-2">
              <Dumbbell className="h-4 w-4" />
              {t("exercise")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="nutrition">
            <ScrollArea className="h-[300px] rounded-md border p-4">
              {sortedFoodLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {t("noFoodLogs")}
                </p>
              ) : (
                <div className="space-y-3">
                  {sortedFoodLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{log.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatLogDate(log.timestamp)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        {log.calories} kcal
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="exercise">
            <ScrollArea className="h-[300px] rounded-md border p-4">
              {sortedExerciseLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {t("noExerciseLogs")}
                </p>
              ) : (
                <div className="space-y-3">
                  {sortedExerciseLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{log.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatLogDate(log.timestamp)}
                        </p>
                      </div>
                      <Dumbbell className="h-4 w-4 text-primary" />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
