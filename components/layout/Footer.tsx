import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-3 px-6">
      <div className="container mx-auto flex flex-wrap justify-center md:justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="https://github.com/your-username/rest-client-app" 
            target="_blank"
            className="text-sm hover:underline hover:text-blue-600 dark:hover:text-blue-400"
          >
            GitHub
          </Link>
          <span className="text-sm text-gray-600 dark:text-gray-300">© {currentYear} REST Client</span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Built with Next.js and TailwindCSS
        </div>
      </div>
    </footer>
  );
}
