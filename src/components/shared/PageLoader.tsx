export const PageLoader = () => {
  const isDashboard = typeof window !== "undefined" && (
    window.location.pathname.startsWith('/client') || 
    window.location.pathname.startsWith('/freelancer') ||
    window.location.pathname.startsWith('/admin')
  );

  if (isDashboard) {
    return (
      <div className="min-h-screen bg-slate-50 flex overflow-hidden">
        {/* Sidebar Skeleton */}
        <div className="w-64 border-r border-slate-200 bg-white p-6 flex flex-col gap-6 hidden lg:flex flex-shrink-0">
          <div className="h-8 w-32 bg-slate-200 rounded-lg animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 w-full bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar Skeleton */}
          <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
            <div className="h-6 w-40 bg-slate-200 rounded-md animate-pulse" />
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse" />
              <div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Dashboard Body Skeleton */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {/* Banner Skeleton */}
            <div className="h-32 bg-gradient-to-r from-slate-200 to-slate-100 rounded-2xl animate-pulse" />

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-white rounded-2xl p-6 border border-slate-100 flex flex-col justify-between">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg animate-pulse" />
                  <div className="h-6 w-16 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>

            {/* Cards Grid Skeleton */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-72 bg-white rounded-2xl border border-slate-100 p-6">
                <div className="h-6 w-40 bg-slate-200 rounded animate-pulse mb-6" />
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full animate-pulse" />
                        <div className="space-y-1">
                          <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
                          <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="h-6 w-12 bg-slate-100 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-72 bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-center items-center">
                <div className="w-24 h-24 rounded-full border-8 border-slate-100 border-t-slate-200 animate-spin mb-4" />
                <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
    </div>
  );
};

export default PageLoader;
