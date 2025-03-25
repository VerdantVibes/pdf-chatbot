import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { uploadPdf } from '@/lib/api/pdf';

interface FileUploadProps {
  className?: string;
  onUploadComplete: (fileInfo: { id: string; filename: string }) => void;
}

export const FileUpload = ({ onUploadComplete }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files are allowed');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadPdf(formData);
      
      if (response.status === 'success' || response.status === 'exists') {
        // Navigate to chat with the uploaded file
        navigate('/chat', {
          state: {
            selectedRows: [response.file.id],
            faissIndexPath: response.file.faiss_index_path
          }
        });
        toast.success('File uploaded successfully');
        onUploadComplete({ id: response.file.id, filename: response.file.filename });
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="text-center space-y-6">
        <div className="p-4 rounded-full bg-gray-100 inline-block">
          <Upload className="h-8 w-8 text-gray-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Upload a PDF file</h3>
          <p className="text-sm text-gray-500">
            Upload a PDF file to start chatting with its contents
          </p>
        </div>
        <div className="flex justify-center">
          <Button
            variant="outline"
            disabled={isUploading}
            className="relative"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            {isUploading ? 'Uploading...' : 'Select PDF file'}
            <input
              id="file-upload"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </Button>
        </div>
      </div>
    </div>
  );
};
