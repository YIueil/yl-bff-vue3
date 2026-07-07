export interface DemoNavItem {
  key: string
  label: string
  icon: string
  active?: boolean
}

export interface DemoMetric {
  label: string
  value: string
  trend: string
  tone: 'blue' | 'green' | 'amber' | 'rose'
}

export interface DemoTrafficItem {
  label: string
  value: string
  percent: number
}

export interface DemoActivity {
  key: string
  title: string
  time: string
}

export interface DemoContact {
  key: string
  name: string
  role: string
  initials: string
}

export const favoriteItems: DemoNavItem[] = [
  { key: 'overview', label: 'Overview', icon: 'mdi:view-dashboard-outline', active: true },
  { key: 'projects', label: 'Projects', icon: 'mdi:folder-outline' },
  { key: 'reports', label: 'Reports', icon: 'mdi:file-chart-outline' }
]

export const pageItems: DemoNavItem[] = [
  { key: 'customers', label: 'Customers', icon: 'mdi:account-group-outline' },
  { key: 'orders', label: 'Orders', icon: 'mdi:clipboard-text-outline' },
  { key: 'messages', label: 'Messages', icon: 'mdi:message-text-outline' },
  { key: 'settings', label: 'Settings', icon: 'mdi:cog-outline' }
]

export const metricItems: DemoMetric[] = [
  { label: 'Views', value: '721K', trend: '+11.2%', tone: 'blue' },
  { label: 'Visits', value: '367K', trend: '+8.4%', tone: 'green' },
  { label: 'New users', value: '1,156', trend: '+4.9%', tone: 'amber' },
  { label: 'Active users', value: '239K', trend: '-2.1%', tone: 'rose' }
]

export const deviceTrafficItems: DemoTrafficItem[] = [
  { label: 'Desktop', value: '64%', percent: 64 },
  { label: 'Mobile', value: '28%', percent: 28 },
  { label: 'Tablet', value: '8%', percent: 8 }
]

export const regionTrafficItems: DemoTrafficItem[] = [
  { label: 'United States', value: '38.6K', percent: 78 },
  { label: 'China', value: '24.1K', percent: 52 },
  { label: 'Germany', value: '18.7K', percent: 41 },
  { label: 'Brazil', value: '9.4K', percent: 24 }
]

export const activityItems: DemoActivity[] = [
  { key: 'deploy', title: 'Production deploy completed', time: '2m ago' },
  { key: 'comment', title: 'Design review received 8 comments', time: '18m ago' },
  { key: 'report', title: 'Weekly traffic report is ready', time: '46m ago' },
  { key: 'invoice', title: 'Billing workspace synced', time: '1h ago' }
]

export const contactItems: DemoContact[] = [
  { key: 'lyra', name: 'Lyra Chen', role: 'Product', initials: 'LC' },
  { key: 'noah', name: 'Noah Kim', role: 'Design', initials: 'NK' },
  { key: 'mina', name: 'Mina Patel', role: 'Engineering', initials: 'MP' }
]
