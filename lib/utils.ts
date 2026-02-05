import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'online': return 'bg-emerald-500';
    case 'offline': return 'bg-rose-500';
    case 'connecting': return 'bg-amber-500';
    default: return 'bg-slate-500';
  }
};
