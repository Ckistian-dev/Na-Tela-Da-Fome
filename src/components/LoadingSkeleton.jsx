import React from 'react';

export const LoadingSkeleton = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Skeleton da Sobreposição */}
      <div className="relative">
        {/* Skeleton do Header */}
        <div className="w-full h-48 md:h-64 bg-gray-300 animate-pulse"></div>

        {/* Skeleton da InfoBar */}
        <div className="absolute top-0 left-0 w-full p-2 z-10">
          <div className="h-6 w-full bg-gray-400/50 animate-pulse rounded-md"></div>
        </div>
      </div>
      
      {/* Skeleton do InfoCard (antecipando o próximo passo) */}
      <div className="relative px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-4 md:p-6 -mt-12 md:-mt-16 animate-pulse">
            <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0"></div>
                <div className="w-full space-y-3 mt-2">
                    <div className="h-6 w-3/4 bg-gray-300 rounded"></div>
                    <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                </div>
            </div>
             <div className="h-px bg-gray-200 my-4"></div>
             <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
             </div>
        </div>
      </div>
      
      {/* Skeleton do MenuLayout */}
      <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 space-y-3">
            <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        {/* Products */}
        <div className="w-full md:w-3/4 space-y-6">
            <div className="h-8 w-1/3 bg-gray-300 rounded animate-pulse"></div>
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm animate-pulse">
                        <div className="w-24 h-24 bg-gray-200 rounded-md"></div>
                        <div className="flex-1 space-y-3">
                            <div className="h-5 w-3/4 bg-gray-300 rounded"></div>
                            <div className="h-4 w-full bg-gray-200 rounded"></div>
                            <div className="h-6 w-1/4 bg-gray-200 rounded mt-2"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

