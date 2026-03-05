/**
 * LoadingSpinner — animated leaf/spinner for AI processing states.
 */
export default function LoadingSpinner({ message = 'Processing...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400 spinner"></div>
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-green-300 spinner" style={{ animationDuration: '0.6s', animationDirection: 'reverse' }}></div>
      </div>
      <p className="text-sm text-emerald-400/80 font-medium">{message}</p>
    </div>
  );
}
