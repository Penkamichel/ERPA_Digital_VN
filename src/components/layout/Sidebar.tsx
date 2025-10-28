import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Eye,
  DollarSign,
  Users,
  FileOutput,
  Settings,
  UserCog,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Implementation Review', href: '/plan-review', icon: FileText },
  { name: 'Action Center', href: '/monitoring', icon: Eye },
  { name: 'Disbursement', href: '/disbursement', icon: DollarSign },
  { name: 'Meetings', href: '/meetings', icon: Users },
  { name: 'Export', href: '/publications', icon: FileOutput },
  { name: 'Accounts', href: '/accounts', icon: UserCog },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow bg-emerald-800 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="flex items-center">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <LayoutDashboard className="w-8 h-8 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-white text-lg font-bold">Provincial Fund</h1>
                <p className="text-emerald-300 text-xs">Management Portal</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-900 text-white'
                      : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive ? 'text-white' : 'text-emerald-300'
                      }`}
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
