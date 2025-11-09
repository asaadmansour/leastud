import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { cn } from '@/utils/cn';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
  onClick?: () => void;
}

export function BackButton({ to, label = 'Back to Subjects', className, onClick }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate('/');
    }
  };

  return (
    <motion.div
      whileHover={{ x: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        variant="ghost"
        onClick={handleClick}
        className={cn(
          'rounded-lg shadow-sm hover:shadow-md transition-all border border-border/50 hover:border-border text-sm sm:text-base min-h-[40px] sm:min-h-[36px] touch-manipulation',
          className
        )}
      >
        <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">Back</span>
      </Button>
    </motion.div>
  );
}


