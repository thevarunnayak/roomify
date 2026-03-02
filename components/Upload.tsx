import React, { useCallback, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import {
  CheckCircle2,
  CircleCheck,
  ImageIcon,
  Loader2,
  UploadIcon,
} from "lucide-react";
import { PROGRESS_INCREMENT, PROGRESS_INTERVAL_MS } from "../lib/constants";
import Button from "./ui/Button";

interface UploadProps {
  onComplete?: (base64Data: string, enhancement?: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { isSignedIn } = useOutletContext<AuthContext>();

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const processFile = useCallback(
    (file: File) => {
      if (!isSignedIn) return;

      setFile(file);
      setProgress(0);
      setBase64Data(null);
      setCustomText("");
      setIsGenerating(false);

      const reader = new FileReader();

      reader.onerror = () => {
        setFile(null);
        setProgress(0);
      };

      reader.onloadend = () => {
        const result = reader.result as string;
        setBase64Data(result);

        intervalRef.current = setInterval(() => {
          setProgress((prev) => {
            const next = prev + PROGRESS_INCREMENT;

            if (next >= 100) {
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              return 100;
            }

            return next;
          });
        }, PROGRESS_INTERVAL_MS);
      };

      reader.readAsDataURL(file);
    },
    [isSignedIn],
  );

  const handleGenerate = () => {
    if (!base64Data || !onComplete) return;

    setIsGenerating(true);

    onComplete(base64Data, customText.trim() ? customText.trim() : undefined);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isSignedIn) return;
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!isSignedIn) return;

    const droppedFile = e.dataTransfer.files[0];
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (droppedFile && allowedTypes.includes(droppedFile.type)) {
      processFile(droppedFile);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) return;

    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  return (
    <div className="upload">
      {!file ? (
        <div
          className={`dropzone ${isDragging ? "is-dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="drop-input"
            accept=".jpg,.jpeg,.png,.webp"
            disabled={!isSignedIn}
            onChange={handleChange}
          />

          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>
            <p>
              {isSignedIn
                ? "Click to upload or just drag and drop"
                : "Sign in or sign up with Puter to upload"}
            </p>
            <p className="help">Maximum file size 50 MB.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Upload Status Box */}
          <div className="upload-status">
            <div className="status-content">
              <div className="status-icon">
                {progress === 100 ? (
                  <CheckCircle2 className="check" />
                ) : (
                  <ImageIcon className="image" />
                )}
              </div>

              <h3>{file.name}</h3>

              <div className="progress">
                <div className="bar" style={{ width: `${progress}%` }} />
                <p className="status-text">
                  {progress < 100
                    ? "Analyzing Floor Plan..."
                    : "Upload Complete"}
                </p>
              </div>
            </div>
          </div>

          {/* Customization Section BELOW upload box */}
          {progress === 100 && (
            <div className="mt-6 flex flex-col gap-4">
              <textarea
                placeholder="Optional: Add customization"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                disabled={isGenerating}
                className="w-full min-h-30 p-4 text-sm rounded-xl border border-gray-300 
                          focus:outline-none focus:ring-2
                         transition resize-none"
              />

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 rounded-xl bg-primary text-white font-medium 
                          transition-all duration-200 
                          hover:scale-[1.01] active:scale-[0.99] 
                          disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    Generating <Loader2 className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    Generate <CircleCheck className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Upload;
