"use client";

import { FileText, Download, Eye } from "lucide-react";

type Document = {
  id: string;
  name: string;
  url: string;
};

export default function DocumentsGrid({ documents }: { documents: Document[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="border border-gray-200 rounded-xl p-5 flex flex-col items-center bg-white shadow-sm hover:shadow-md transition-all duration-300 group"
        >
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <FileText size={32} strokeWidth={1.5} />
          </div>
          
          <h3 className="text-center font-medium text-gray-800 text-sm mb-5 truncate w-full" title={doc.name}>
            {doc.name}
          </h3>
          
          <div className="flex w-full gap-3 mt-auto">
            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
            >
              <Eye size={16} />
              View
            </a>
            <a
              href={doc.url}
              download={doc.name}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              <Download size={16} />
              Save
            </a>
          </div>
        </div>
      ))}
      
      {documents.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-16 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
          <FileText size={48} className="text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No documents found</h3>
          <p className="text-gray-400">There are no PDF files in the oasis folder.</p>
        </div>
      )}
    </div>
  );
}
