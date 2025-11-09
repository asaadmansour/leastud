import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/store/useTheme';
import { Button } from './ui/button';
import { cn } from '@/utils/cn';

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  const handleLinkClick = () => {
    // Close sidebar on mobile when link is clicked
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside className="w-64 border-r bg-card min-h-screen p-4 sm:p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Leastud</h1>
        <p className="text-sm text-muted-foreground">Quiz Management</p>
      </div>

      <nav className="flex-1 space-y-2">
        <Link to="/" onClick={handleLinkClick}>
          <motion.div
            whileHover={{ x: 4 }}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
              isActive('/')
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-medium">Dashboard</span>
          </motion.div>
        </Link>
      </nav>

      <div className="mt-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="w-full"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </aside>
  );
}

