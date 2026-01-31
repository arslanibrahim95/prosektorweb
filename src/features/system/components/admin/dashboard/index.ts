// Dashboard Components Index
// Re-export all dashboard components for easier imports

export { UserAvatar, type UserRole } from './UserAvatar'
export { NotificationPanel, type Notification, type NotificationType } from './NotificationPanel'
export { StatsCard, StatsGrid, FinancialStatsCard, type StatsColor } from './StatsCards'
export {
    DashboardLineChart,
    DashboardAreaChart,
    DashboardBarChart,
    DashboardPieChart,
    RevenueChart
} from './DashboardCharts'
export { DataTable, type DataTableColumn } from './DataTable'
export { AuditLog, CompactAuditLog, type AuditLogEntry, type AuditAction, type AuditEntity } from './AuditLog'
export {
    ReportGenerator,
    DateRangePicker,
    QuickExport,
    type ReportType,
    type ExportFormat,
    type DateRange
} from './ReportExport'
