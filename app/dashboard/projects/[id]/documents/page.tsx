import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import DocumentsGrid from "./DocumentsGrid";
import UploadDocument from "./UploadDocument";

export default async function DocumentsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch list of files in the 'sti' bucket, 'oasis' folder
  const { data: files, error } = await supabase.storage
    .from("sti")
    .list("oasis", {
      limit: 100,
      sortBy: { column: "name", order: "asc" },
    });

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl shadow-sm">
          <strong className="font-semibold mr-2">
            Error loading documents:
          </strong>
          {error.message}
        </div>
      </div>
    );
  }

  // Filter out any potential empty folder placeholders and only keep pdfs
  const validFiles =
    files?.filter(
      (file) =>
        file.name !== ".emptyFolderPlaceholder" &&
        file.name.toLowerCase().endsWith(".pdf"),
    ) || [];

  const paths = validFiles.map((file) => `oasis/${file.name}`);

  let documentsWithUrls: Array<{ id: string; name: string; url: string }> = [];

  if (paths.length > 0) {
    // Generate signed URLs valid for 1 hour
    const { data: urlsData, error: urlsError } = await supabase.storage
      .from("sti")
      .createSignedUrls(paths, 60 * 60);

    if (urlsError) {
      console.error("Error generating signed URLs:", urlsError);
    } else {
      documentsWithUrls = validFiles.map((file, index) => ({
        id: file.id || file.name, // Fallback to name if id is undefined
        name: file.name,
        url: urlsData?.[index]?.signedUrl || "",
      }));
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Oasis Documents</h1>
          <p className="text-gray-500 mt-1">
            Manage and view project documents from the oasis directory.
          </p>
        </div>
        <UploadDocument />
      </div>

      <DocumentsGrid documents={documentsWithUrls} />
    </div>
  );
}
