import React, { useEffect, useState } from "react";
import axios from "axios";
import { Spin, message,Button } from "antd";
import { PlusOutlined, DeleteOutlined,UploadOutlined} from "@ant-design/icons";
import PropTypes from "prop-types";

const CloudinaryUploader = ({
  onUploadSuccess,
  uploadPreset,
  cloudName,
  buttonText = "Upload Image/Video",
  className,
  listType = "text",
  maxCount = 1,
  disabled = false,
  fileList = [],
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [validatedFileList, setValidatedFileList] = useState([]);

  // Validate and normalize fileList on mount and when it changes
  useEffect(() => {
    const normalizedFiles = fileList.map(file => ({
      uid: file.uid || `file-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name || getFileNameFromUrl(file.url) || "file",
      status: file.status || "done",
      url: file.url || file.thumbUrl || "",
      thumbUrl: file.thumbUrl || file.url || "",
      type: file.type || getFileTypeFromUrl(file.url || file.thumbUrl) || "image/jpeg"
    }));
    setValidatedFileList(normalizedFiles);
  }, [fileList]);

  // Helper function to extract file name from URL
  const getFileNameFromUrl = (url) => {
    if (!url) return "";
    return url.split('/').pop().split('?')[0];
  };

  // Helper function to guess file type from URL extension
  const getFileTypeFromUrl = (url) => {
    if (!url) return "";
    const extension = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return `image/${extension === 'jpg' ? 'jpeg' : extension}`;
    }
    if (['mp4', 'webm', 'ogg'].includes(extension)) {
      return `video/${extension}`;
    }
    return "";
  };

  const uploadFile = async (file) => {
    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );

      const fileUrl = response.data.secure_url;
      const fileType = file.type || getFileTypeFromUrl(fileUrl);

      const newFile = {
        uid: `uploaded-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: file.name || getFileNameFromUrl(fileUrl) || "uploaded-file",
        status: "done",
        url: fileUrl,
        thumbUrl: fileUrl,
        type: fileType,
      };

      const updatedFileList = [...validatedFileList, newFile].slice(-maxCount);
      onUploadSuccess(updatedFileList);
      return fileUrl;
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Failed to upload file");
      throw error;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset file input to allow uploading same file again
    e.target.value = null;

    try {
      await uploadFile(file);
    } catch (error) {
      // Error already handled in uploadFile
    }
  };

  const removeFile = (file) => {
    const updatedFileList = validatedFileList.filter((f) => f.uid !== file.uid);
    onUploadSuccess(updatedFileList);
  };

  const renderPreview = (file) => {
    if (!file || !file.type) {
      console.warn("Invalid file object in preview:", file);
      return <div>Invalid file</div>;
    }

    if (file.type.startsWith("image/")) {
      return (
        <img 
          src={file.url} 
          alt={file.name || "uploaded"} 
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/150?text=Image+Error";
          }}
        />
      );
    }

    if (file.type.startsWith("video/")) {
      return (
        <video 
          controls 
          style={{ width: "100%", height: "100%" }}
          poster={file.thumbUrl || "https://via.placeholder.com/150?text=Video"}
        >
          <source src={file.url} type={file.type} />
          Your browser does not support the video tag.
        </video>
      );
    }

    return (
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f0f0"
      }}>
        {file.name || "File"}
      </div>
    );
  };

  if (listType === "picture-card") {
    return (
      <div className={`cloudinary-uploader ${className || ""}`}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {validatedFileList.map((file) => (
            <div
              key={file.uid}
              style={{
                position: "relative",
                width: 100,
                height: 100,
                border: "1px solid #d9d9d9",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              {renderPreview(file)}
              {!disabled && (
                <DeleteOutlined
                  onClick={() => removeFile(file)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    color: "#f5222d",
                    background: "white",
                    borderRadius: "50%",
                    padding: 4,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                />
              )}
            </div>
          ))}

          {validatedFileList.length < maxCount && !disabled && (
            <label className="upload-button">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
                disabled={isUploading}
              />
              <div
                style={{
                  width: 100,
                  height: 100,
                  border: "1px dashed #d9d9d9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  cursor: "pointer",
                  background: "#fafafa",
                }}
              >
                {isUploading ? (
                  <Spin tip={`${progress}%`} />
                ) : (
                  <>
                    <PlusOutlined />
                    <div style={{ fontSize: 12, marginTop: 4 }}>{buttonText}</div>
                  </>
                )}
              </div>
            </label>
          )}
        </div>
      </div>
    );
  }

  // Text-style uploader (fallback)
  return (
    <div className={`cloudinary-uploader ${className || ""}`}>
      <label className="upload-button">
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
          disabled={isUploading || disabled}
        />
        {isUploading ? (
          <span>{`Uploading... ${progress}%`}</span>
        ) : (
          <Button icon={<UploadOutlined />}>{buttonText}</Button>
        )}
      </label>
      
      {validatedFileList.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {validatedFileList.map(file => (
            <div key={file.uid} style={{ marginBottom: 8 }}>
              {renderPreview(file)}
              {!disabled && (
                <Button 
                  icon={<DeleteOutlined />} 
                  onClick={() => removeFile(file)}
                  danger
                  size="small"
                  style={{ marginTop: 4 }}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

CloudinaryUploader.propTypes = {
  onUploadSuccess: PropTypes.func.isRequired,
  uploadPreset: PropTypes.string.isRequired,
  cloudName: PropTypes.string.isRequired,
  buttonText: PropTypes.string,
  className: PropTypes.string,
  listType: PropTypes.oneOf(["text", "picture-card"]),
  maxCount: PropTypes.number,
  disabled: PropTypes.bool,
  fileList: PropTypes.arrayOf(
    PropTypes.shape({
      uid: PropTypes.string,
      name: PropTypes.string,
      url: PropTypes.string,
      thumbUrl: PropTypes.string,
      type: PropTypes.string,
      status: PropTypes.string,
    })
  ),
};

CloudinaryUploader.defaultProps = {
  buttonText: "Upload Image/Video",
  listType: "text",
  maxCount: 1,
  disabled: false,
  fileList: [],
};

export default CloudinaryUploader;