import { forwardRef, useImperativeHandle, useRef } from 'react';
import { FileUp, LoaderCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useWorkspaceStore } from '../store/workspace-store';

export interface UploadButtonHandle {
  open: () => void;
}

interface UploadButtonProps {
  className?: string;
  compact?: boolean;
}

export const UploadButton = forwardRef<UploadButtonHandle, UploadButtonProps>(function UploadButton(
  { className, compact = false },
  ref,
) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const openPdfFile = useWorkspaceStore((state) => state.openPdfFile);
  const isImportingPdf = useWorkspaceStore((state) => state.isImportingPdf);

  useImperativeHandle(ref, () => ({
    open: () => inputRef.current?.click(),
  }));

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          void openPdfFile(file);
          event.target.value = '';
        }}
      />
      <Button
        type="button"
        variant={compact ? 'outline' : 'accent'}
        size={compact ? 'sm' : 'default'}
        className={className}
        onClick={() => inputRef.current?.click()}
        disabled={isImportingPdf}
      >
        {isImportingPdf ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
        {compact ? 'Upload PDF' : isImportingPdf ? 'Importing PDF...' : 'Upload PDF'}
      </Button>
    </>
  );
});
