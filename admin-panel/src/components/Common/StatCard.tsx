import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { classNames } from '../../utils/helpers';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  change?: number;
  changeLabel?: string;
  iconColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
  iconColor = 'bg-slate-900 dark:bg-slate-100',
}) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{title}</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
        <div className={classNames('p-3 rounded-lg flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow', iconColor)}>
          <Icon className="h-5 w-5 text-white dark:text-slate-900" />
        </div>
      </div>
      
      {change !== undefined && (
        <div className="flex items-center gap-2">
          <div className={classNames(
            "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
            isPositive 
              ? "bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" 
              : "bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
          )}>
            {isPositive ? (
              <ArrowUpIcon className="w-3 h-3" />
            ) : (
              <ArrowDownIcon className="w-3 h-3" />
            )}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
          {changeLabel && (
            <span className="text-xs text-slate-500 dark:text-slate-400">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
