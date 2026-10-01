import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 md:left-64">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        aria-label="Open sidebar"
      >
        <Menu size={24} />
      </button>

      <h2 className="text-lg font-semibold text-slate-800">
        Inventory Dashboard
      </h2>

      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
          A
        </div>

        <div className="hidden sm:block">
          <p className="text-sm font-medium text-slate-800">
            Admin
          </p>

          <p className="text-xs text-slate-500">
            Administrator
          </p>
        </div>
      </div>
    </header>
  );
}

export default Header;
