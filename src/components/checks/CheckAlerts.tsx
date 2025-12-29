import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, FileWarning, Ban, Bell, ChevronRight } from "lucide-react";
import { CheckAlert } from "@/hooks/useChecks";

interface CheckAlertsProps {
  alerts: CheckAlert[];
  onNavigateToCheck: (checkId: string) => void;
}

const alertTypeConfig = {
  dishonor_deadline: {
    icon: Clock,
    label: 'ডিস অনার সময়সীমা',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  notice_deadline: {
    icon: FileWarning,
    label: 'লিগ্যাল নোটিশ সময়সীমা',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  case_deadline: {
    icon: AlertTriangle,
    label: 'মামলা দায়ের সময়সীমা',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
};

const CheckAlerts = ({ alerts, onNavigateToCheck }: CheckAlertsProps) => {
  const criticalAlerts = alerts.filter(a => a.is_overdue);
  const warningAlerts = alerts.filter(a => !a.is_overdue);

  if (alerts.length === 0) {
    return (
      <Card className="glass-card border-green-500/20">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/10 flex items-center justify-center">
            <Bell className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-green-500 font-medium">কোনো আসন্ন সতর্কতা নেই</p>
          <p className="text-sm text-muted-foreground mt-1">সব চেক সময়মতো আছে</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card className="glass-card border-destructive/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Ban className="w-5 h-5" />
              জরুরি ({criticalAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
            {criticalAlerts.map((alert) => {
              const config = alertTypeConfig[alert.type];
              return (
                <div
                  key={`${alert.check_id}-${alert.type}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                >
                  <div className="flex items-center gap-3">
                    <config.icon className="w-4 h-4 text-destructive" />
                    <div>
                      <p className="text-sm font-medium text-destructive">
                        চেক #{alert.check_number}
                      </p>
                      <p className="text-xs text-destructive/80">{alert.message}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigateToCheck(alert.check_id)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Warning Alerts */}
      {warningAlerts.length > 0 && (
        <Card className="glass-card border-yellow-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-500">
              <AlertTriangle className="w-5 h-5" />
              আসন্ন সময়সীমা ({warningAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
            {warningAlerts.map((alert) => {
              const config = alertTypeConfig[alert.type];
              return (
                <div
                  key={`${alert.check_id}-${alert.type}`}
                  className={`flex items-center justify-between p-3 rounded-lg ${config.bgColor} border ${config.borderColor}`}
                >
                  <div className="flex items-center gap-3">
                    <config.icon className={`w-4 h-4 ${config.color}`} />
                    <div>
                      <p className={`text-sm font-medium ${config.color}`}>
                        চেক #{alert.check_number}
                      </p>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`${config.borderColor} ${config.color}`}>
                      {alert.days_remaining} দিন
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigateToCheck(alert.check_id)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CheckAlerts;
