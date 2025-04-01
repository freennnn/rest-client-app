export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size];

  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-4 border-solid border-gray-300 border-t-transparent ${sizeClass}`}></div>
    </div>
  );
}
